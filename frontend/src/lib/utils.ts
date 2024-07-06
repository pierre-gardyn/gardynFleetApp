import * as storage from "azure-storage";
import getOtaFleetStats, {
  DeviceInformation,
} from "./devices/getOtaFleetStats";

export interface SelectDeviceFilter {
  appVersion: string | undefined;
  hwProfile: string | undefined;
  lastOtaAction: string | undefined;
  onlyEmployeeDevices: boolean;
}

export async function selectDevices(
  tableService: storage.TableService,
  maxDevices: number,
  filter: SelectDeviceFilter,
  now: Date
): Promise<[DeviceInformation[], number]> {
  console.log("# maxDevices:", maxDevices);
  console.log("# filer:", filter);

  const t0 = Date.now();
  const stats = await getOtaFleetStats(tableService, now, {
    ...filter,
  });
  console.log("# time to retrieve devices: ", Math.floor(Date.now() - t0));

  console.log("stats:");
  console.log(JSON.stringify(stats.devices, null, 2));
  console.log("# count: ", stats.devices.length);
  console.log("# skipped:", stats.skipped);
  console.log("# total:", stats.total);

  let actualDevices = stats.devices;

  if (maxDevices > 0 && stats.devices.length > maxDevices) {
    actualDevices = getRandomSubarray(stats.devices, maxDevices);
  }

  return [actualDevices, stats.total];
}

export function getRandomSubarray<T>(arr: T[], n: number): T[] {
  if (n > arr.length) {
    throw new Error("Requested subarray size is larger than the input array.");
  }

  const shuffledArray = arr.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray.slice(0, n);
}
