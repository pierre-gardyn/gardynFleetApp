import React from "react";
import FieldString from "./FieldString";
import FieldBoolean from "./FieldBoolean";
import FieldNumber from "./FieldNumber";
import { FormItem, FormValue } from "./types";

function renderItem(
  item: FormItem,
  doUpdateValue: (value: FormValue, label: string) => void
): JSX.Element {
  switch (item.fieldType) {
    case "string":
      return (
        <FieldString
          key={item.fieldId}
          id={item.fieldId}
          initialValue={item.value}
          label={item.label}
          helpText={item.helpText}
          onValidate={(id: string, value: string): [boolean, string] => {
            return item.validate(value);
          }}
          onUpdateValue={(id: string, value: string) => {
            doUpdateValue(
              {
                fieldId: id,
                fieldType: "string",
                value,
              },
              item.label
            );
          }}
        />
      );
    case "number":
      return (
        <FieldNumber
          key={item.fieldId}
          id={item.fieldId}
          initialValue={item.value}
          label={item.label}
          helpText={item.helpText}
          onValidate={(id: string, value: number): [boolean, string] => {
            return item.validate(value);
          }}
          onUpdateValue={(id: string, value: number) => {
            doUpdateValue(
              {
                fieldId: id,
                fieldType: "number",
                value,
              },
              item.label
            );
          }}
        />
      );
    case "boolean":
      return (
        <FieldBoolean
          key={item.fieldId}
          id={item.fieldId}
          label={item.label}
          initialValue={item.value}
          helpText={item.helpText}
          onUpdateValue={(id: string, value: boolean) => {
            doUpdateValue(
              {
                fieldId: id,
                fieldType: "boolean",
                value,
              },
              item.label
            );
          }}
        />
      );
    default:
      return <p>invalid type</p>;
  }
}

// Define the type for the component's props
export interface FormFieldsProps {
  items: FormItem[];
  doUpdateValue: (value: FormValue, label: string) => void;
}

const FormFields: React.FC<FormFieldsProps> = ({ items, doUpdateValue }) => {
  return <div>{items.map((item) => renderItem(item, doUpdateValue))}</div>;
};

export default FormFields;
