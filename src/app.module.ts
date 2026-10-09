import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RestaurantModule } from './restaurant/restaurant.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { ALL_ENTITIES } from './database/entities/all-entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.getOrThrow<string>('DB_HOST'), port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.getOrThrow<string>('DB_USER'), password: config.getOrThrow<string>('DB_PASSWORD'), database: config.getOrThrow<string>('DB_NAME'),
        schema: config.get<string>('DB_SCHEMA', 'public'), entities: ALL_ENTITIES, synchronize: false,
        logging: config.get<string>('DB_LOGGING', 'false') === 'true',
        ssl: config.get<string>('DB_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),
    AuthModule, UsersModule, RestaurantModule, BootstrapModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
