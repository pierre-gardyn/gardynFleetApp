import * as storage from 'azure-storage';

import getByRowKey from './getByRowKey';
import { TableStorageEntityProcessor } from './types';

const OTA_DEVICE_TABLE = 'gOtaDevices';

export default async function visitOtaDevices(
  tableService: storage.TableService,
  tableRecordItems: string[],
  entityProcessor: TableStorageEntityProcessor,
): Promise<void> {
   // Each record PK is unique (serial:XXX), figure out how to wildcard the serials
   // Maybe use 'RowKey' instead as all records for this contain 'device'
   const rk = 'device';

   await getByRowKey(
      tableService,
      OTA_DEVICE_TABLE,
      rk,
      tableRecordItems,
      -1,
      entityProcessor,
   );
}
