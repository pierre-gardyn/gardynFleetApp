import React, { useCallback, useEffect, useState } from "react";
import { FormItem, FormValue } from "./types";
import FormFields from "./FormFields";
import ResultFields, { FieldItem } from "./ResultFields";

export interface ActionFormProps {
  items: FormItem[];
  doExecute: (values: FormValue[]) => void;
  doAbort: () => Promise<void>;
}

type AppState = "definition" | "ready" | "running";

const ActionForm: React.FC<ActionFormProps> = ({
  items,
  doExecute,
  doAbort,
}) => {
  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [formValues, setFormValues] = useState<FormValue[]>([]);
  const [fieldItems, setFieldItems] = useState<FieldItem[]>([]);

  useEffect(() => {
    const newFormItems: FormItem[] = [];
    const newFormValues: FormValue[] = [];
    const newFieldItems: FieldItem[] = [];
    items.forEach((item) => {
      newFormItems.push({
        ...item,
      });
      newFormValues.push({
        ...item,
      });
      newFieldItems.push({
        fieldId: item.fieldId,
        label: item.label,
        formValue: `${item.value}`,
      });
    });
    setFormItems(newFormItems);
    setFormValues(newFormValues);
    setFieldItems(newFieldItems);
  }, [items]);

  const [appState, setAppState] = useState<AppState>("definition");

  const onReady = useCallback(() => {
    setAppState("ready");
  }, []);

  const onCancel = useCallback(() => {
    setAppState("definition");
  }, []);

  const onAbort = useCallback(async () => {
    await doAbort();
    // TODO: actually abort
    setAppState("definition");
  }, [doAbort]);

  const doUpdateValue = useCallback(
    (value: FormValue, label: string) => {
      const newValues: FormValue[] = [];
      const newFieldItems: FieldItem[] = [];
      formValues.forEach((v) => {
        if (v.fieldId === value.fieldId) {
          newValues.push(value);
        } else {
          newValues.push(v);
        }
      });
      fieldItems.forEach((v) => {
        if (v.fieldId === value.fieldId) {
          newFieldItems.push({
            fieldId: value.fieldId,
            label: label,
            formValue: `${value.value}`,
          });
        } else {
          newFieldItems.push(v);
        }
      });
      setFormValues(newValues);
      setFieldItems(newFieldItems);
    },
    [fieldItems, formValues]
  );

  const onRun = useCallback(() => {
    setAppState("running");
    doExecute(formValues);
  }, [doExecute, formValues]);

  return (
    <div>
      {appState === "definition" && (
        <FormFields items={formItems} doUpdateValue={doUpdateValue} />
      )}
      <hr />
      {appState === "definition" && (
        <div className="buttons is-centered">
          <button className="button is-primary" onClick={onReady}>
            Ready
          </button>
        </div>
      )}
      {appState !== "definition" && <ResultFields items={fieldItems} />}
      {appState === "ready" && (
        <div className="buttons is-centered">
          <button className="button is-primary" onClick={onRun}>
            Run
          </button>
          <button className="button is-warning" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
      {appState === "running" && (
        <div className="buttons is-centered">
          <button className="button is-warning" onClick={onAbort}>
            Abort
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionForm;
