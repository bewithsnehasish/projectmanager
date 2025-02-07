import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the priority options
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
type Priority = (typeof priorities)[number]; // "LOW" | "MEDIUM" | "HIGH" | "URGENT"

// Define the shape of an assignee
interface Assignee {
  id: string;
  name: string;
  imageUrl?: string;
}

// Define the shape of an issue
interface Issue {
  id: string;
  title: string;
  assignee?: Assignee;
  priority: Priority;
}

// Define the props for the BoardFilters component
interface BoardFiltersProps {
  issues: Issue[];
  onFilterChange: (filteredIssues: Issue[]) => void;
}

export default function BoardFilters({
  issues,
  onFilterChange,
}: BoardFiltersProps) {
  // State for search term, selected assignees, and selected priority
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<Priority | "">("");

  // Extract unique assignees from the issues
  const assignees = issues
    .map((issue) => issue.assignee)
    .filter(
      (item, index, self) =>
        item && index === self.findIndex((t) => t?.id === item.id),
    )
    .filter((item): item is Assignee => item !== undefined); // Ensure no undefined values

  // Apply filters whenever searchTerm, selectedAssignees, selectedPriority, or issues change
  useEffect(() => {
    const filteredIssues = issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedAssignees.length === 0 ||
          (issue.assignee && selectedAssignees.includes(issue.assignee.id))) &&
        (selectedPriority === "" || issue.priority === selectedPriority),
    );
    onFilterChange(filteredIssues);
  }, [searchTerm, selectedAssignees, selectedPriority, issues, onFilterChange]);

  // Toggle an assignee in the selectedAssignees list
  const toggleAssignee = (assigneeId: string) => {
    setSelectedAssignees(
      (prev) =>
        prev.includes(assigneeId)
          ? prev.filter((id) => id !== assigneeId) // Remove if already selected
          : [...prev, assigneeId], // Add if not selected
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAssignees([]);
    setSelectedPriority("");
  };

  // Check if any filters are applied
  const isFiltersApplied =
    searchTerm !== "" ||
    selectedAssignees.length > 0 ||
    selectedPriority !== "";

  return (
    <div className="space-y-4">
      <div className="flex flex-col pr-2 sm:flex-row gap-4 sm:gap-6 mt-6">
        {/* Search Input */}
        <Input
          className="w-full sm:w-72"
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Assignee Avatars */}
        <div className="flex-shrink-0">
          <div className="flex gap-2 flex-wrap">
            {assignees.map((assignee, i) => {
              const selected = selectedAssignees.includes(assignee.id);

              return (
                <div
                  key={assignee.id}
                  className={`rounded-full ring ${
                    selected ? "ring-blue-600" : "ring-black"
                  } ${i > 0 ? "-ml-6" : ""}`}
                  style={{ zIndex: i }}
                  onClick={() => toggleAssignee(assignee.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={assignee.imageUrl} />
                    <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Select Dropdown */}
        <Select
          value={selectedPriority}
          onValueChange={(value: string) => {
            // Safely narrow the value to the allowed priorities or an empty string
            if (value === "" || priorities.includes(value as Priority)) {
              setSelectedPriority(value as Priority | "");
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {isFiltersApplied && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center"
          >
            <X className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
