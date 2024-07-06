import React from "react";
import classnames from "classnames";

// Define the type for the component's props
interface Title2Props {
  title: string;
}

const Title2: React.FC<Title2Props> = ({ title }) => {
  return (
    <h3 className={classnames("is-size-3", "has-text-left", "mb-4")}>
      {title}
    </h3>
  );
};

export default Title2;
