import * as storage from 'azure-storage';

import getByPartitionKey from './getByPartitionKey';
import { TableStorageEntityProcessor, TableStorageRecord } from './types';

const DEVICE_DATA_TABLE = 'devicedata';

export default async function getTelemetriesForDevice(
  tableService: storage.TableService,
  azDeviceId: string,
  telemetryNames: string[],
  nbRecord: number,
  entityProcessor: TableStorageEntityProcessor | null,
): Promise<TableStorageRecord[]> {
  const pk = `azd:${azDeviceId}`;

  const result: TableStorageRecord[] = [];

  const entities = await getByPartitionKey(
    tableService,
    DEVICE_DATA_TABLE,
    pk,
    telemetryNames,
    nbRecord,
    entityProcessor,
  );
  entities.forEach((e) => {
    result.push({
      partitionKey: e.partitionKey,
      rowKey: e.rowKey,
      timeStamp: e.timeStamp,
      props: e.props,
    });
  });
  return result;
}
