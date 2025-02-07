"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import IssueDetailsDialog from "./issue-details-dialog";
import UserAvatar from "./user-avatar";
import { useRouter } from "next/navigation";
import { string } from "zod";

interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  key: string;
  imageUrl?: string; // Added optional properties
  clerkUserId?: string;
}

interface Issue {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: string;
  createdAt: string;
  assignee: User;
  reporter: User;
  projectId: string;
  sprintId: string;
}

interface IssueCardProps {
  issue: Issue;
  showStatus?: boolean;
  onDelete?: (issueId: string) => void;
  onUpdate?: (issue: Issue) => void;
}

const priorityColor: Record<Issue["priority"], string> = {
  LOW: "border-green-600",
  MEDIUM: "border-yellow-300",
  HIGH: "border-orange-400",
  URGENT: "border-red-400",
};

export default function IssueCard({
  issue,
  showStatus = false,
  onDelete = () => undefined,
  onUpdate = () => undefined,
}: IssueCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const onDeleteHandler = (issueId: string) => {
    router.refresh();
    if (onDelete) onDelete(issueId);
  };

  const onUpdateHandler = (updatedIssue: Issue) => {
    router.refresh();
    if (onUpdate) onUpdate(updatedIssue);
  };

  const created = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader
          className={`border-t-2 ${priorityColor[issue.priority]} rounded-lg`}
        >
          <CardTitle>{issue.title}</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-2 -mt-3">
          {showStatus && <Badge>{issue.status}</Badge>}
          <Badge variant="outline" className="-ml-1">
            {issue.priority}
          </Badge>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-3">
          <UserAvatar user={issue.assignee} />

          <div className="text-xs text-gray-400 w-full">Created {created}</div>
        </CardFooter>
      </Card>

      {isDialogOpen && (
        <IssueDetailsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          issue={issue}
          onDelete={() => onDeleteHandler(issue.id)}
          onUpdate={onUpdateHandler}
          borderCol={priorityColor[issue.priority]}
        />
      )}
    </>
  );
}
