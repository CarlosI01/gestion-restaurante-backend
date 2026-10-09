import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ecuadorTodayBounds, ecuadorWeekBounds } from '../../common/utils/date.util';
import { ResponseUtil } from '../../common/utils/response.util';
import { CustomerOrder, CustomerOrderItem, RestaurantTable, TableSession } from '../../database/entities';
import { CustomerOrderDto } from '../dto/restaurant.dto';

@Injectable()
export class CustomerOrderService {
  constructor(
    @InjectRepository(CustomerOrder) private readonly orders: Repository<CustomerOrder>,
    @InjectRepository(CustomerOrderItem) private readonly items: Repository<CustomerOrderItem>,
    @InjectRepository(RestaurantTable) private readonly tables: Repository<RestaurantTable>,
    @InjectRepository(TableSession) private readonly sessions: Repository<TableSession>,
  ) {}

  private toOrderDto(order: CustomerOrder) {
    return {
      id: Number(order.id), orderCode: order.orderCode, status: order.status, subtotal: order.subtotal,
      taxAmount: order.taxAmount, discountAmount: order.discountAmount, serviceChargeAmount: order.serviceChargeAmount,
      tipAmount: order.tipAmount, total: order.total, notes: order.notes, preparationStartedAt: order.preparationStartedAt,
      orderItems: (order.orderItems ?? []).map((item) => ({
        id: Number(item.id), idCustomerOrder: Number(item.idCustomerOrder), idMenuItem: item.idMenuItem ? Number(item.idMenuItem) : null,
        idStation: Number(item.idStation), status: item.status, productNameSnapshot: item.productNameSnapshot,
        unitPrice: item.unitPrice, quantity: item.quantity, subtotal: item.subtotal, notes: item.notes,
      })),
    };
  }

  async createOrderCustomer(dto: CustomerOrderDto) {
    const entity = this.orders.create({
      idTable: dto.idTable == null ? null : String(dto.idTable), idTableSession: dto.idTableSession == null ? null : String(dto.idTableSession),
      idCreatedByStaff: dto.idCreatedByStaff == null ? null : String(dto.idCreatedByStaff), orderCode: dto.orderCode!, status: dto.status!,
      subtotal: dto.subtotal ?? 0, taxAmount: dto.taxAmount ?? 0, discountAmount: dto.discountAmount ?? 0,
      serviceChargeAmount: dto.serviceChargeAmount ?? 0, tipAmount: dto.tipAmount ?? 0, total: dto.total ?? 0,
      notes: dto.notes ?? null, preparationStartedAt: dto.preparationStartedAt ? new Date(dto.preparationStartedAt) : null,
    });
    await this.orders.save(entity); return ResponseUtil.success(null, 'Exito');
  }

  async getCustomerOrder() {
    const { start, end } = ecuadorTodayBounds();
    const rows = await this.orders.createQueryBuilder('co').leftJoinAndSelect('co.orderItems', 'items')
      .where('co.created_at >= :start AND co.created_at < :end', { start, end }).orderBy('co.created_at', 'DESC').getMany();
    return ResponseUtil.success(rows.map((o) => this.toOrderDto(o)), 'Éxito');
  }

  async getTotalCustomerDecimal() {
    const { start, end } = ecuadorTodayBounds();
    const row = await this.orders.createQueryBuilder('co').select('COALESCE(SUM(co.total),0)', 'total')
      .where('co.created_at >= :start AND co.created_at < :end', { start, end }).andWhere('co.status = :status', { status: 'pagado' }).getRawOne<{ total: string }>();
    return ResponseUtil.success(Number(row?.total ?? 0), 'Éxito al obtener mesas activas');
  }

