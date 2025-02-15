import { useCallback, useEffect, useState } from "react";
import SideMenu, {
  SideMenuItemDescription,
} from "./components/sidemenu/Sidemenu";
import ActionCheckFleet from "./components/actionCheckFleet";
import EmptyActionComponent from "./components/EmptyActionComponent";
import Settings from "./components/settings";
import ActionDeviceStatus from "./components/actionDeviceStatus";
import { AppProvider } from "./context/AppContext";
import DevicesList from "./components/devicesList";

type RenderActionComponent = (title: string) => JSX.Element;

interface AppMenuDescription extends SideMenuItemDescription {
  render: RenderActionComponent;
}

const sideMenuItems: AppMenuDescription[] = [
  {
    id: "check_fleet",
    title: "Check fleet",
    render: (title: string) => <ActionCheckFleet title={title} />,
  },
  {
    id: "device_status",
    title: "Device Status",
    render: (title: string) => <ActionDeviceStatus title={title} />,
  },
  {
    id: "sep01",
    title: "Admin",
    render: (title: string) => <div />, // won't be called because non selectable
    isNotSelectable: true,
  },
  {
    id: "devices_list",
    title: "List of devices",
    render: (title: string) => <DevicesList title={title} />,
  },
  {
    id: "settings",
    title: "Settings",
    render: (title: string) => <Settings title={title} />,
  },
];

function App() {
  const [currentComponent, setCurrentComponent] = useState<JSX.Element>(
    <EmptyActionComponent />
  );

  useEffect(() => {}, []);

  const onSelectedItem = useCallback((id: string, title: string) => {
    const item = sideMenuItems.find((item) => item.id === id);
    if (item) {
      setCurrentComponent(item.render(title));
    } else {
      setCurrentComponent(<EmptyActionComponent />);
    }
  }, []);

  return (
    <AppProvider>
      <div id="App" className="container is-fluid p-2">
        <div className="columns full-height ">
          <div className="column is-one-quarter has-background-light">
            <SideMenu items={sideMenuItems} onSelectedItem={onSelectedItem} />
          </div>
          <div className="column">{currentComponent}</div>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
