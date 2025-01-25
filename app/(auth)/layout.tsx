import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const layout: React.FC<LayoutProps> = ({ children }) => {
  return <div className="flex justify-center pt-20 pb-5">{children}</div>;
};

export default layout;
