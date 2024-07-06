import * as storage from 'azure-storage';

import getByPartitionKey from './getByPartitionKey';
import { TableStorageEntityProcessor } from './types';

const DEVICE_DATA_TABLE = 'devicestatus';

export default async function visitDeviceStatus(
  tableService: storage.TableService,
  telemetryNames: string[],
  entityProcessor: TableStorageEntityProcessor,
): Promise<void> {
  const pk = 'telemetries';

  await getByPartitionKey(
    tableService,
    DEVICE_DATA_TABLE,
    pk,
    telemetryNames,
    -1,
    entityProcessor,
  );
}
