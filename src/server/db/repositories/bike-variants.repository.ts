/**
 * Bike Variants Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import type { BikeVariantTable } from '../schema.ts';
import type { Insertable, Selectable, Updateable } from 'kysely';

export type BikeVariant = Selectable<BikeVariantTable>;
export type NewBikeVariant = Insertable<BikeVariantTable>;
export type BikeVariantUpdate = Updateable<BikeVariantTable>;

export class BikeVariantsRepository {
  private get db() {
    return getKysely();
  }

  async findByModelId(modelId: string): Promise<BikeVariant[]> {
    return await this.db
      .selectFrom('bike_variants')
      .selectAll()
      .where('model_id', '=', modelId)
      .orderBy('frame_size', 'asc')
      .execute();
  }

  async findById(id: string): Promise<BikeVariant | undefined> {
    return await this.db
      .selectFrom('bike_variants')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByGtin(gtin: string): Promise<BikeVariant | undefined> {
    return await this.db
      .selectFrom('bike_variants')
      .selectAll()
      .where('gtin', '=', gtin)
      .executeTakeFirst();
  }

  async findBySku(sku: string): Promise<BikeVariant | undefined> {
    return await this.db
      .selectFrom('bike_variants')
      .selectAll()
      .where('manufacturer_sku', '=', sku)
      .executeTakeFirst();
  }

  async create(variant: NewBikeVariant): Promise<BikeVariant> {
    return await this.db
      .insertInto('bike_variants')
      .values(variant)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, updateWith: BikeVariantUpdate): Promise<BikeVariant | undefined> {
    return await this.db
      .updateTable('bike_variants')
      .set(updateWith)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}

export const bikeVariantsRepository = new BikeVariantsRepository();
