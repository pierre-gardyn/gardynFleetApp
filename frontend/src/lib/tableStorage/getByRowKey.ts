import { TableService, TableQuery } from 'azure-storage';
import getTableEntities from './getTableEntities';
import { TableStorageEntityProcessor, TableStorageRecord } from './types';

export default async function getByRowKey(
  tableService: TableService,
  tableName: string,
  rk: string,
  props: string[],
  nbItems: number,
  entityProcessor: TableStorageEntityProcessor | null,
): Promise<TableStorageRecord[]> {
  const tableQuery =
    nbItems > 0
      ? new TableQuery().top(nbItems).where('RowKey eq ?', rk)
      : new TableQuery().where('RowKey eq ?', rk);

  const entities = await getTableEntities(
    tableService,
    tableName,
    tableQuery,
    props,
    true,
    nbItems,
    entityProcessor,
  );
  return entities;
}

export async function getAllRowKeys(
  tableService: TableService,
  tableName: string,
  props: string[],
  nbItems: number,
  entityProcessor: TableStorageEntityProcessor | null,
): Promise<TableStorageRecord[]> {
  const tableQuery =
    nbItems > 0 ? new TableQuery().top(nbItems) : new TableQuery();

  const entities = await getTableEntities(
    tableService,
    tableName,
    tableQuery,
    props,
    true,
    nbItems,
    entityProcessor,
  );
  return entities;
}
