import * as storage from 'azure-storage';

import getByPartitionKey from './getByPartitionKey';
import { TelemetryData } from './types';
import normalizeTelemetries from './normalizeTelemetries';

const DEVICE_DATA_TABLE = 'devicedata';

export default async function getTelemetryDatapointsForDevice(
  tableService: storage.TableService,
  azDeviceId: string,
  telemetryNames: string[],
  numberOfTelemetries: number,
  now: Date,
): Promise<TelemetryData[]> {
  const pk = `azd:${azDeviceId}`;
  const result: TelemetryData[] = [];

  const entities = await getByPartitionKey(
    tableService,
    DEVICE_DATA_TABLE,
    pk,
    telemetryNames,
    numberOfTelemetries,
    null,
  );
  entities.forEach((e) => {
    const input: TelemetryData = {
      rowKey: e.rowKey,
      timeStamp: e.timeStamp,
      data: e.props,
      raw: {},
      age: {
        lastReadTime: -1,
        ageInMinutes: -1,
      },
    };
    result.push(normalizeTelemetries(input, now));
  });
  return result;
}
