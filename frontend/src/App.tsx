import { useCallback, useEffect, useState } from "react";
import SideMenu, { SideMenuItemDescription } from "./components/Sidemenu";
import ActionCheckFleet from "./components/actionCheckFleet";
import EmptyActionComponent from "./components/EmptyActionComponent";

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
    id: "b",
    title: "option B",
    render: (title: string) => <ActionCheckFleet title={title} />,
  },
  {
    id: "c",
    title: "option C",
    render: (title: string) => <ActionCheckFleet title={title} />,
  },
  {
    id: "d",
    title: "option D",
    render: (title: string) => <ActionCheckFleet title={title} />,
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
    <div id="App" className="container is-fluid p-2">
      <div className="columns full-height ">
        <div className="column is-one-quarter has-background-light">
          <SideMenu items={sideMenuItems} onSelectedItem={onSelectedItem} />
        </div>
        <div className="column">{currentComponent}</div>
      </div>
    </div>
  );
}

export default App;
