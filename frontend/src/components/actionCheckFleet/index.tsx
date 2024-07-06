import React, { useCallback } from "react";
import { ActionProps } from "../types";
import ActionForm from "../form";
import { FormItem, FormValue } from "../form/types";
import Title from "../title";
import { getBooleanValue, getIntValue, getStringValue } from "../form/utils";
import MessageLogs, { useLogs } from "../messageLogs";

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
    helpText:
      "device selection: : the hardware profile of the pi (hw_gm10, ...)",
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

      addLog(
        `ready to execute with appVersion=${appVersion}, onlyEmployeeDevices=${onlyEmployeeDevices}, nbDays=${nbDays}`
      );
      addLog("DONE");
    },
    [addLog, clear]
  );

  const doAbort = useCallback((): Promise<void> => {
    console.log("# aborting...");
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }, []);

  return (
    <div>
      <Title title={title} />

      <ActionForm items={formItems} doExecute={doExecute} doAbort={doAbort} />

      <MessageLogs logs={logs} />
    </div>
  );
};

export default ActionCheckFleet;
