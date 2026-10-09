# Notas de migración Spring Boot -> NestJS + TypeORM

## Objetivo

La migración busca conservar el comportamiento funcional y los contratos HTTP del backend existente, sustituyendo el stack Java/Spring por NestJS/TypeORM sin rediseñar innecesariamente la base de datos.

## Equivalencias principales

| Spring Boot | NestJS / TypeORM |
|---|---|
| `@RestController` | `@Controller` |
| `@Service` | `@Injectable` |
| `JpaRepository` | `Repository<T>` |
| JPA `@Entity` | TypeORM `@Entity` |
| JPQL / métodos derivados | `Repository` / `QueryBuilder` |
| SQL nativo | `QueryBuilder` / consultas TypeORM |
| `@Transactional` | `DataSource.transaction()` |
| Spring Security | Passport JWT + Guards |
| `@PreAuthorize` | `@Roles` / `@Permissions` |
| Bean Validation | `class-validator` |
| `MultipartFile` | Multer `FileInterceptor` |
| `SseEmitter` | Nest `@Sse` + RxJS |
| ZXing QR | paquete `qrcode` |
| `application.properties` | `.env` + `ConfigModule` |

## Entidades migradas

Se migraron las entidades correspondientes a las tablas:

```text
allergen
app_permission
app_role
app_role_permission
auth_audit_log
auth_refresh_token
customer_order
customer_order_item
customer_order_item_extra
customer_order_status_history
kitchen_station
menu_category
menu_item
menu_item_allergen
menu_item_extra
restaurant_table
service_request
staff_user
staff_user_role
system_config
table_session
table_zone
```

Se conservaron relaciones, nombres de columnas, timestamps, flags y tipos numéricos relevantes. Para columnas PostgreSQL `numeric`, TypeORM incorpora un transformer para exponer valores numéricos en la aplicación.

## Autenticación y autorización

- El token continúa usando Bearer JWT.
- El `sub` conserva el email del usuario.
- El rol se incluye en el token.
- Al validar cada token se carga el usuario activo desde base de datos junto con los permisos del rol.
- Los endpoints administrativos requieren `ADMIN`.
- Los endpoints de usuarios conservan `USER_VIEW` y `USER_EDIT`.
- Se conserva el bloqueo de 30 minutos después de alcanzar 5 intentos fallidos.

### Corrección respecto al Spring original

El servicio de carga de usuario Spring incorporaba la autoridad `ROLE_<rol>`, pero no agregaba los permisos del rol a las authorities utilizadas por `@PreAuthorize`. En NestJS los permisos se recuperan desde base de datos durante la validación JWT y son evaluados por `PermissionsGuard`.

## Base de datos

La configuración utiliza:

```ts
synchronize: false
```

La aplicación está pensada para trabajar contra el mismo esquema PostgreSQL existente. No se incluyeron operaciones automáticas para crear, borrar o modificar tablas al iniciar.

## Pedidos

Se conservaron las reglas observadas en el proyecto Spring:

```text
nuevo -> confirmado | cancelado
confirmado -> en_preparacion | cancelado
en_preparacion -> listo
listo -> servido
servido -> pagado
```

Los estados finales no permiten nuevas transiciones. También se mantienen los timestamps de preparación, confirmación, entrega, pago y cancelación utilizados por las entidades originales.

Al finalizar un pedido se conserva el cierre de la sesión de mesa y la limpieza del tipo de solicitud asociado al pedido.

## Mesa para llevar

La mesa `0` mantiene el tratamiento especial del proyecto original para pedidos para llevar y no sigue las mismas validaciones de ocupación/sesión que una mesa física.

## QR

Se mantiene la generación física de imágenes QR y la URL de acceso de mesa basada en `CLIENT_BASE_URL`.

La función de generación de QR faltantes fue ajustada para recorrer todas las mesas existentes. En el código Spring revisado, la consulta usada en esa función quedaba limitada a un rango `0..0`, aun cuando el objetivo del método era completar los QR faltantes.

## Archivos

Las imágenes del menú:

- máximo 2 MB;
- JPEG/JPG, PNG o WEBP;
- almacenamiento bajo `uploads/menu-items`;
- exposición HTTP bajo `/uploads/menu-items`.

Los QR se almacenan bajo `uploads/table-qrs` y se publican bajo `/uploads/table-qrs`.

## SSE

Se migraron los canales SSE de recepción y estado mediante `Subject` de RxJS. El stream de `/api/orders/:orderCode/stream` conserva el comportamiento observado en Spring: el parámetro forma parte de la ruta, pero la fuente de eventos es global y no se filtra por código de pedido.

## Reportes

Las consultas agregadas del dashboard fueron trasladadas a TypeORM QueryBuilder manteniendo PostgreSQL como motor de base de datos.

## Secretos

No se copiaron al proyecto Nest las credenciales reales encontradas en `application.properties`. `.env.example` contiene únicamente placeholders.

Por seguridad se recomienda rotar los valores que estaban presentes en el ZIP Spring original antes de desplegar esta migración.

## Validaciones pendientes de entorno

La conversión fue revisada estáticamente, pero en el entorno de generación no fue posible descargar dependencias desde npm debido a un fallo de resolución DNS. Por lo tanto, antes de despliegue debe ejecutarse en una máquina con acceso a npm:

```bash
npm install
npm run build
```

Luego se recomienda una validación de integración contra una copia de la base real, especialmente para:

- login y bloqueo por intentos;
- permisos y rol ADMIN;
- creación/confirmación/cambio de estado del pedido;
- mesa 0;
- carga y consulta de imágenes;
- QR;
- SSE;
- reportes/dashboard;
- cierre de sesiones de mesa.
