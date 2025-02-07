"use client";

import { OrganizationList, useOrganization } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";

const Onboarding = () => {
  const { isLoaded } = useOrganization(); // Check if organization data is ready
  const [listLoaded, setListLoaded] = useState(false);

  // Hide loader when OrganizationList is ready
  useEffect(() => {
    if (isLoaded) {
      setListLoaded(true);
    }
  }, [isLoaded]);

  // Show loader until OrganizationList is ready
  if (!listLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <OrganizationList
        hidePersonal
        afterCreateOrganizationUrl="/organization/:slug"
        afterSelectOrganizationUrl="/organization/:slug"
      />
    </div>
  );
};

export default Onboarding;
