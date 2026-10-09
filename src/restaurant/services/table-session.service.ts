import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ecuadorTodayBounds } from '../../common/utils/date.util';
import { ResponseUtil } from '../../common/utils/response.util';
import { TableSession } from '../../database/entities';
import { TableSessionDto } from '../dto/restaurant.dto';

@Injectable()
export class TableSessionService {
  constructor(@InjectRepository(TableSession) private readonly sessions: Repository<TableSession>) {}
  async create(dto: TableSessionDto) {
    if (dto.idTable == null) {
      throw new BadRequestException('El id de la mesa es obligatorio');
    }

    const entity = this.sessions.create({
      idTable: String(dto.idTable), status: dto.status ?? 'activa', guestCount: dto.guestCount ?? null,
      notes: dto.notes ?? null, idOpenedBy: dto.idOpenedBy == null ? null : String(dto.idOpenedBy), idClosedBy: dto.idClosedBy == null ? null : String(dto.idClosedBy),
    });
    await this.sessions.save(entity); return ResponseUtil.success(null, 'Exito');
  }
  async getCountActiveSessionsToday() {
    const { start, end } = ecuadorTodayBounds();
    const count = await this.sessions.createQueryBuilder('ts').where('ts.status = :status', { status: 'activa' }).andWhere('ts.created_at >= :start AND ts.created_at < :end', { start, end }).getCount();
    return ResponseUtil.success(count, 'Éxito al obtener sesiones activas');
  }
  async getCountNumberTableToday() {
    const { start, end } = ecuadorTodayBounds();
    const row = await this.sessions.createQueryBuilder('ts').select('COUNT(DISTINCT ts.table_id)', 'count').where('ts.status = :status', { status: 'activa' }).andWhere('ts.created_at >= :start AND ts.created_at < :end', { start, end }).getRawOne<{ count: string }>();
    return ResponseUtil.success(Number(row?.count ?? 0), 'Éxito al obtener mesas activas');
  }
}
