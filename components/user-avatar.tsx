import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string; // Make imageUrl optional
  key: string;
}

interface UserAvatarProps {
  user?: User; // Make user optional to handle unassigned cases
}

const UserAvatar = ({ user }: UserAvatarProps) => {
  return (
    <div className="flex items-center space-x-2 w-full">
      <Avatar className="h-6 w-6">
        <AvatarImage src={user?.imageUrl} alt={user?.firstName} />
        <AvatarFallback className="capitalize">
          {user?.firstName ? user.firstName[0] + user?.lastName[0] : "?"}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs text-gray-500">
        {user ? `${user.firstName} ${user.lastName}` : "Unassigned"}
      </span>
    </div>
  );
};

export default UserAvatar;
