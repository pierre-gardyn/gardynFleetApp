import { z } from "zod";
import * as storage from "azure-storage";
import { config } from "../config";
import { selectDevices } from "../lib/utils";

const deviceOtaSchema = z.object({
  Serial: z.string(),
  AppVersion: z.string(),
  AzureDeviceId: z.string(),
  HwProfile: z.string(),
  IsEmployeeDevice: z.boolean(),
  LastActionSent: z.string(),
  Note: z.string(),
});

const deviceListSchema = z.array(deviceOtaSchema);

// export asscoaited type
export type DeviceOta = z.infer<typeof deviceOtaSchema>;

export interface DeviceFilter {
  appVersion: string;
  hwProfile: string;
  lastOtaAction: string;
  onlyEmployeeDevices: boolean;
}

export async function getTsFilteredListDevices(
  filter: DeviceFilter
): Promise<DeviceOta[]> {
  try {
    const tableService = storage.createTableService(
      config.STORAGE_MAINTABLE_CONNECTIONSTRING
    );
    const now = new Date();

    const [listDevices, total] = await selectDevices(
      tableService,
      -1,
      filter,
      now
    );
    console.log("@@@ getTsFilteredListDevices>listDevices", listDevices);
    console.log("@@@ getTsFilteredListDevices>total", total);
    return [];
  } catch (err) {
    console.log("# Error in getFilteredListDevices");
    console.log(err);
    return [];
  }
}
