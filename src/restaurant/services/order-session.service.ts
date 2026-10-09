import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ecuadorOrderTimestamp, ecuadorTodayBounds } from '../../common/utils/date.util';
import { ResponseUtil } from '../../common/utils/response.util';
import { CustomerOrder, CustomerOrderItem, CustomerOrderItemExtra, MenuItemExtra, RestaurantTable, TableSession } from '../../database/entities';
import {
  CreateCustomerOrderRequestDto, CreateSessionAndOrderRequestDto, CustomerOrderDto, CustomerOrderItemDto,
  OrderItemsEventDto, OrderStatus, ReceptionOrderEventDto, TableSessionDto,
} from '../dto/restaurant.dto';
import { ReceptionSseService } from './reception-sse.service';

@Injectable()
export class OrderSessionService {
  private static readonly SESSION_OPEN = 'activa';
  private static readonly ITEM_PENDING = 'PENDING';
  private static readonly CREATE_ORDER = 'nuevo';

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CustomerOrder) private readonly orders: Repository<CustomerOrder>,
    @InjectRepository(CustomerOrderItem) private readonly items: Repository<CustomerOrderItem>,
    @InjectRepository(CustomerOrderItemExtra) private readonly itemExtras: Repository<CustomerOrderItemExtra>,
    @InjectRepository(RestaurantTable) private readonly tables: Repository<RestaurantTable>,
    @InjectRepository(TableSession) private readonly sessions: Repository<TableSession>,
    private readonly sse: ReceptionSseService,
  ) {}

  async confirmOrder(dto: CreateSessionAndOrderRequestDto) {
    const order = await this.dataSource.transaction(async (manager) => {
      const session = await this.findOpenSessionOrCreate(manager, dto.tableSession);
      const savedOrder = await this.createOrder(manager, dto.customerOrder, session);
      await this.createOrderItems(manager, dto.items, savedOrder);
      return savedOrder;
    });

    const event = await this.buildReceptionOrderEvent(order);
    this.sse.notifyNewOrder(event);
    this.sse.emitDashboardUpdated({ reason: 'ORDER_CREATED' });
    return ResponseUtil.success({ idCustomerOrder: Number(order.id), orderCode: order.orderCode, status: order.status }, 'Pedido creado correctamente');
  }

  private async findOpenSessionOrCreate(manager: EntityManager, dto: TableSessionDto): Promise<TableSession> {
    if (dto?.idTable == null) throw new BadRequestException('El número de mesa es obligatorio');
    const table = await manager.getRepository(RestaurantTable).findOneBy({ tableNumber: dto.idTable });
    if (!table) throw new NotFoundException(`No existe una mesa con número: ${dto.idTable}`);
    const existing = await manager.getRepository(TableSession).findOneBy({ idTable: table.id, status: OrderSessionService.SESSION_OPEN });
    if (existing) return existing;
    const session = manager.getRepository(TableSession).create({
      idTable: table.id, status: OrderSessionService.SESSION_OPEN, guestCount: dto.guestCount ?? null, notes: dto.notes ?? null,
      idOpenedBy: dto.idOpenedBy == null ? null : String(dto.idOpenedBy), idClosedBy: dto.idClosedBy == null ? null : String(dto.idClosedBy),
    });
    return manager.getRepository(TableSession).save(session);
  }

  private async createOrder(manager: EntityManager, dto: CustomerOrderDto, session: TableSession): Promise<CustomerOrder> {
    const order = manager.getRepository(CustomerOrder).create({
      idTable: session.idTable, idTableSession: session.id, idCreatedByStaff: dto.idCreatedByStaff == null ? null : String(dto.idCreatedByStaff),
      orderCode: `ORD-${ecuadorOrderTimestamp()}`, status: OrderSessionService.CREATE_ORDER,
      subtotal: dto.subtotal ?? 0, taxAmount: dto.taxAmount ?? 0, discountAmount: dto.discountAmount ?? 0,
      serviceChargeAmount: dto.serviceChargeAmount ?? 0, tipAmount: dto.tipAmount ?? 0, total: dto.total ?? 0,
      notes: dto.notes ?? null, preparationStartedAt: dto.preparationStartedAt ? new Date(dto.preparationStartedAt) : null,
    });
    return manager.getRepository(CustomerOrder).save(order);
  }

  private async createOrderItems(manager: EntityManager, dtos: CustomerOrderItemDto[] | undefined, order: CustomerOrder): Promise<void> {
    for (const dto of dtos ?? []) {
      if (dto.idStation == null) throw new BadRequestException('El idStation es obligatorio');
      const item = await manager.getRepository(CustomerOrderItem).save(manager.getRepository(CustomerOrderItem).create({
        idCustomerOrder: order.id, idMenuItem: dto.idMenuItem == null ? null : String(dto.idMenuItem), idStation: String(dto.idStation),
        status: OrderSessionService.ITEM_PENDING, productNameSnapshot: dto.productNameSnapshot, unitPrice: dto.unitPrice,
        quantity: dto.quantity, subtotal: dto.subtotal, notes: dto.notes ?? null,
      }));
      await this.createOrderItemExtras(manager, dto.extras, item);
    }
  }

  private async createOrderItemExtras(manager: EntityManager, dtos: CustomerOrderItemDto['extras'], item: CustomerOrderItem): Promise<void> {
    for (const dto of dtos ?? []) {
      if (dto.idMenuItemExtra == null) throw new BadRequestException('El idMenuItemExtra es obligatorio');
      const menuExtra = await manager.getRepository(MenuItemExtra).findOneBy({ id: String(dto.idMenuItemExtra) });
      if (!menuExtra) throw new NotFoundException(`Extra no encontrado: ${dto.idMenuItemExtra}`);
      const quantity = dto.quantity ?? 1;
      const subtotal = menuExtra.extraPrice * quantity * item.quantity;
      await manager.getRepository(CustomerOrderItemExtra).save(manager.getRepository(CustomerOrderItemExtra).create({
        idOrderItem: item.id, idMenuItemExtra: menuExtra.id, extraNameSnapshot: menuExtra.name,
        unitPrice: menuExtra.extraPrice, quantity, subtotal,
      }));
    }
  }

  async cambioStatusCustomerOrder(dto: CustomerOrderDto) {
    if (!dto) return ResponseUtil.error('La solicitud no puede ser nula', null);
    if (!dto.orderCode?.trim()) return ResponseUtil.error('El código de la orden es obligatorio', null);
    if (!dto.status?.trim()) return ResponseUtil.error('El estado de la orden es obligatorio', null);
    if (!Object.values(OrderStatus).includes(dto.status as OrderStatus)) return ResponseUtil.error(`Estado inválido: ${dto.status}`, null);

    const order = await this.orders.findOneBy({ orderCode: dto.orderCode });
    if (!order) return ResponseUtil.error(`No existe una orden con código: ${dto.orderCode}`, null);
    const current = order.status as OrderStatus;
    const next = dto.status as OrderStatus;
    if (!this.isValidTransition(current, next)) return ResponseUtil.error(`Transición de estado inválida: ${current} -> ${next}`, null);

    const saved = await this.dataSource.transaction(async (manager) => {
      order.status = next; order.updatedAt = new Date(); this.registerDateByStatus(order, next);
      if (this.isFinal(next)) order.type = null;
      const savedOrder = await manager.getRepository(CustomerOrder).save(order);
      if (this.isFinal(next) && savedOrder.idTableSession) {
        const session = await manager.getRepository(TableSession).findOneBy({ id: savedOrder.idTableSession });
        if (session) { session.status = 'cerrada'; session.updatedAt = new Date(); await manager.getRepository(TableSession).save(session); }
      }
      return savedOrder;
    });

    const event = await this.buildReceptionOrderEvent(saved);
    this.sse.emitOrderUpdated(event);
    this.sse.emitDashboardUpdated({ reason: 'ORDER_STATUS_CHANGED', status: saved.status });
    return ResponseUtil.success(saved.orderCode, 'Estado actualizado correctamente');
  }

  private registerDateByStatus(order: CustomerOrder, status: OrderStatus): void {
    const now = new Date();
    if (status === OrderStatus.confirmado && !order.confirmedAt) order.confirmedAt = now;
    if (status === OrderStatus.en_preparacion && !order.preparationStartedAt) order.preparationStartedAt = now;
    if (status === OrderStatus.listo && !order.readyAt) order.readyAt = now;
    if (status === OrderStatus.servido && !order.servedAt) order.servedAt = now;
    if (status === OrderStatus.pagado && !order.paidAt) order.paidAt = now;
    if (status === OrderStatus.cancelado && !order.cancelledAt) order.cancelledAt = now;
  }

  private isValidTransition(current: OrderStatus, next: OrderStatus): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.nuevo]: [OrderStatus.confirmado, OrderStatus.cancelado],
      [OrderStatus.confirmado]: [OrderStatus.en_preparacion, OrderStatus.cancelado],
      [OrderStatus.en_preparacion]: [OrderStatus.listo], [OrderStatus.listo]: [OrderStatus.servido],
      [OrderStatus.servido]: [OrderStatus.pagado], [OrderStatus.pagado]: [], [OrderStatus.cancelado]: [],
    };
    return transitions[current]?.includes(next) ?? false;
  }
  private isFinal(status: OrderStatus): boolean { return status === OrderStatus.pagado || status === OrderStatus.cancelado; }

  async getActiveOrders() {
    const { start, end } = ecuadorTodayBounds();
    const statuses = [OrderStatus.nuevo, OrderStatus.confirmado, OrderStatus.en_preparacion, OrderStatus.listo, OrderStatus.servido, OrderStatus.pagado];
    const orders = await this.orders.createQueryBuilder('co').where('co.status IN (:...statuses)', { statuses })
      .andWhere('co.created_at >= :start AND co.created_at < :end', { start, end }).orderBy('co.created_at', 'DESC').getMany();
    return ResponseUtil.success(await Promise.all(orders.map((o) => this.buildReceptionOrderEvent(o))), 'Pedidos activos obtenidos correctamente');
  }

  async createService(dto: CreateCustomerOrderRequestDto) {
    if (!dto.code?.trim()) throw new BadRequestException('El código del pedido es obligatorio');
    if (!dto.type) throw new BadRequestException('El tipo de solicitud es obligatorio');
    const order = await this.orders.findOneBy({ orderCode: dto.code }); if (!order) throw new NotFoundException(`Pedido no encontrado: ${dto.code}`);
    order.type = dto.type; order.updatedAt = new Date(); const saved = await this.orders.save(order);
    this.sse.emitOrderUpdated(await this.buildReceptionOrderEvent(saved));
    return ResponseUtil.success(saved.orderCode, 'Solicitud registrada correctamente');
  }

  async attendWaiterRequest(dto: CreateCustomerOrderRequestDto) { return this.attendRequest(dto, 'WAITER_CALL', 'mesero', 'Solicitud de mesero atendida correctamente'); }
  async attendBillRequest(dto: CreateCustomerOrderRequestDto) { return this.attendRequest(dto, 'BILL_REQUEST', 'cuenta', 'Solicitud de cuenta atendida correctamente'); }
  private async attendRequest(dto: CreateCustomerOrderRequestDto, expected: string, label: string, successMessage: string) {
    if (!dto?.code?.trim()) throw new BadRequestException('El código del pedido es obligatorio');
    const order = await this.orders.findOneBy({ orderCode: dto.code }); if (!order) throw new NotFoundException(`Pedido no encontrado: ${dto.code}`);
    if (order.type !== expected) return ResponseUtil.error(`El pedido no tiene una solicitud de ${label} pendiente`, order.orderCode);
    order.type = null; order.updatedAt = new Date(); const saved = await this.orders.save(order);
    this.sse.emitOrderUpdated(await this.buildReceptionOrderEvent(saved));
    return ResponseUtil.success(saved.orderCode, successMessage);
  }

  private async buildReceptionOrderEvent(order: CustomerOrder): Promise<ReceptionOrderEventDto> {
    const table = order.idTable ? await this.tables.findOneBy({ id: order.idTable }) : null;
    const items = await this.items.find({ where: { idCustomerOrder: order.id }, order: { id: 'ASC' } });
    const eventItems: OrderItemsEventDto[] = [];
    for (const item of items) {
      const extras = await this.itemExtras.findBy({ idOrderItem: item.id });
      eventItems.push({
        quantity: item.quantity, price: item.unitPrice, nameProduct: item.productNameSnapshot, notes: item.notes,
        customerOrderItemExtraEventDtos: extras.map((e) => ({ id: e.idMenuItemExtra ? Number(e.idMenuItemExtra) : null, subtotal: e.subtotal, extraNameSnapshot: e.extraNameSnapshot, unitPrice: e.unitPrice, quantity: e.quantity })),
      });
    }
    const total = eventItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return {
      idCustomerOrder: Number(order.id), orderCode: order.orderCode, status: order.status, numeroMesa: table?.tableNumber ?? null,
      idTable: order.idTable ? Number(order.idTable) : null, createdAt: (order.createdAt ?? new Date()).toISOString(), total,
      type: order.type, notes: order.notes, orderItemsEventDTOS: eventItems,
    };
  }
}
