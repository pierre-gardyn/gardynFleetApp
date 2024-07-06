import React from "react";
import classnames from "classnames";

// Define the type for the component's props
interface SideMenuSeparatorProps {
  id: string;
  title: string;
}

const SideMenuSeparator: React.FC<SideMenuSeparatorProps> = ({ id, title }) => {
  return (
    <div>
      <p
        className={classnames(
          "has-background-link-light",
          "has-text-centered",
          "has-text-warning-dark"
        )}
      >
        {title}
      </p>
    </div>
  );
};

export default SideMenuSeparator;
