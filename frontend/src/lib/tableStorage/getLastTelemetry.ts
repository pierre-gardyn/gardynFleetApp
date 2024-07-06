import * as storage from 'azure-storage';
import getEntity from './getEntity';
import { ageInMinutes, timeAgo } from '../utils';

const DEVICE_STATUS_TABLE = 'devicestatus';

export interface LastTelemetry {
  azDeviceId: string;
  error?: string;
  lastTelemetry: {
    when: string;
    sinceNow: string;
    ageInMinutes: number;
  };
  telemetries: Record<string, string>;
}

export async function getLastTelemetry(
  tableService: storage.TableService,
  now: Date,
  azDeviceId: string,
): Promise<LastTelemetry> {
  const result: LastTelemetry = {
    azDeviceId,
    lastTelemetry: {
      when: '',
      sinceNow: '',
      ageInMinutes: -1,
    },
    telemetries: {},
  };
  const partitionKey = 'telemetries';
  const rowKey = `azd:${azDeviceId}`;
  const records = await getEntity(
    tableService,
    DEVICE_STATUS_TABLE,
    partitionKey,
    rowKey,
    [],
  );
  if (records.length !== 1) {
    result.error = `wrong number of records: ${records.length} [${DEVICE_STATUS_TABLE}:${partitionKey}/${rowKey}]`;
    return result;
  }
  const record = records[0];
  result.telemetries = record.props;

  const lastTelemetry = record.timeStamp;
  result.lastTelemetry.when = new Date(lastTelemetry).toISOString();
  result.lastTelemetry.sinceNow = timeAgo(now, new Date(lastTelemetry));
  result.lastTelemetry.ageInMinutes = ageInMinutes(
    now,
    new Date(lastTelemetry),
  );

  return result;
}
