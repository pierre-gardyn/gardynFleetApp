import { TableService, TableQuery } from 'azure-storage';
import getTableEntities from './getTableEntities';
import { TableStorageEntityProcessor, TableStorageRecord } from './types';

export default async function getByPartitionKey(
  tableService: TableService,
  tableName: string,
  pk: string,
  props: string[],
  nbItems: number,
  entityProcessor: TableStorageEntityProcessor | null,
): Promise<TableStorageRecord[]> {
  const tableQuery =
    nbItems > 0
      ? new TableQuery().top(nbItems).where('PartitionKey eq ?', pk)
      : new TableQuery().where('PartitionKey eq ?', pk);

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

export async function getAllPartitionKeys(
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
