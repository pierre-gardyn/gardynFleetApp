import React, { useState, useCallback } from "react";
import classnames from "classnames";

// Define the type for the component's props
interface FieldStringProps {
  id: string;
  label: string;
  initialValue: string;
  helpText: string;
  onValidate: (id: string, value: string) => [boolean, string];
  onUpdateValue: (id: string, value: string) => void;
}

const FieldString: React.FC<FieldStringProps> = ({
  id,
  label,
  initialValue,
  helpText,
  onValidate,
  onUpdateValue,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [errorText, setErrorText] = useState("");
  const [inError, setInError] = useState(false);
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      onUpdateValue(id, value);
      const [isValid, errorMessage] = onValidate(id, value);
      if (!isValid) {
        setErrorText(errorMessage);
        setInError(true);
      } else {
        setErrorText("");
        setInError(false);
      }
    },
    [id, onUpdateValue, onValidate]
  );

  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="control">
        <input
          className={classnames("input", { "is-danger": inError })}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
        />
      </div>
      <p className="help is-success">{helpText}</p>
      {inError && <p className="help is-danger">{errorText}</p>}
    </div>
  );
};

export default FieldString;
