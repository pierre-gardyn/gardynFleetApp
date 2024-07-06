import React, { useCallback } from "react";
import { ActionProps } from "../types";
import Title from "../title";
import Title2 from "../title/title2";
import { useAppContext } from "../../context/AppContext";

const DevicesList: React.FC<ActionProps> = ({ title }) => {
  const {
    deviceListStatus,
    deviceListProgress,
    deviceListRefresh,
    isDeviceListRefreshing,
  } = useAppContext();

  const onRefresh = useCallback(() => {
    deviceListRefresh();
  }, [deviceListRefresh]);
  return (
    <div>
      <Title title={title} />
      {isDeviceListRefreshing && (
        <>
          <div className="notification is-danger is-light">
            loading list of devices in progress
          </div>
          <Title2 title="Device update status" />
          <div className="notification is-warning is-light">
            {deviceListProgress}
          </div>
        </>
      )}
      <Title2 title="Current list of devices" />
      <pre>{deviceListStatus}</pre>
      <hr />
      {!isDeviceListRefreshing && (
        <div className="buttons is-centered">
          <button className="button is-primary" onClick={onRefresh}>
            Refresh list of devices
          </button>
        </div>
      )}
    </div>
  );
};

export default DevicesList;
