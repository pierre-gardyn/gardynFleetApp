import * as storage from 'azure-storage';

import getByPartitionKey from './getByPartitionKey';
import { TableStorageRecord } from './types';

const TABLE_NAME_OTA_LOGS = 'gOtaLogs';

export default async function getOtaLogsForDevice(
  tableService: storage.TableService,
  serial: string,
): Promise<TableStorageRecord[]> {
  const pk = `serial:${serial}`;

  const result: TableStorageRecord[] = [];

  const entities = await getByPartitionKey(
    tableService,
    TABLE_NAME_OTA_LOGS,
    pk,
    [],
    -1,
    null,
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
