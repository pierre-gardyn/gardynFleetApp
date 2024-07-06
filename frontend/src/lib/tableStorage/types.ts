export interface TableStorageRecord {
  partitionKey: string;
  rowKey: string;
  timeStamp: string;
  props: Record<string, string>;
}

export type TableStorageEntityProcessor = (
  entity: TableStorageRecord,
) => boolean;

export interface TelemetryData {
  rowKey: string;
  timeStamp: string;
  data: Record<string, string | number | null>;
  raw: Record<string, unknown>;
  age: {
    lastReadTime: number;
    ageInMinutes: number;
  };
}
