/**
 * Brands Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import type { BrandTable } from '../schema.ts';
import type { Insertable, Selectable, Updateable } from 'kysely';

export type Brand = Selectable<BrandTable>;
export type NewBrand = Insertable<BrandTable>;
export type BrandUpdate = Updateable<BrandTable>;

export class BrandsRepository {
  private get db() {
    return getKysely();
  }

  async findAll(onlyActive: boolean = true): Promise<Brand[]> {
    let query = this.db.selectFrom('brands').selectAll();
    if (onlyActive) {
      query = query.where('is_active', '=', true);
    }
    return await query.orderBy('name', 'asc').execute();
  }

  async findById(id: string): Promise<Brand | undefined> {
    return await this.db
      .selectFrom('brands')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findBySlug(slug: string): Promise<Brand | undefined> {
    return await this.db
      .selectFrom('brands')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();
  }

  async create(brand: NewBrand): Promise<Brand> {
    return await this.db
      .insertInto('brands')
      .values(brand)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, updateWith: BrandUpdate): Promise<Brand | undefined> {
    return await this.db
      .updateTable('brands')
      .set(updateWith)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}

export const brandsRepository = new BrandsRepository();
