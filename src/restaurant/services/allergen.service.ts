import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allergen } from '../../database/entities';
@Injectable()
export class AllergenService {
  constructor(@InjectRepository(Allergen) private readonly repository: Repository<Allergen>) {}
  async getAll() { return (await this.repository.find()).map((a) => ({ name: a.name })); }
}
