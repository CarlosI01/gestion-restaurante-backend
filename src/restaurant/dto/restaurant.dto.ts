import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';

export enum OrderStatus {
  nuevo = 'nuevo', confirmado = 'confirmado', en_preparacion = 'en_preparacion',
  listo = 'listo', servido = 'servido', pagado = 'pagado', cancelado = 'cancelado',
}
export enum CustomerOrderRequestType { WAITER_CALL = 'WAITER_CALL', BILL_REQUEST = 'BILL_REQUEST' }

const optionalNumber = ({ value }: { value: unknown }) => value === '' || value == null ? undefined : Number(value);
const optionalBoolean = ({ value }: { value: unknown }) => {
  if (value === '' || value == null) return undefined;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
};

export class MenuCategoryDto {
  @IsOptional() @Transform(optionalNumber) id?: number;
  @IsOptional() @IsString() externalCode?: string;
  @IsNotEmpty() @IsString() name: string;
  @IsOptional() @IsString() iconKey?: string;
  @IsOptional() @Transform(optionalNumber) displayOrder: number = 0;
  @IsOptional() @Transform(optionalBoolean) isActive: boolean = true;
}

export class KitchenStationDto {
  @IsOptional() @Transform(optionalNumber) id?: number;
  @IsNotEmpty() @IsString() code: string;
  @IsNotEmpty() @IsString() name: string;
  @IsOptional() @Transform(optionalNumber) displayOrder: number = 0;
  @IsOptional() @IsString() iconKey?: string;
  @IsOptional() @Transform(optionalBoolean) isActive: boolean = true;
}

export class MenuItemExtraDto {
  @IsOptional() @Transform(optionalNumber) id?: number;
  @IsOptional() @Transform(optionalNumber) idMenuItem?: number;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @Transform(optionalNumber) @IsNumber() @Min(0) extraPrice?: number;
  @IsOptional() @Transform(optionalBoolean) isActive: boolean = true;
  @IsOptional() @Transform(optionalNumber) displayOrder?: number;
}

export class MenuItemDto {
  @IsOptional() @Transform(optionalNumber) id?: number;
  @IsOptional() category?: MenuCategoryDto;
  @IsOptional() @Transform(optionalNumber) idCategory?: number;
  @IsOptional() nameCategory?: string;
  @IsOptional() station?: KitchenStationDto;
  @IsOptional() @Transform(optionalNumber) idStation?: number;
  @IsOptional() nameStation?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Transform(optionalNumber) @IsNumber() @Min(0) basePrice?: number;
  @IsOptional() imageUrl?: string;
  @IsOptional() @Transform(optionalBoolean) isPopular: boolean = false;
  @IsOptional() @Transform(optionalBoolean) isAvailable: boolean = false;
  @IsOptional() @Transform(optionalBoolean) isActive: boolean = true;
  @IsOptional() @Transform(optionalNumber) displayOrder: number = 0;
  @IsOptional() extras: MenuItemExtraDto[] = [];
  @IsOptional() allergens: unknown[] = [];
}

export class RestaurantTableDto {
  @IsOptional() @Transform(optionalNumber) id?: number;
  @IsOptional() @Transform(optionalNumber) zone?: number;
  @IsOptional() @Transform(optionalNumber) tableNumber?: number;
  @IsOptional() @Transform(optionalNumber) seats?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @Transform(optionalBoolean) isActive?: boolean;
  @IsOptional() qrImageUrl?: string;
  @IsOptional() accessCode?: string;
  @IsOptional() qrUrl?: string;
}

export class TableSessionDto {
  @IsOptional() @Transform(optionalNumber) id?: number;
  @IsOptional() @Transform(optionalNumber) idTable?: number;
  @IsOptional() openedBy?: unknown;
  @IsOptional() closedBy?: unknown;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @Transform(optionalNumber) guestCount?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @Transform(optionalNumber) idOpenedBy?: number;
  @IsOptional() @Transform(optionalNumber) idClosedBy?: number;
}

export class CustomerOrderItemExtraDto {
  @IsOptional() @Transform(optionalNumber) id?: number;
  @IsOptional() @Transform(optionalNumber) idOrderItem?: number;
  @IsOptional() @Transform(optionalNumber) idMenuItemExtra?: number;
  @IsOptional() @Transform(optionalNumber) subtotal?: number;
  @IsOptional() extraNameSnapshot?: string;
  @IsOptional() @Transform(optionalNumber) unitPrice?: number;
  @IsOptional() @Transform(optionalNumber) quantity?: number;
}

