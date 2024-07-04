import React from "react";
import { ActionProps } from "../types";
import Title from "../title";

const Settings: React.FC<ActionProps> = ({ title }) => {
  return (
    <div>
      <Title title={title} />
      <table className="table is-narrow is-bordered is-striped">
        <tbody>
          <tr>
            <td>Application version</td>
            <td>0.0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Settings;
