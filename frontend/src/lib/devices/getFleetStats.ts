import * as storage from 'azure-storage';

import { TableStorageRecord } from '../tableStorage/types';
import visitDeviceStatus from '../tableStorage/visitDeviceStatus';
import { collectListOfDevices } from '../sql/collectListDevices';
import { chunkArray } from '../utils';

const MAX_MINUTES_ACTIVE = 12 * 60; // 12 hours

export interface DeviceInformation {
  azDeviceId: string;
  serial: string;
  deviceId: string;
  version: string;
  lastTelemetryWhen: string;
  isActive: boolean;
}

export interface FleetStats {
  when: string;
  devices: DeviceInformation[];
  devicesNotInDatabase: DeviceInformation[];
}

function mkDeviceStatsProcessor(now: Date) {
  const deviceInformation: DeviceInformation[] = [];

  return {
    processor: (entity: TableStorageRecord): boolean => {
      const azDeviceId = entity.props['_azDeviceId'];
      const version = entity.props['version'];
      // const water_lvl = entity.props['water_lvl'];
      //const wl_errors = entity.props['wl_errors'];
      const messageTimeStamp = entity.props['_messageTimeStamp'];

      const ts = new Date(messageTimeStamp);
      const ageInMinutes = Math.round((now.getTime() - ts.getTime()) / 60000);
      const isActiveDevice = ageInMinutes < MAX_MINUTES_ACTIVE;

      deviceInformation.push({
        azDeviceId,
        serial: '',
        deviceId: '',
        version,
        lastTelemetryWhen: ts.toISOString(),
        isActive: isActiveDevice,
      });

      // we want process all the records
      return true;
    },
    getDevices(): DeviceInformation[] {
      return deviceInformation;
    },
  };
}

export default async function getFleetStats(
  tableService: storage.TableService,
  now: Date,
): Promise<FleetStats> {
  const processor = mkDeviceStatsProcessor(now);
  console.log('# retrieve list of devices from devicestatus table storage...');
  await visitDeviceStatus(
    tableService,
    ['_azDeviceId', '_messageTimeStamp', 'version', 'water_lvl', 'wl_errors'],
    processor.processor,
  );
  const devices = processor.getDevices();
  console.log(`# we have ${devices.length} devices`);

  // we divide by chunks of devices and retrieve the data from mysql
  const chunks = chunkArray<DeviceInformation>(devices, 500);

  console.log('# retrieving sql information about the devices');
  let ix = 0;
  const nbChunks = chunks.length;
  for (const chunk of chunks) {
    ix++;
    console.log(`# chunk [${ix}/${nbChunks}]... `);
    const sqlDevices = await collectListOfDevices(
      -1,
      [],
      chunk.map((c) => c.azDeviceId),
      [],
      false,
    );
    for (const sqlDevice of sqlDevices) {
      const device = devices.find(
        (d) => d.azDeviceId === sqlDevice.az_device_id,
      );
      if (!device) {
        throw new Error(
          `did not find device: ${JSON.stringify(sqlDevice, null, 2)}`,
        );
      }
      device.serial = sqlDevice.serial;
      device.deviceId = sqlDevice.id;
    }
  }

  return {
    when: now.toISOString(),
    devices: devices.filter((d) => !!d.serial),
    devicesNotInDatabase: devices.filter((d) => !d.serial),
  };
}
