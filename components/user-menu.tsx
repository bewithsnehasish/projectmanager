import React from "react";
import { UserButton } from "@clerk/nextjs";
import { ChartNoAxesGantt } from "lucide-react";

const UserMenu = () => {
  return (
    <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }}>
      <UserButton.MenuItems>
        <UserButton.Link
          label="My Organizations"
          labelIcon={<ChartNoAxesGantt size={20} />}
          href="/onboarding"
        />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default UserMenu;
