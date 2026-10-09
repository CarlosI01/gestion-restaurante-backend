# Gestión Restaurante - NestJS + TypeORM

Migración del backend original en Spring Boot a **NestJS + TypeScript + TypeORM**, conservando el esquema PostgreSQL y los contratos HTTP principales del sistema.

## Stack

- Node.js 22
- NestJS 12
- TypeORM 0.3.x
- PostgreSQL
- JWT + Passport
- class-validator / class-transformer
- RxJS para Server-Sent Events (SSE)
- QRCode para generación de códigos QR
- Multer para carga de imágenes

## Requisitos

- Node.js 22
- npm
- PostgreSQL con el esquema que utiliza el proyecto original

> La migración usa `synchronize: false`. No modifica automáticamente el esquema existente.

## Configuración

1. Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Configurar al menos:

```dotenv
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=change_me
DB_SCHEMA=public
DB_SSL=false
JWT_SECRET_BASE64=replace_with_a_base64_secret_of_at_least_32_bytes
CLIENT_BASE_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
```

Si se reutiliza una base remota que requiere TLS, establecer:

```dotenv
DB_SSL=true
```

El secreto JWT debe estar codificado en Base64 y representar al menos 32 bytes de material secreto.

## Instalación y ejecución

```bash
npm install
npm run start:dev
```

Compilación de producción:

```bash
npm run build
npm run start:prod
```

## Docker

```bash
docker build -t gestion-restaurante-nest .
docker run --env-file .env -p 8080:8080 gestion-restaurante-nest
```

Los directorios de archivos se crean como:

```text
uploads/menu-items
uploads/table-qrs
```

Para conservarlos entre reinicios de contenedor, se recomienda montar un volumen externo.

## Estructura

```text
src/
├── auth/                 # JWT, login, registro y bloqueo por intentos fallidos
├── bootstrap/            # Inicialización de roles base
├── common/               # Guards, decoradores, filtros y utilitarios
├── database/entities/    # Entidades TypeORM equivalentes a JPA
├── restaurant/           # Menú, mesas, pedidos, sesiones, QR, SSE y reportes
├── users/                # Administración de usuarios y permisos
├── app.controller.ts
├── app.module.ts
└── main.ts
```

## Compatibilidad funcional conservada

- Mismos prefijos y rutas principales del backend Spring Boot.
- PostgreSQL y nombres de tablas/columnas existentes.
- Respuestas `GenericResponse` donde las utilizaba el proyecto original.
- Roles `ADMIN` y `STAFF`.
- Permisos `USER_VIEW` y `USER_EDIT`.
- JWT Bearer.
- Bloqueo temporal después de 5 intentos fallidos de autenticación.
- Mesa `0` como pedido para llevar.
- Flujo de estados de pedidos.
- Sesiones de mesa.
- Solicitudes de mesero y cuenta.
- Carga de imágenes del menú con límite de 2 MB.
- Generación y publicación de QR de mesas.
- SSE de recepción/estado de pedidos.
- Consultas de dashboard y reportes.

## Rutas principales

### Autenticación

```text
POST /auth/register
POST /auth/login
```

### Menú público

```text
GET  /api/allergens
GET  /api/menu/categories
GET  /api/menu/items
GET  /api/menu/categories/:idCategory/items
```

### Mesas y pedidos públicos

```text
GET  /api/tables/available/:tableNumber
GET  /api/tables/available/qr/:qrToken
POST /api/orders
POST /api/orders/confirm
POST /api/orders/service-request
GET  /api/orders/:orderCode/stream
POST /api/orders/items
```

### Sesiones de mesa

```text
POST /api/table-sessions/start
```

Esta ruta conserva el comportamiento de seguridad del proyecto Spring: requiere autenticación.

### Administración

```text
POST /api/admin/menu/categories
POST /api/admin/menu/items
PUT  /api/admin/menu/items
PUT  /api/admin/menu/items/delete
POST /api/admin/menu/items/extras
PUT  /api/admin/menu/items/extras
PUT  /api/admin/menu/items/extras/delete
PUT  /api/admin/menu/items/availability

POST /api/admin/tables/create
GET  /api/admin/tables
GET  /api/admin/tables/count
POST /api/admin/tables/generate-missing-qrs
PUT  /api/admin/tables/active-status

GET  /api/admin/table-sessions/count/active
GET  /api/admin/table-sessions/count/active-tables

GET  /api/admin/orders
POST /api/admin/orders/status
GET  /api/admin/orders/active
POST /api/admin/orders/service/waiter/attend
POST /api/admin/orders/service/bill/attend

GET  /api/admin/reports/total-customer
GET  /api/admin/reports/sales-by-day
GET  /api/admin/reports/top-products
GET  /api/admin/reports/top-report
GET  /api/admin/reports/table-usage
GET  /api/admin/dashboard/week-summary

POST /api/admin/kitchen-stations
GET  /api/admin/kitchen-stations

GET/SSE /api/admin/reception/orders/stream
GET/SSE /api/admin/reception/orders/status/stream
```

## Multipart para imágenes

Los endpoints de creación/actualización de ítems usan el campo multipart:

```text
image
```

con límite de 2 MB y MIME permitidos JPEG, PNG y WEBP.

## Ajustes realizados durante la migración

Además de traducir Spring/JPA a NestJS/TypeORM, se realizaron ajustes necesarios:

1. Las credenciales y el secreto JWT se sacaron del código/configuración versionable y ahora se leen desde `.env`.
2. Los permisos asociados al rol se cargan al validar el JWT, de modo que `USER_VIEW` y `USER_EDIT` funcionen realmente con Guards.
3. La generación de QR faltantes revisa todas las mesas existentes; el código Spring tenía una condición que terminaba restringiendo esa operación a la mesa 0.
4. La validación de identificadores obligatorios se hace explícita en servicios donde Java dependía del tipado/DTO.
5. BCrypt se mantiene compatible con los hashes existentes usando `bcryptjs`, evitando una dependencia nativa innecesaria en Docker Alpine.
6. Se mantienen `synchronize: false` y el esquema existente para evitar alteraciones automáticas en producción.

Consulta `MIGRATION_NOTES.md` para el detalle técnico.

## Seguridad

El ZIP Spring original contenía valores sensibles en `application.properties`. Esos valores **no fueron copiados** al nuevo proyecto. Antes de utilizar el sistema en un entorno real se recomienda rotar la contraseña de base de datos y el secreto JWT que estaban presentes en el proyecto original.

## Validación de la entrega

Se realizó validación estática de sintaxis TypeScript y de imports relativos sobre el código migrado. El entorno utilizado para la conversión no tuvo resolución DNS hacia npm, por lo que no fue posible descargar `node_modules` ni ejecutar aquí la compilación completa de NestJS.

En tu entorno, la comprobación final debe ser:

```bash
npm install
npm run build
npm run start:dev
```

Después conviene ejecutar las pruebas funcionales contra una copia de la base de datos antes de reemplazar el backend Spring en producción.
