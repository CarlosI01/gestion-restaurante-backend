import { Allergen } from './allergen.entity';
import { AppPermission } from './app-permission.entity';
import { AppRole } from './app-role.entity';
import { AppRolePermission } from './app-role-permission.entity';
import { AuthAuditLog } from './auth-audit-log.entity';
import { AuthRefreshToken } from './auth-refresh-token.entity';
import { CustomerOrder } from './customer-order.entity';
import { CustomerOrderItem } from './customer-order-item.entity';
import { CustomerOrderItemExtra } from './customer-order-item-extra.entity';
import { CustomerOrderStatusHistory } from './customer-order-status-history.entity';
import { KitchenStation } from './kitchen-station.entity';
import { MenuCategory } from './menu-category.entity';
import { MenuItem } from './menu-item.entity';
import { MenuItemAllergen } from './menu-item-allergen.entity';
import { MenuItemExtra } from './menu-item-extra.entity';
import { RestaurantTable } from './restaurant-table.entity';
import { ServiceRequest } from './service-request.entity';
import { StaffUser } from './staff-user.entity';
import { StaffUserRole } from './staff-user-role.entity';
import { SystemConfig } from './system-config.entity';
import { TableSession } from './table-session.entity';
import { TableZone } from './table-zone.entity';

export const ALL_ENTITIES = [
  Allergen, AppPermission, AppRole, AppRolePermission, AuthAuditLog, AuthRefreshToken,
  CustomerOrder, CustomerOrderItem, CustomerOrderItemExtra, CustomerOrderStatusHistory,
  KitchenStation, MenuCategory, MenuItem, MenuItemAllergen, MenuItemExtra, RestaurantTable,
  ServiceRequest, StaffUser, StaffUserRole, SystemConfig, TableSession, TableZone,
];
