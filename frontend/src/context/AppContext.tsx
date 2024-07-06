import React, { useCallback, useEffect, useState } from "react";
import { EventsOn } from "../../wailsjs/runtime";
import {
  UpdateOtaDeviceList,
  GetDevicesListStatus,
} from "../../wailsjs/go/main/App";
import { config } from "../config";

// see:
// https://gist.github.com/JLarky/5a1642abd8741f2683a817f36dd48e78
// from:
// https://blog.logrocket.com/how-to-use-react-context-typescript/
//
const EVENT_DEVICES_LIST = "devicesList";

function useProviderValue() {
  const [isDeviceListRefreshing, setIsDeviceListRefreshing] = useState(false);
  const [deviceListStatus, setDeviceListStatus] = useState("");
  const [deviceListProgress, setDeviceListProgress] = useState("");

  const refreshDeviceListStatus = useCallback(() => {
    console.log("@@ calling refreshDeviceListStatus...");
    GetDevicesListStatus()
      .then((status) => {
        console.log("@@@ refreshDeviceListStatus:", status);
        setDeviceListStatus(JSON.stringify(status, null, 2));
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    console.log("@@@ useEffect -- EventsOn");
    // Listen for "myEvent"
    EventsOn(EVENT_DEVICES_LIST, (anyData) => {
      const data = anyData as string;
      setDeviceListProgress(data);
      console.log(`[${EVENT_DEVICES_LIST}: Received myEvent:`, data);
      if (data.startsWith("!")) {
        setIsDeviceListRefreshing(false);
        refreshDeviceListStatus();
      }
    });

    return () => {
      // Clean up event listeners
      console.log("@@@ useEffect -- cleanup");
    };
  }, [refreshDeviceListStatus]);

  useEffect(() => {
    console.log("@@@ useEffect calls refreshDeviceListStatus...");
    refreshDeviceListStatus();
  }, [refreshDeviceListStatus]);

  const deviceListRefresh = useCallback(() => {
    console.log("@@@ AppContext calls deviceListRefresh...");
    if (isDeviceListRefreshing) {
      return "Device refresh already in progress";
    }

    UpdateOtaDeviceList(config.STORAGE_MAINTABLE_CONNECTIONSTRING);
    setIsDeviceListRefreshing(true);
    return "started";
  }, [isDeviceListRefreshing]);

  const getDevicesListStatus = useCallback(() => {}, []);

  return {
    isDeviceListRefreshing,
    deviceListRefresh,
    getDevicesListStatus,
    // status strings
    deviceListProgress,
    deviceListStatus,
  };
}

export type ContextType = ReturnType<typeof useProviderValue>;

const AppContext = React.createContext<ContextType | undefined>(undefined);
AppContext.displayName = "AppContext";

export const AppProvider = (props: React.PropsWithChildren) => {
  const value = useProviderValue();
  return <AppContext.Provider value={value} {...props} />;
};

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error(`useAppContext must be used within a Provider`);
  }
  return context;
}

export function useDeviceListRefresh() {
  const { deviceListRefresh } = useAppContext();
  return deviceListRefresh;
}

export function useDeviceListStatus() {
  const { getDevicesListStatus } = useAppContext();
  return getDevicesListStatus;
}
