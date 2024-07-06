import React, { useCallback } from "react";
import classnames from "classnames";

// Define the type for the component's props
interface SideMenuItemProps {
  id: string;
  title: string;
  isSelected: boolean;
  isSelectable?: boolean;
  onSelectedItem: (id: string, title: string) => void;
}

const SideMenuItem: React.FC<SideMenuItemProps> = ({
  id,
  title,
  isSelected,
  onSelectedItem,
}) => {
  const onClick = useCallback(() => {
    onSelectedItem(id, title);
  }, [id, onSelectedItem, title]);
  // Return the component's JSX
  return (
    <div>
      <p
        onClick={onClick}
        className={classnames({ "has-background-success-light": isSelected })}
      >
        {title}
      </p>
    </div>
  );
};

export default SideMenuItem;
