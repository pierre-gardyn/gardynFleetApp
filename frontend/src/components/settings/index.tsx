import React, { useEffect, useState } from "react";
import { ActionProps } from "../types";
import Title from "../title";
import { DataDirectory, OperatingSystem } from "../../../wailsjs/go/main/App";

const Settings: React.FC<ActionProps> = ({ title }) => {
  const [dataDirectory, setDataDirectory] = useState("");
  const [os, setOs] = useState("");

  useEffect(() => {
    DataDirectory().then((v) => setDataDirectory(v));
    OperatingSystem().then((v) => setOs(v));
  }, []);
  return (
    <div>
      <Title title={title} />
      <table className="table is-narrow is-bordered is-striped">
        <tbody>
          <tr>
            <td>Application version</td>
            <td>0.0</td>
          </tr>
          <tr>
            <td>Data directory</td>
            <td>{dataDirectory}</td>
          </tr>
          <tr>
            <td>Operating system</td>
            <td>{os}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Settings;
