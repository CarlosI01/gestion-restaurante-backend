import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Allergen, CustomerOrder, CustomerOrderItem, CustomerOrderItemExtra, KitchenStation, MenuCategory,
  MenuItem, MenuItemExtra, RestaurantTable, TableSession,
} from '../database/entities';
import { AdminKitchenController } from './controllers/admin-kitchen.controller';
import { AdminMenuCategoryController, AdminMenuController } from './controllers/admin-menu.controller';
import { AdminOrdersController } from './controllers/admin-orders.controller';
import { AdminReportController, DashboardController } from './controllers/admin-report.controller';
import { AdminTablesController, AdminTableSessionsController } from './controllers/admin-tables.controller';
import { AllergenController } from './controllers/allergen.controller';
import { OrderItemController } from './controllers/order-item.controller';
import { PublicMenuController } from './controllers/public-menu.controller';
import { PublicOrderController } from './controllers/public-order.controller';
import { PublicTableController } from './controllers/public-table.controller';
import { ReceptionSseController } from './controllers/reception-sse.controller';
import { TableSessionController } from './controllers/table-session.controller';
import { AllergenService } from './services/allergen.service';
import { CustomerItemService } from './services/customer-item.service';
import { CustomerOrderService } from './services/customer-order.service';
import { KitchenStationService } from './services/kitchen-station.service';
import { MenuCategoryService } from './services/menu-category.service';
import { MenuItemService } from './services/menu-item.service';
import { OrderSessionService } from './services/order-session.service';
import { QrCodeService } from './services/qr-code.service';
import { ReceptionSseService } from './services/reception-sse.service';
import { RestaurantTableService } from './services/restaurant-table.service';
import { TableSessionService } from './services/table-session.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    Allergen, CustomerOrder, CustomerOrderItem, CustomerOrderItemExtra, KitchenStation, MenuCategory,
    MenuItem, MenuItemExtra, RestaurantTable, TableSession,
  ])],
  controllers: [
    PublicMenuController, AllergenController, PublicTableController, PublicOrderController, OrderItemController, TableSessionController,
    AdminMenuController, AdminMenuCategoryController, AdminTablesController, AdminTableSessionsController, AdminOrdersController,
    AdminReportController, DashboardController, AdminKitchenController, ReceptionSseController,
  ],
  providers: [
    AllergenService, MenuCategoryService, KitchenStationService, MenuItemService, QrCodeService, RestaurantTableService,
    TableSessionService, CustomerItemService, CustomerOrderService, ReceptionSseService, OrderSessionService,
  ],
})
export class RestaurantModule {}
