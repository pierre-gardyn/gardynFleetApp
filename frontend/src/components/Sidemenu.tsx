import React, { useState, useCallback } from "react";
import SideMenuItem from "./SidemenuItem";

export interface SideMenuItemDescription {
  id: string;
  title: string;
}

// Define the type for the component's props
interface SideMenuProps {
  items: SideMenuItemDescription[];
  onSelectedItem: (id: string, title: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ items, onSelectedItem }) => {
  const [selectedItem, setSelectedItem] = useState("");

  const onSelection = useCallback(
    (id: string, title: string) => {
      setSelectedItem(id);
      onSelectedItem(id, title);
    },
    [onSelectedItem]
  );
  return (
    <div>
      {items.map((item) => (
        <SideMenuItem
          key={item.id}
          id={item.id}
          title={item.title}
          onSelectedItem={onSelection}
          isSelected={selectedItem === item.id}
        />
      ))}
    </div>
  );
};

export default SideMenu;
