import React, { useCallback } from "react";
import { ActionProps } from "../types";
import ActionForm from "../form";
import { FormItem, FormValue } from "../form/types";
import Title from "../title";
import { getBooleanValue, getIntValue, getStringValue } from "../form/utils";
import MessageLogs, { useLogs } from "../messageLogs";
import { getFilteredListDevices } from "../../utils/getFilteredListDevices";

const HW_PROFILES = ["hw_gm10", "hw_gh40", "hw_gh30"];

const formItems: FormItem[] = [
  //
  {
    fieldId: "appVersion",
    fieldType: "string",
    helpText: "device selection: the version of the app (or empty string)",
    label: "Application version on pi",
    value: "",
    validate: (value: string) => {
      return [true, ""];
    },
  },
  {
    fieldId: "hwProfile",
    fieldType: "string",
    helpText: `device selection: : the hardware profile of the pi (${HW_PROFILES.join(
      ","
    )})`,
    label: "Hardware profile of pi",
    value: "",
    validate: (value: string) => {
      if (value === "") {
        return [true, ""];
      }
      if (!HW_PROFILES.includes(value)) {
        return [false, `hw profile must be one of: ${HW_PROFILES.join(",")}`];
      }
      return [true, ""];
    },
  },
  {
    fieldId: "lastOtaAction",
    fieldType: "string",
    helpText:
      "device selection: : devices that have this last ota action being sent",
    label: "Last ota action sent to device",
    value: "",
    validate: (value: string) => {
      if (value === "") {
        return [true, ""];
      }
      if (value.trim().length === 0) {
        return [false, `must be a non empty string`];
      }
      return [true, ""];
    },
  },
  {
    fieldId: "onlyEmployeeDevices",
    fieldType: "boolean",
    helpText: "check true if you want only employee devices",
    label: "Limit to employee devices only",
    value: false,
  },
  {
    fieldId: "nbDays",
    fieldType: "number",
    helpText: "number of days to retrieve data for each device",
    label: "Number of days",
    value: 1,
    validate: (value: number) => {
      if (value < 0 || value > 50) {
        return [false, "value must be between 0 and 50"];
      }
      return [true, ""];
    },
  },
];

const ActionCheckFleet: React.FC<ActionProps> = ({ title }) => {
  const { logs, addLog, clear } = useLogs();

  const doExecute = useCallback(
    async (values: FormValue[]) => {
      // we clear the logs
      clear();
      console.log("# execute with values:", values);

      const appVersion = getStringValue(values, "appVersion");
      const hwProfile = getStringValue(values, "hwProfile");
      const lastOtaAction = getStringValue(values, "lastOtaAction");
      const onlyEmployeeDevices = getBooleanValue(
        values,
        "onlyEmployeeDevices"
      );
      const nbDays = getIntValue(values, "nbDays");

      addLog(`retrieving list of devices`);
      const devices = await getFilteredListDevices({
        appVersion,
        hwProfile,
        lastOtaAction,
        onlyEmployeeDevices,
      });
      addLog(`list of devices: nbDevices=${devices.length}`);
      addLog(`devices: ${devices.map((d) => d.AzureDeviceId).join(",")}`);

      addLog("DONE");
    },
    [addLog, clear]
  );

  const doAbort = useCallback((): Promise<void> => {
    // nothing fo do, yet?
    return Promise.resolve();
  }, []);

  const doClear = useCallback((): Promise<void> => {
    clear();
    return Promise.resolve();
  }, [clear]);

  return (
    <div>
      <Title title={title} />

      <ActionForm
        items={formItems}
        doExecute={doExecute}
        doAbort={doAbort}
        doClear={doClear}
      />

      <hr />
      <MessageLogs logs={logs} />
    </div>
  );
};

export default ActionCheckFleet;
