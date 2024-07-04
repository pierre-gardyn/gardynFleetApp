import React from "react";

export interface FieldItem {
  fieldId: string;
  label: string;
  formValue: string;
}
interface ResultFieldsProps {
  items: FieldItem[];
}

const ResultFields: React.FC<ResultFieldsProps> = ({ items }) => {
  return (
    <table className="table is-narrow">
      <tbody>
        {items.map((item) => {
          return (
            <tr key={item.fieldId}>
              <td>{item.label}</td>
              <td>{item.formValue}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ResultFields;
