import { z } from "zod";
import { GetFilteredListOfDevices } from "../../wailsjs/go/main/App";

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

export async function getFilteredListDevices(
  filter: DeviceFilter
): Promise<DeviceOta[]> {
  try {
    const rawDevices = await GetFilteredListOfDevices({
      AppVersion: filter.appVersion,
      HwProfile: filter.hwProfile,
      LastOtaAction: filter.lastOtaAction,
      OnlyEmployeeDevices: filter.onlyEmployeeDevices,
    });
    const devices = deviceListSchema.parse(rawDevices);
    return devices;
  } catch (err) {
    console.log("# Error in getFilteredListDevices");
    console.log(err);
    return [];
  }
}
