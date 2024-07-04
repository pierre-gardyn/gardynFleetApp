import React, { useState, useCallback } from "react";
import classnames from "classnames";

function isInteger(str: string): boolean {
  if (!str) {
    return true;
  }
  // Regular expression to check if the string represents an integer
  const integerRegex = /^-?\d+$/;

  // Test the string against the regular expression
  return integerRegex.test(str);
}

// Define the type for the component's props
interface FieldNumberProps {
  id: string;
  label: string;
  initialValue: number;
  helpText: string;
  onValidate: (id: string, value: number) => [boolean, string];
  onUpdateValue: (id: string, value: number) => void;
}

const FieldNumber: React.FC<FieldNumberProps> = ({
  id,
  label,
  initialValue,
  helpText,
  onValidate,
  onUpdateValue,
}) => {
  const [inputValue, setInputValue] = useState("" + initialValue);
  const [errorText, setErrorText] = useState("");
  const [inError, setInError] = useState(false);
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      if (isInteger(value)) {
        const intValue = +value;
        setInputValue(value);
        onUpdateValue(id, intValue);
        const [isValid, errorMessage] = onValidate(id, intValue);
        if (!isValid) {
          setErrorText(errorMessage);
          setInError(true);
        } else {
          setErrorText("");
          setInError(false);
        }
      } else {
        // invalid input
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

export default FieldNumber;
