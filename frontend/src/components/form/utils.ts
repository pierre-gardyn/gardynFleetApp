import { FormValue } from "./types";

export function getIntValue(values: FormValue[], fieldId: string): number {
  const formValue = values.find((v) => v.fieldId === fieldId);
  if (!formValue) {
    throw new Error(`unknown prop: ${fieldId}`);
  }
  if (formValue.fieldType !== "number") {
    throw new Error(`wrong type for prop: ${fieldId}`);
  }
  return formValue.value;
}

export function getStringValue(values: FormValue[], fieldId: string): string {
  const formValue = values.find((v) => v.fieldId === fieldId);
  if (!formValue) {
    throw new Error(`unknown prop: ${fieldId}`);
  }
  if (formValue.fieldType !== "string") {
    throw new Error(`wrong type for prop: ${fieldId}`);
  }
  return formValue.value;
}

export function getBooleanValue(values: FormValue[], fieldId: string): boolean {
  const formValue = values.find((v) => v.fieldId === fieldId);
  if (!formValue) {
    throw new Error(`unknown prop: ${fieldId}`);
  }
  if (formValue.fieldType !== "boolean") {
    throw new Error(`wrong type for prop: ${fieldId}`);
  }
  return formValue.value;
}
