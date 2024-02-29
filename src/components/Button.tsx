import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  onClick: () => void;
}

const Button = ({ children, onClick }: Props) => {
  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;