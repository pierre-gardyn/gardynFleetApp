import React, { useCallback } from "react";
import { ActionProps } from "../types";
import ActionForm from "../form";
import { FormItem, FormValue } from "../form/types";
import Title from "../title";

const formItems: FormItem[] = [
  {
    fieldId: "appVersion",
    fieldType: "string",
    helpText: "the version of the app for the gardyns (or empty string)",
    label: "Application version on pi",
    value: "",
    validate: (value: string) => {
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
  const doExecute = useCallback((values: FormValue[]) => {
    console.log("# execute with values:", values);
  }, []);

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
    </div>
  );
};

export default ActionCheckFleet;