  async getWeekSummary() {
    const { start, end } = ecuadorWeekBounds();
    const totals = await this.orders.createQueryBuilder('co')
      .select('COALESCE(SUM(co.total),0)', 'total').addSelect('COUNT(co.id)', 'orders')
      .addSelect("COALESCE(ROUND(EXTRACT(EPOCH FROM AVG(co.paid_at - co.created_at)) / 60),0)", 'average')
      .where('co.created_at >= :start AND co.created_at < :end', { start, end }).andWhere('co.status = :status', { status: 'pagado' }).getRawOne<{ total: string; orders: string; average: string }>();
    const totalMesas = await this.tables.count();
    const occupied = await this.sessions.createQueryBuilder('ts').select('COUNT(DISTINCT ts.table_id)', 'count').where('ts.status = :status', { status: 'activa' }).getRawOne<{ count: string }>();
    return ResponseUtil.success({
      totalSemanal: Number(totals?.total ?? 0), pedidosSemanl: Number(totals?.orders ?? 0), promedioSemanal: Number(totals?.average ?? 0),
      totalMesas, mesasOcupadas: Number(occupied?.count ?? 0),
    }, 'Resumen del dashboard obtenido correctamente');
  }

  async getTableUsageByOrder() {
    const rows = await this.tables.createQueryBuilder('rt').leftJoin(CustomerOrder, 'co', 'co.table_id = rt.id AND co.status = :status', { status: 'pagado' })
      .select('rt.table_number', 'numberTable').addSelect('COUNT(co.id)', 'cantidad').groupBy('rt.table_number').orderBy('rt.table_number', 'ASC').getRawMany<{ numberTable: string; cantidad: string }>();
    return ResponseUtil.success(rows.map((r) => ({ numberTable: Number(r.numberTable), cantidad: Number(r.cantidad) })), 'Exito');
  }

  async getSalesByDay() {
    const { start, end } = ecuadorWeekBounds();
    const rows = await this.orders.createQueryBuilder('co').select('CAST(co.created_at AS DATE)', 'fecha').addSelect('COALESCE(SUM(co.total),0)', 'total')
      .where('co.status = :status', { status: 'pagado' }).andWhere('co.created_at >= :start AND co.created_at < :end', { start, end })
      .groupBy('CAST(co.created_at AS DATE)').orderBy('fecha', 'ASC').getRawMany<{ fecha: string; total: string }>();
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const data = labels.map((date) => ({ date, total: 0 }));
    for (const row of rows) {
      const date = new Date(`${row.fecha}T12:00:00-05:00`);
      const jsDay = date.getUTCDay();
      const index = (jsDay + 6) % 7;
      data[index].total = Number(row.total ?? 0);
    }
    return ResponseUtil.success(data, 'Ventas por día obtenidas correctamente');
  }

  async getTopProducts() {
    const rows = await this.items.createQueryBuilder('coi').leftJoin(CustomerOrder, 'co', 'co.id = coi.order_id')
      .select('coi.product_name_snapshot', 'producto').addSelect('COALESCE(SUM(coi.unit_price * coi.quantity),0)', 'total')
      .addSelect('COALESCE(SUM(coi.quantity),0)', 'cantidad').where('co.status = :status', { status: 'pagado' })
      .groupBy('coi.product_name_snapshot').orderBy('total', 'DESC').limit(5).getRawMany<{ producto: string; total: string; cantidad: string }>();
    return ResponseUtil.success(rows.map((r) => ({ producto: r.producto, total: Number(r.total), cantidad: Number(r.cantidad) })), 'Top productos vendidos obtenido correctamente');
  }

  async getTopReport() {
    const { start, end } = ecuadorTodayBounds();
    const global = await this.orders.createQueryBuilder('co').select('COALESCE(SUM(co.total),0)', 'ventaTotal').addSelect('COUNT(co.id)', 'pedidosTotales')
      .where('co.status = :status', { status: 'pagado' }).getRawOne<{ ventaTotal: string; pedidosTotales: string }>();
    const ticket = await this.orders.createQueryBuilder('co').select('COALESCE(ROUND(AVG(co.total),2),0)', 'ticketPromedio')
      .where('co.created_at >= :start AND co.created_at < :end', { start, end }).andWhere('co.status = :status', { status: 'pagado' }).getRawOne<{ ticketPromedio: string }>();
    return ResponseUtil.success({ ventaTotal: Number(global?.ventaTotal ?? 0), pedidosTotales: Number(global?.pedidosTotales ?? 0), ticketPromedio: Number(ticket?.ticketPromedio ?? 0) }, 'Reporte obtenido correctamente');
  }
}
