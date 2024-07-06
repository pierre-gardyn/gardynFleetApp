import * as storage from 'azure-storage';

import { TableStorageRecord } from '../tableStorage/types';
import visitDeviceStatus from '../tableStorage/visitDeviceStatus';

const MAX_MINUTES_ACTIVE = 12 * 60; // 12 hours

export interface DeviceInfo {
  azDeviceId: string;
  version: string;
  ageInMinutes: number;
  isActiveDevice: boolean;
}

interface VisitorFilter {
  azDeviceIds: string[];
}

function mkDeviceStatsProcessor(now: Date, filter: VisitorFilter) {
  const _devices: DeviceInfo[] = [];
  let deviceCount = 0;
  return {
    processor: (entity: TableStorageRecord): boolean => {
      deviceCount++;
      const azDeviceId = entity.props['_azDeviceId'];
      const version = entity.props['version'];
      const messageTimeStamp = entity.props['_messageTimeStamp'];

      // check filter
      if (
        filter.azDeviceIds &&
        filter.azDeviceIds.length > 0 &&
        !filter.azDeviceIds.includes(azDeviceId)
      ) {
        // we skip
        return true;
      }

      console.log(`@@ adding ${azDeviceId} - ${version}`);

      const ts = new Date(messageTimeStamp);
      const ageInMinutes = Math.round((now.getTime() - ts.getTime()) / 60000);
      const isActiveDevice = ageInMinutes < MAX_MINUTES_ACTIVE;

      _devices.push({
        azDeviceId,
        version,
        ageInMinutes,
        isActiveDevice,
      });

      // we want process all the records
      return true;
    },
    devices(): DeviceInfo[] {
      return _devices;
    },
    deviceCount(): number {
      return deviceCount;
    },
  };
}

export default async function getAllDevices(
  tableService: storage.TableService,
  now: Date,
  filter?: VisitorFilter,
): Promise<DeviceInfo[]> {
  try {
    const processor = mkDeviceStatsProcessor(
      now,
      filter || {
        azDeviceIds: [],
      },
    );
    await visitDeviceStatus(
      tableService,
      ['_azDeviceId', '_messageTimeStamp', 'version'],
      processor.processor,
    );
    // we return the version distribution data
    return processor.devices();
  } catch (err) {
    console.log(err);
    throw err;
  }
}
