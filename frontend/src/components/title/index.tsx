import React from "react";
import classnames from "classnames";

// Define the type for the component's props
interface TitleProps {
  title: string;
}

const Title: React.FC<TitleProps> = ({ title }) => {
  return (
    <h1
      className={classnames(
        "has-background-success-light",
        "is-size-3",
        "has-text-centered",
        "mb-4"
      )}
    >
      {title}
    </h1>
  );
};

export default Title;
