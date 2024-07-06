import * as storage from "azure-storage";

import { TableStorageRecord } from "../tableStorage/types";
import visitOtaDevices from "../tableStorage/visitOtaDevices";
//import { collectListOfDevices } from '../sql/collectListDevices';
//import { chunkArray } from '../utils';

export interface DeviceInformation {
  serial: string;
  timestamp: string;
  action_to_run: string;
  app_version: string;
  azure_device_id: string;
  call_count: string;
  hw_profile: string;
  is_employee_device: boolean;
  // last_action_response: string,
  last_action_sent: string;
  ota_agent_version: string;
  timestamp_device_created: string;
  timestamp_last_action_sent: string;
  timestamp_last_ping: string;
  timestamp_response_received: string;
  note: string;
}

export interface FleetStats {
  when: string;
  devices: DeviceInformation[];
  skipped: number;
  total: number;
}

interface VisitorFilter {
  appVersion: string | undefined;
  hwProfile: string | undefined;
  lastOtaAction: string | undefined;
  onlyEmployeeDevices: boolean;
}

function mkDeviceStatsProcessor(filter: VisitorFilter) {
  const deviceInformation: DeviceInformation[] = [];
  let skipped: number = 0;
  let count: number = 0;

  return {
    processor: (entity: TableStorageRecord): boolean => {
      //const app_version = entity.props['app_version'];
      const timestamp = entity.props["Timestamp"];
      const appVersion = entity.props["app_version"];
      const hwProfile = entity.props["hw_profile"];
      const lastOtaAction = entity.props["last_action_sent"];
      const isEmployeeDevice = entity.props["is_employee_device"] === "true";
      count++;

      if (count % 5000 === 0) {
        console.log(`# parsing ota devices ${count} (skipped=${skipped})`);
      }
      // apply filters
      if (filter.appVersion && appVersion !== filter.appVersion) {
        skipped++;
        return true;
      }

      if (filter.hwProfile && hwProfile !== filter.hwProfile) {
        skipped++;
        return true;
      }

      if (filter.lastOtaAction && lastOtaAction !== filter.lastOtaAction) {
        skipped++;
        return true;
      }

      if (filter.onlyEmployeeDevices && !isEmployeeDevice) {
        skipped++;
        return true;
      }

      // partition key is like: serial:0003b849de44bcbea5a6b82c24d3a9e2
      const serial = entity.partitionKey.substring(7);

      const ts = new Date(timestamp);

      deviceInformation.push({
        serial: serial,
        timestamp: ts.toISOString(),
        action_to_run: entity.props["action_to_run"],
        app_version: appVersion,
        azure_device_id: entity.props["azure_device_id"],
        call_count: entity.props["call_count"],
        hw_profile: hwProfile,
        is_employee_device: isEmployeeDevice,
        // last_action_response: '',
        last_action_sent: lastOtaAction,
        ota_agent_version: entity.props["ota_agent_version"],
        timestamp_device_created: entity.props["timestamp_device_created"],
        timestamp_last_action_sent:
          entity.props["xtimestamp_last_action_sentx"],
        timestamp_last_ping: entity.props["timestamp_last_ping"],
        timestamp_response_received:
          entity.props["timestamp_response_received"],
        note: entity.props["note"],
      });

      // we want process all the records
      return true;
    },
    getDevices(): DeviceInformation[] {
      return deviceInformation;
    },
    getSkipped(): number {
      return skipped;
    },
    getTotal(): number {
      return count;
    },
  };
}

export default async function getOtaFleetStats(
  tableService: storage.TableService,
  now: Date,
  filter?: VisitorFilter
): Promise<FleetStats> {
  const processor = mkDeviceStatsProcessor(
    filter || {
      appVersion: undefined,
      lastOtaAction: undefined,
      hwProfile: undefined,
      onlyEmployeeDevices: false,
    }
  );
  console.log("# retrieve list of devices from gOtaDevices table storage...");

  await visitOtaDevices(
    tableService,
    [
      // Avoiding 'last_action_response' for now, it could contain a lot of text
      "PartitionKey",
      "Timestamp",
      "action_to_run",
      "app_version",
      "azure_device_id",
      "call_count",
      "hw_profile",
      "is_employee_device",
      "last_action_sent",
      "ota_agent_version",
      "timestamp_device_created",
      "timestamp_last_action_sent",
      "timestamp_last_ping",
      "timestamp_response_received",
      "note",
    ],
    processor.processor
  );
  const devices = processor.getDevices();
  console.log(
    `# we have ${devices.length} devices and skipped:${processor.getSkipped()}`
  );

  return {
    when: now.toISOString(),
    devices,
    skipped: processor.getSkipped(),
    total: processor.getTotal(),
  };
}
