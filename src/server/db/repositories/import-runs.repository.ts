/**
 * Import Runs Repository (Kysely)
 */

import { getKysely } from '../kysely.ts';
import type { ImportRunTable, ImportRecordTable, ImportStatus } from '../schema.ts';
import type { Insertable, Selectable, Updateable } from 'kysely';

export type ImportRun = Selectable<ImportRunTable>;
export type NewImportRun = Insertable<ImportRunTable>;
export type ImportRunUpdate = Updateable<ImportRunTable>;

export type ImportRecord = Selectable<ImportRecordTable>;
export type NewImportRecord = Insertable<ImportRecordTable>;

export interface ImportRunWithDealer extends ImportRun {
  dealer_id: string;
  dealer_name: string;
}

export class ImportRunsRepository {
  private get db() {
    return getKysely();
  }

  async createRun(run: NewImportRun): Promise<ImportRun> {
    return await this.db
      .insertInto('import_runs')
      .values(run)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateRun(id: string, updateWith: ImportRunUpdate): Promise<ImportRun | undefined> {
    return await this.db
      .updateTable('import_runs')
      .set(updateWith)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async findById(id: string): Promise<ImportRun | undefined> {
    return await this.db
      .selectFrom('import_runs')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByDealerId(dealerId?: string, limit: number = 50): Promise<ImportRunWithDealer[]> {
    let query = this.db
      .selectFrom('import_runs as ir')
      .innerJoin('data_sources as ds', 'ds.id', 'ir.source_id')
      .innerJoin('dealers as d', 'd.id', 'ds.dealer_id')
      .selectAll('ir')
      .select([
        'd.id as dealer_id',
        'd.name as dealer_name'
      ]);

    if (dealerId) {
      query = query.where('d.id', '=', dealerId);
    }

    return await query
      .orderBy('ir.started_at', 'desc')
      .limit(limit)
      .execute() as unknown as ImportRunWithDealer[];
  }

  async recordRow(record: NewImportRecord): Promise<ImportRecord> {
    return await this.db
      .insertInto('import_records')
      .values(record)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findRecordsByRunId(importRunId: string): Promise<ImportRecord[]> {
    return await this.db
      .selectFrom('import_records')
      .selectAll()
      .where('import_run_id', '=', importRunId)
      .orderBy('row_number', 'asc')
      .execute();
  }

  async count(): Promise<number> {
    const res = await this.db
      .selectFrom('import_runs')
      .select((eb) => eb.fn.count<number>('id').as('count'))
      .executeTakeFirst();
    return Number(res?.count ?? 0);
  }
}

export const importRunsRepository = new ImportRunsRepository();
