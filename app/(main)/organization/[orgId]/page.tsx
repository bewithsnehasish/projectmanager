import React from "react";

const Organiztion = ({ params }: { params: { orgId: string } }) => {
  const { orgId } = params;
  return <div>{orgId}</div>;
};

export default Organiztion;
