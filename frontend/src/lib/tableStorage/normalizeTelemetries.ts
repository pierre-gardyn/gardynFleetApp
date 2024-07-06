// def normalize_temp(temp):
//     temp = float(temp) if temp else 0.0
//     if temp < 4.4444:
//         return '-'
//     else:
//         return temp

import { TelemetryData } from './types';

// def normalize_humidity(humidity, temp):
//     temp = float(temp) if temp else 0.0
//     if temp < 4.4444:
//         return '-'
//     else:
//         return humidity

function normalizeWaterLevel(waterLvl: number | string): number {
  waterLvl = typeof waterLvl === 'string' ? parseFloat(waterLvl) : waterLvl;
  waterLvl = isNaN(waterLvl) ? 50 : waterLvl;

  let percent = 0;

  if (waterLvl < 5) {
    percent = 100;
  } else if (waterLvl >= 5 && waterLvl < 6.5) {
    percent = 90;
  } else if (waterLvl >= 6.5 && waterLvl < 8) {
    percent = 80;
  } else if (waterLvl >= 8 && waterLvl < 9.5) {
    percent = 70;
  } else if (waterLvl >= 9.5 && waterLvl < 11) {
    percent = 60;
  } else if (waterLvl >= 11 && waterLvl < 12.5) {
    percent = 50;
  } else if (waterLvl >= 12.5 && waterLvl < 14) {
    percent = 40;
  } else if (waterLvl >= 14 && waterLvl < 15.5) {
    percent = 30;
  } else if (waterLvl >= 15.5 && waterLvl < 17) {
    percent = 20;
  } else if (waterLvl >= 17 && waterLvl < 18.5) {
    percent = 10;
  } else if (waterLvl >= 18.5 && waterLvl < 25.0) {
    percent = 0;
  } else if (waterLvl >= 25.0) {
    percent = 50;
  }

  return percent;
}

function isValidFloatValue(input: string | number): boolean {
  const parsedFloat = parseFloat('' + input);
  return !isNaN(parsedFloat);
}

function parseFloatOrDefaultValue(
  input: string,
  defaultValue: string,
): string | number {
  const parsedFloat = parseFloat(input);

  if (!isNaN(parsedFloat)) {
    return parsedFloat;
  } else {
    return defaultValue;
  }
}

function getGallonsNeeded(waterLvl: number | string): number | string {
  waterLvl = typeof waterLvl === 'string' ? parseFloat(waterLvl) : waterLvl;
  waterLvl = isNaN(waterLvl) ? 50 : waterLvl;

  let gallons: number | string = 0;

  if (waterLvl < 5) {
    gallons = 'overfilled';
  } else if (waterLvl >= 5 && waterLvl < 9.5) {
    gallons = 0;
  } else if (waterLvl >= 9.5 && waterLvl < 12.5) {
    gallons = 1;
  } else if (waterLvl >= 12.5 && waterLvl < 16) {
    gallons = 2;
  } else if (waterLvl >= 16 && waterLvl < 18) {
    gallons = 3;
  } else if (waterLvl >= 18 && waterLvl < 22) {
    gallons = 4;
  } else if (waterLvl >= 22 && waterLvl < 25) {
    gallons = 5;
  } else if (waterLvl >= 25.0) {
    gallons = 'error';
  }

  return gallons;
}

function fixInt(v: string, defaultValue: unknown): unknown {
  if (!v || v.length === 0) {
    return defaultValue;
  }
  if (
    ['', 'none', 'None', 'error', 'Error', 'null', 'NULL', 'Null'].includes(v)
  ) {
    return defaultValue;
  }

  const parsedInt = parseInt(v);
  if (isNaN(parsedInt)) {
    const parsedFloat = parseFloat(v);

    if (isNaN(parsedFloat)) {
      return defaultValue;
    } else {
      return parsedFloat;
    }
  } else {
    return parsedInt;
  }
}

function parseDateString(dateString: string): Date | null {
  const parsedDate = new Date(dateString);

  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  } else {
    return null;
  }
}

export default function normalizeTelemetries(
  input: TelemetryData,
  now: Date,
): TelemetryData {
  const telemDate = parseDateString(input.timeStamp);

  const output: TelemetryData = {
    rowKey: input.rowKey,
    timeStamp: input.timeStamp,
    data: {},
    raw: {},
    age: {
      lastReadTime: telemDate ? Math.round(telemDate.getTime() / 1000) : -1,
      ageInMinutes: telemDate
        ? Math.round((now.getTime() - telemDate.getTime()) / 60000)
        : -1,
    },
  };

  for (const key of Object.keys(input.data)) {
    const value = input.data[key];
    let newValue: unknown = null;
    let ignore = false;
    let hasNewValue = true;
    switch (key) {
      case '_messageTimeStamp':
        ignore = true;
        break;
      case 'temp':
      case 'humidity':
        newValue = parseFloatOrDefaultValue(value as string, '-');
        break;
      case 'light':
      case 'prev_light':
        newValue = fixInt(value as string, null);
        break;
      case 'water_lvl':
        newValue = normalizeWaterLevel(value ?? '');
        output.data['water_lvl_cm'] = parseFloatOrDefaultValue(
          value as string,
          '',
        );
        output.data['gallons_needed'] = getGallonsNeeded(value ?? '');
        output.data['is_valid_wl'] = isValidFloatValue(value ?? '') ? 1 : 0;
        output.data['raw_wl'] = value;
        break;

      case 'camera_status':
        {
          const intValue = fixInt(value as string, 1);
          newValue = intValue == 2 ? 'off' : 'on';
        }
        break;

      case 'signal':
        output.data['signal_strength'] = output.data['signal'];
        hasNewValue = false;
        break;

      default:
        hasNewValue = false;
        break;
    }
    if (!ignore) {
      // console.log(`${key}: ${value}`);
      output.data[key] = value;
      if (hasNewValue) {
        output.data[key] = newValue as string;
        output.raw[key] = value;
      } else {
        output.data[key] = value;
      }
    }
  }

  return output;
}
