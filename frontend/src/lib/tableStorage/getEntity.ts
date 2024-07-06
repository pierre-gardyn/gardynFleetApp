import { TableService, TableQuery } from 'azure-storage';
import getTableEntities from './getTableEntities';
import { TableStorageRecord } from './types';

export default async function getEntity(
  tableService: TableService,
  tableName: string,
  partitionKey: string,
  rowKey: string,
  props: string[],
): Promise<TableStorageRecord[]> {
  const tableQuery = new TableQuery()
    .where('PartitionKey eq ?', partitionKey)
    .and('RowKey eq ?', rowKey);

  const entities = await getTableEntities(
    tableService,
    tableName,
    tableQuery,
    props,
    true,
    -1,
    null,
  );
  return entities;
}
