import React from "react";
import { ActionProps } from "../types";
import Title from "../title";

const ActionDeviceStatus: React.FC<ActionProps> = ({ title }) => {
  return (
    <div>
      <Title title={title} />
      <div className="notification is-warning is-light">
        Not implemented yet.
      </div>
    </div>
  );
};

export default ActionDeviceStatus;
