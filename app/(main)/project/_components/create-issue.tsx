"use client";

import React, { useEffect } from "react";
import { BarLoader } from "react-spinners";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MDEditor from "@uiw/react-markdown-editor";
import useFetch from "@/hooks/use-fetch";
import { createIssue } from "@/actions/issues";
import { getOrganizationUsers } from "@/actions/organizations";
import { issueSchema } from "@/app/lib/validators";
import { z } from "zod";

// Define the props expected by the IssueCreationDrawer component
interface IssueCreationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId: string | number;
  status: string;
  projectId: string | number;
  onIssueCreated: () => void;
  orgId: string | number;
}

// Define the User interface based on the expected structure of organization users
interface User {
  id: string;
  name: string;
  // add other user properties if needed
}

// Infer the form data type from your Zod schema
type IssueFormData = z.infer<typeof issueSchema>;

export default function IssueCreationDrawer({
  isOpen,
  onClose,
  sprintId,
  status,
  projectId,
  onIssueCreated,
  orgId,
}: IssueCreationDrawerProps) {
  // You can adjust the generics for useFetch if you have proper types for your actions.
  const {
    loading: createIssueLoading,
    fn: createIssueFn,
    error,
    data: newIssue,
  } = useFetch<any>(createIssue);

  const {
    loading: usersLoading,
    fn: fetchUsers,
    data: users,
  } = useFetch<User[]>(getOrganizationUsers);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      // You can extend these default values to include all fields in your IssueFormData
      priority: "MEDIUM",
      description: "",
      assigneeId: "",
    } as Partial<IssueFormData>,
  });

  useEffect(() => {
    if (isOpen && orgId) {
      fetchUsers(orgId);
    }
  }, [isOpen, orgId, fetchUsers]);

  const onSubmit = async (data: IssueFormData) => {
    await createIssueFn(projectId, {
      ...data,
      status,
      sprintId,
    });
  };

  useEffect(() => {
    if (newIssue) {
      reset();
      onClose();
      onIssueCreated();
    }
    // Note: ensure that onClose, onIssueCreated, and reset are either stable (via useCallback)
    // or are safe to include in the dependency array.
  }, [newIssue, createIssueLoading, reset, onClose, onIssueCreated]);

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Issue</DrawerTitle>
        </DrawerHeader>
        {usersLoading && <BarLoader width="100%" color="#36d7b7" />}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message as string}
              </p>
            )}
          </div>

          {/* Assignee Field */}
          <div>
            <label
              htmlFor="assigneeId"
              className="block text-sm font-medium mb-1"
            >
              Assignee
            </label>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user: User) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assigneeId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.assigneeId.message as string}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <MDEditor
                  value={field.value as string}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Priority Field */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium mb-1"
            >
              Priority
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 mt-2">{error.message}</p>}

          <Button
            type="submit"
            disabled={createIssueLoading}
            className="w-full"
          >
            {createIssueLoading ? "Creating..." : "Create Issue"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
