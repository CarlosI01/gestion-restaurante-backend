import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { Repository } from 'typeorm';
import { ResponseUtil } from '../../common/utils/response.util';
import { RestaurantTable, TableSession } from '../../database/entities';
import { RestaurantTableDto } from '../dto/restaurant.dto';
import { QrCodeService } from './qr-code.service';

@Injectable()
export class RestaurantTableService {
  constructor(
    @InjectRepository(RestaurantTable) private readonly tables: Repository<RestaurantTable>,
    @InjectRepository(TableSession) private readonly sessions: Repository<TableSession>,
    private readonly qr: QrCodeService,
    private readonly config: ConfigService,
  ) {}

  private clientBaseUrl(): string { return this.config.get<string>('CLIENT_BASE_URL', 'http://localhost:5173').trim().replace(/\/$/, ''); }
  private toDto(table: RestaurantTable): RestaurantTableDto {
    return {
      id: Number(table.id), zone: table.zone, tableNumber: table.tableNumber, seats: table.seats, status: table.status,
      isActive: table.isActive, qrImageUrl: table.qrImageUrl ?? undefined, accessCode: table.accessCode ?? undefined,
      qrUrl: table.qrToken ? `${this.clientBaseUrl()}/cliente/mesa/${table.qrToken}` : undefined,
    };
  }

  private async assignQr(tableNumber: number, existingToken?: string | null, existingAccess?: string | null) {
    const qrToken = existingToken?.trim() || randomUUID();
    const accessCode = existingAccess?.trim() || `MESA-${tableNumber}`;
    const qrUrl = `${this.clientBaseUrl()}/cliente/mesa/${qrToken}`;
    const fileName = `mesa-${tableNumber}-${qrToken.substring(0, 8)}.png`;
    const dir = this.config.get<string>('UPLOAD_TABLE_QRS_DIR', 'uploads/table-qrs');
    await this.qr.generateQrImage(qrUrl, resolve(dir, fileName), 300);
    return { qrToken, accessCode, qrImageUrl: `/uploads/table-qrs/${fileName}` };
  }

  async createTable() {
    const latest = await this.tables.createQueryBuilder('rt').orderBy('rt.table_number', 'DESC').getOne();
    const next = (latest?.tableNumber ?? 0) + 1;
    const qr = await this.assignQr(next);
    await this.tables.save(this.tables.create({ tableNumber: next, seats: 5, status: 'libre', isActive: true, zone: 2, ...qr }));
    return ResponseUtil.success(null, 'Mesa creada correctamente');
  }

  async getTablesWithQr() {
    const rows = await this.tables.find({ order: { tableNumber: 'ASC' } });
    return ResponseUtil.success(rows.map((t) => this.toDto(t)), 'Mesas obtenidas correctamente');
  }

  async getValidateIngreso(tableNumber: number) {
    const table = await this.tables.findOneBy({ tableNumber });
    if (!table) return ResponseUtil.error(null, 'Mesa no existente');
    if (!table.isActive) return ResponseUtil.error(null, 'Mesa inactiva');
    if (table.tableNumber === 0) return ResponseUtil.success(this.toDto(table), 'Ingreso para llevar válido');
    if (table.status.toLowerCase() !== 'libre') return ResponseUtil.error(null, 'Mesa ocupada');
    const session = await this.sessions.findOneBy({ idTable: table.id, status: 'activa' });
    if (session) return ResponseUtil.error(null, 'La sesión de la mesa está activa');
    return ResponseUtil.success(this.toDto(table), 'Mesa válida. Puede ingresar al menú');
  }

  async getValidateIngresoByQrToken(qrToken: string) {
    if (!qrToken?.trim()) return ResponseUtil.error(null, 'QR inválido');
    const table = await this.tables.findOneBy({ qrToken });
    if (!table) return ResponseUtil.error(null, 'QR inválido o mesa no encontrada');
    return this.getValidateIngreso(table.tableNumber);
  }

  async getCountTotalTables() { return ResponseUtil.success(await this.tables.count(), 'Exito'); }

  async updateTableActiveStatus(dto: RestaurantTableDto) {
    if (dto.id == null) return ResponseUtil.error('El id de la mesa es obligatorio', null);
    if (dto.isActive == null) return ResponseUtil.error('El estado activo/inactivo es obligatorio', null);
    const table = await this.tables.findOneBy({ id: String(dto.id) });
    if (!table) return ResponseUtil.error(null, 'Mesa no encontrada');
    table.isActive = dto.isActive; await this.tables.save(table);
    return ResponseUtil.success(null, dto.isActive ? 'Mesa activada correctamente' : 'Mesa desactivada correctamente');
  }

  async generateQrForExistingTables() {
    const tables = await this.tables.find({ order: { tableNumber: 'ASC' } });
    if (!tables.length) return ResponseUtil.error(null, 'No se encontraron mesas');
    let generatedCount = 0;
    for (const table of tables) {
      if (table.qrToken?.trim() && table.qrImageUrl?.trim()) continue;
      const qr = await this.assignQr(table.tableNumber, table.qrToken, table.accessCode);
      Object.assign(table, qr); await this.tables.save(table); generatedCount++;
    }
    return ResponseUtil.success(null, `QR generados correctamente para ${generatedCount} mesa(s)`);
  }
}
