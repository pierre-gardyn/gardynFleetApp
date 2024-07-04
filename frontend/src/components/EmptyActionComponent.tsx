import React from "react";
import classnames from "classnames";

const EmptyActionComponent: React.FC = () => {
  return (
    <div>
      <p className={classnames({ "has-background-success-light": true })}>
        Nothing selected
      </p>
    </div>
  );
};

export default EmptyActionComponent;
