/**
 * Dealer Locations Repository (Kysely + PostGIS)
 */

import { getKysely } from '../kysely.ts';
import type { DealerLocationTable } from '../schema.ts';
import type { Insertable, Selectable, Updateable } from 'kysely';
import { sql } from 'kysely';

export type DealerLocation = Selectable<DealerLocationTable>;
export type NewDealerLocation = Insertable<DealerLocationTable>;
export type DealerLocationUpdate = Updateable<DealerLocationTable>;

export interface NearbyLocationResult extends DealerLocation {
  distance_km: number;
}

export class DealerLocationsRepository {
  private get db() {
    return getKysely();
  }

  async findByDealerId(dealerId: string): Promise<DealerLocation[]> {
    return await this.db
      .selectFrom('dealer_locations')
      .selectAll()
      .where('dealer_id', '=', dealerId)
      .orderBy('name', 'asc')
      .execute();
  }

  async findById(id: string): Promise<DealerLocation | undefined> {
    return await this.db
      .selectFrom('dealer_locations')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  /**
   * PostGIS ST_DWithin and ST_Distance radius query
   */
  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
    limit: number = 20
  ): Promise<NearbyLocationResult[]> {
    const radiusMeters = radiusKm * 1000;

    const query = sql<NearbyLocationResult>`
      SELECT 
        dl.*,
        ROUND((ST_Distance(
          dl.coordinates,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) / 1000.0)::numeric, 1) AS distance_km
      FROM dealer_locations dl
      WHERE ST_DWithin(
        dl.coordinates,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusMeters}
      )
      ORDER BY distance_km ASC
      LIMIT ${limit}
    `;

    const result = await query.execute(this.db);
    return result.rows;
  }

  async create(location: NewDealerLocation): Promise<DealerLocation> {
    // When inserting, populate both latitude/longitude and coordinates geometry point
    return await this.db
      .insertInto('dealer_locations')
      .values({
        ...location,
        coordinates: location.coordinates ?? sql`ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography`
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, updateWith: DealerLocationUpdate): Promise<DealerLocation | undefined> {
    return await this.db
      .updateTable('dealer_locations')
      .set(updateWith)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}

export const dealerLocationsRepository = new DealerLocationsRepository();
