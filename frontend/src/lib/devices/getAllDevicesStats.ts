import * as storage from 'azure-storage';

import { TableStorageRecord } from '../tableStorage/types';
import visitDeviceStatus from '../tableStorage/visitDeviceStatus';

export interface DeviceVersionData {
  version: string;
  nbDevices: number;
}

export interface DeviceWaterlevelStats {
  invalidCount: number;
  validCount: number;
  azureIdsForInvalidValues: string[];
}

function isNumeric(str: string): boolean {
  if (typeof str != 'string') return false; // we only process strings!
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !isNaN(str as any) && !isNaN(parseFloat(str));
}

// stats about versions distribution
export interface DeviceVersionStats {
  distribution: DeviceVersionData[];
  others: {
    versions: string[];
    count: number;
  };
}

const MIN_VERSION_COUNT = 10;
const MAX_MINUTES_ACTIVE = 12 * 60; // 12 hours

export interface DevicesStatsResponse {
  when: string;
  nbDevices: number;
  processingDurationMs: number;
  // distribution per version
  versionStats: DeviceVersionStats;
  // water level stats
  waterLevelStats: DeviceWaterlevelStats;
  waterLevelStatsActive: DeviceWaterlevelStats;
}

function mkDeviceStatsProcessor(now: Date) {
  const versionDistribution: DeviceVersionData[] = [];
  const wlData: DeviceWaterlevelStats = {
    invalidCount: 0,
    validCount: 0,
    azureIdsForInvalidValues: [],
  };
  const wlDataActive: DeviceWaterlevelStats = {
    invalidCount: 0,
    validCount: 0,
    azureIdsForInvalidValues: [],
  };
  let deviceCount = 0;
  return {
    processor: (entity: TableStorageRecord): boolean => {
      deviceCount++;
      const azDeviceId = entity.props['_azDeviceId'];
      const version = entity.props['version'];
      const water_lvl = entity.props['water_lvl'];
      //const wl_errors = entity.props['wl_errors'];
      const messageTimeStamp = entity.props['_messageTimeStamp'];

      const ts = new Date(messageTimeStamp);
      const ageInMinutes = Math.round((now.getTime() - ts.getTime()) / 60000);
      const isActiveDevice = ageInMinutes < MAX_MINUTES_ACTIVE;

      // version processing
      const stat = versionDistribution.find((s) => s.version === version);
      if (stat) {
        stat.nbDevices += 1;
      } else {
        versionDistribution.push({
          version,
          nbDevices: 1,
        });
      }

      // waterlevel values processing
      if (isNumeric(water_lvl)) {
        wlData.validCount++;
        if (isActiveDevice) {
          wlDataActive.validCount++;
        }
      } else {
        wlData.invalidCount++;
        wlData.azureIdsForInvalidValues.push(azDeviceId);
        if (isActiveDevice) {
          wlDataActive.invalidCount++;
          wlDataActive.azureIdsForInvalidValues.push(azDeviceId);
        }
      }

      // we want process all the records
      return true;
    },
    deviceVersions(): DeviceVersionData[] {
      return versionDistribution;
    },
    waterLevelData(): DeviceWaterlevelStats {
      return wlData;
    },
    waterLevelDataActive(): DeviceWaterlevelStats {
      return wlDataActive;
    },
    deviceCount(): number {
      return deviceCount;
    },
  };
}

export default async function getAllDeviceStats(
  tableService: storage.TableService,
  now: Date,
): Promise<DevicesStatsResponse> {
  try {
    const response: DevicesStatsResponse = {
      when: now.toISOString(),
      nbDevices: 0,
      versionStats: {
        distribution: [],
        others: {
          versions: [],
          count: 0,
        },
      },
      waterLevelStats: {
        validCount: 0,
        invalidCount: 0,
        azureIdsForInvalidValues: [],
      },
      waterLevelStatsActive: {
        validCount: 0,
        invalidCount: 0,
        azureIdsForInvalidValues: [],
      },
      processingDurationMs: 0,
    };
    const t0 = new Date().getTime();
    const processor = mkDeviceStatsProcessor(now);
    await visitDeviceStatus(
      tableService,
      ['_azDeviceId', '_messageTimeStamp', 'version', 'water_lvl', 'wl_errors'],
      processor.processor,
    );
    // we return the version distribution data
    const unsortedVersionsResults = processor.deviceVersions();
    // isolate the versions that have a count less than MIN_VERSION_COUNT
    unsortedVersionsResults
      .filter((v) => v.nbDevices <= MIN_VERSION_COUNT)
      .forEach((v) => {
        response.versionStats.others.versions.push(v.version);
        response.versionStats.others.count += v.nbDevices;
      });
    // order by device count for major versions
    const distribution = unsortedVersionsResults
      .filter((v) => v.nbDevices > MIN_VERSION_COUNT)
      .sort((v1, v2) => v2.nbDevices - v1.nbDevices);
    response.versionStats.distribution = distribution;

    // water level data
    const wlData = processor.waterLevelData();
    response.waterLevelStats = wlData;
    response.waterLevelStatsActive = processor.waterLevelDataActive();
    response.nbDevices = processor.deviceCount();
    const t1 = new Date().getTime();
    response.processingDurationMs = Math.floor(t1 - t0);
    return response;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
