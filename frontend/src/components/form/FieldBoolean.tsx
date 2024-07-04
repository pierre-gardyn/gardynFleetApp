import React, { useState, useCallback } from "react";

// Define the type for the component's props
interface FieldBooleanProps {
  id: string;
  label: string;
  initialValue: boolean;
  helpText: string;
  onUpdateValue: (id: string, value: boolean) => void;
}

const FieldBoolean: React.FC<FieldBooleanProps> = ({
  id,
  label,
  initialValue,
  helpText,
  onUpdateValue,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(
    initialValue ? "true" : "false"
  );
  const handleOptionChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSelectedOption(value);
      const boolValue = value === "true";
      onUpdateValue(id, boolValue);
    },
    [id, onUpdateValue]
  );

  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="control">
        <label className="radio">
          <input
            type="radio"
            name="boolean"
            value="true"
            checked={selectedOption === "true"}
            onChange={handleOptionChange}
          />
          True
        </label>
        <label className="radio">
          <input
            type="radio"
            name="boolean"
            value="false"
            checked={selectedOption === "false"}
            onChange={handleOptionChange}
          />
          False
        </label>
      </div>
      <p className="help is-success">{helpText}</p>
    </div>
  );
};

export default FieldBoolean;
