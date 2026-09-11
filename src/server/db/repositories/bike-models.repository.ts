/**
 * Bike Models Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import type { BikeModelTable, BikeCategory, PropulsionType } from '../schema.ts';
import type { Insertable, Selectable, Updateable } from 'kysely';

export type BikeModel = Selectable<BikeModelTable>;
export type NewBikeModel = Insertable<BikeModelTable>;
export type BikeModelUpdate = Updateable<BikeModelTable>;

export interface BikeModelFilters {
  brandId?: string;
  category?: BikeCategory;
  propulsion?: PropulsionType;
  modelYear?: number;
}

export class BikeModelsRepository {
  private get db() {
    return getKysely();
  }

  async findMany(filters: BikeModelFilters = {}): Promise<BikeModel[]> {
    let query = this.db.selectFrom('bike_models').selectAll();

    if (filters.brandId) {
      query = query.where('brand_id', '=', filters.brandId);
    }
    if (filters.category) {
      query = query.where('category', '=', filters.category);
    }
    if (filters.propulsion) {
      query = query.where('propulsion', '=', filters.propulsion);
    }
    if (filters.modelYear) {
      query = query.where('model_year', '=', filters.modelYear);
    }

    return await query.orderBy('model_year', 'desc').orderBy('name', 'asc').execute();
  }

  async findById(id: string): Promise<BikeModel | undefined> {
    return await this.db
      .selectFrom('bike_models')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByBrandAndSlugAndYear(brandId: string, slug: string, year: number): Promise<BikeModel | undefined> {
    return await this.db
      .selectFrom('bike_models')
      .selectAll()
      .where('brand_id', '=', brandId)
      .where('slug', '=', slug)
      .where('model_year', '=', year)
      .executeTakeFirst();
  }

  async create(model: NewBikeModel): Promise<BikeModel> {
    return await this.db
      .insertInto('bike_models')
      .values(model)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, updateWith: BikeModelUpdate): Promise<BikeModel | undefined> {
    return await this.db
      .updateTable('bike_models')
      .set(updateWith)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}

export const bikeModelsRepository = new BikeModelsRepository();