export class CustomerOrderItemDto {
  @IsOptional() @Transform(optionalNumber) id?: number;
  @IsOptional() order?: unknown;
  @IsOptional() @Transform(optionalNumber) idCustomerOrder?: number;
  @IsOptional() menuItem?: MenuItemDto;
  @IsOptional() @Transform(optionalNumber) idMenuItem?: number;
  @IsOptional() station?: KitchenStationDto;
  @IsOptional() @Transform(optionalNumber) idStation?: number;
  @IsOptional() @IsString() status?: string;
  @IsNotEmpty() @IsString() productNameSnapshot: string;
  @Transform(optionalNumber) @IsNumber() unitPrice: number;
  @Transform(optionalNumber) @IsNumber() quantity: number;
  @Transform(optionalNumber) @IsNumber() subtotal: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() createdAt?: Date;
  @IsOptional() updatedAt?: Date;
  @IsOptional() startedAt?: Date;
  @IsOptional() readyAt?: Date;
  @IsOptional() servedAt?: Date;
  @IsOptional() cancelledAt?: Date;
  @IsOptional() @Type(() => CustomerOrderItemExtraDto) extras: CustomerOrderItemExtraDto[] = [];
}

export class CustomerOrderDto {
  @IsOptional() @Transform(optionalNumber) id?: number;
  @IsOptional() @IsString() orderCode?: string;
  @IsOptional() table?: RestaurantTableDto;
  @IsOptional() @Transform(optionalNumber) idTable?: number;
  @IsOptional() tableSession?: TableSessionDto;
  @IsOptional() @Transform(optionalNumber) idTableSession?: number;
  @IsOptional() createdByStaff?: unknown;
  @IsOptional() @Transform(optionalNumber) idCreatedByStaff?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @Transform(optionalNumber) subtotal: number = 0;
  @IsOptional() @Transform(optionalNumber) taxAmount: number = 0;
  @IsOptional() @Transform(optionalNumber) discountAmount: number = 0;
  @IsOptional() @Transform(optionalNumber) serviceChargeAmount: number = 0;
  @IsOptional() @Transform(optionalNumber) tipAmount: number = 0;
  @IsOptional() @Transform(optionalNumber) total: number = 0;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() preparationStartedAt?: Date;
  @IsOptional() orderItems: CustomerOrderItemDto[] = [];
  @IsOptional() statusHistory: unknown[] = [];
}


export class CreateSessionAndOrderRequestDto {
  @IsObject()
  @ValidateNested()
  @Type(() => TableSessionDto)
  tableSession: TableSessionDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CustomerOrderDto)
  customerOrder: CustomerOrderDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerOrderItemDto)
  items: CustomerOrderItemDto[];
}

export class CreateCustomerOrderRequestDto {
  @IsOptional() @Transform(optionalNumber) idCustomerOrder?: number;
  @IsNotEmpty() @IsString() code: string;
  @IsOptional() @Transform(optionalNumber) idTable?: number;
  @IsOptional() @Transform(optionalNumber) numeroMesa?: number;
  @IsOptional() @IsEnum(CustomerOrderRequestType) type?: CustomerOrderRequestType;
}

export interface ConfirmOrderResponseDto { idCustomerOrder: number; orderCode: string; status: string; }
export interface CustomerOrderItemExtraEventDto { id: number | null; subtotal: number; extraNameSnapshot: string; unitPrice: number; quantity: number; }
export interface OrderItemsEventDto { quantity: number; price: number; nameProduct: string; notes: string | null; customerOrderItemExtraEventDtos: CustomerOrderItemExtraEventDto[]; }
export interface ReceptionOrderEventDto {
  idCustomerOrder: number; orderCode: string; status: string; numeroMesa: number | null; idTable: number | null;
  createdAt: string; total: number; type: string | null; notes: string | null; orderItemsEventDTOS: OrderItemsEventDto[];
}
export interface RequestDashboardDto { totalSemanal: number; pedidosSemanl: number; promedioSemanal: number; totalMesas: number; mesasOcupadas: number; }
export interface DataGraficosDto { date: string; total: number; }
export interface DataTableGraficosDto { numberTable: number; cantidad: number; }
export interface TopProductDto { producto: string; total: number; cantidad: number; }
export interface TopReportDto { ventaTotal: number; pedidosTotales: number; ticketPromedio: number; }
export interface AllergenDto { name: string; }
