import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "../services/api.js";
import { toast } from "sonner";

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  members,
  onTaskUpdated,
}) {
  const [loading, setLoading] = useState(false);

  // State form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    assigneeId: "",
    dueAt: "",
  });

  useEffect(() => {
    if (task) {
      let formattedDate = "";
      if (task.dueAt) {
        const dateObj = new Date(task.dueAt);
        const offset = dateObj.getTimezoneOffset() * 60000;
        const localDate = new Date(dateObj.getTime() - offset);
        formattedDate = localDate.toISOString().slice(0, 16);
      }

      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "MEDIUM",
        status: task.status || "TODO",
        assigneeId: task.assigneeId?._id || task.assigneeId || "unassigned",
        dueAt: formattedDate,
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/tasks/detail/${task._id}`, {
        ...formData,
        assigneeId:
          !formData.assigneeId || formData.assigneeId === "unassigned"
            ? null
            : formData.assigneeId,
      });

      toast.success("Task updated successfully!");
      onOpenChange(false);

      if (onTaskUpdated) onTaskUpdated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(val) =>
                  setFormData({ ...formData, priority: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date (Datetime Local) */}
            <div className="grid gap-2">
              <Label htmlFor="dueAt">Due Date</Label>
              <Input
                id="dueAt"
                type="datetime-local" // Cho phép chọn giờ phút
                value={formData.dueAt}
                onChange={(e) =>
                  setFormData({ ...formData, dueAt: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="grid gap-2">
              <Label>Assignee</Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(val) =>
                  setFormData({ ...formData, assigneeId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((mem) => (
                    <SelectItem
                      key={mem.userId._id || mem.userId}
                      value={mem.userId._id || mem.userId}
                    >
                      {mem.userId.name || mem.userId.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
