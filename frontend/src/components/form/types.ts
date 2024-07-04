export interface FormFieldBase {
  fieldId: string;
  label: string;
  helpText: string;
}

interface FormFieldString extends FormFieldBase {
  fieldType: "string";
  value: string;
  validate: (value: string) => [boolean, string];
}

interface FormFieldNumber extends FormFieldBase {
  fieldType: "number";
  value: number;
  validate: (value: number) => [boolean, string];
}

interface FormFieldBoolean extends FormFieldBase {
  fieldType: "boolean";
  value: boolean;
}

export type FormItem = FormFieldString | FormFieldNumber | FormFieldBoolean;

// types to return parameters to action
export interface FormValueBase {
  fieldId: string;
}

interface FormValueString extends FormValueBase {
  fieldType: "string";
  value: string;
}

interface FormValueNumber extends FormValueBase {
  fieldType: "number";
  value: number;
}

interface FormValueBoolean extends FormValueBase {
  fieldType: "boolean";
  value: boolean;
}

export type FormValue = FormValueString | FormValueNumber | FormValueBoolean;
