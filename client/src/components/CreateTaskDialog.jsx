import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from "lucide-react";
import api from "../services/api.js"; // Thêm .js để đảm bảo resolve đúng
import { toast } from "sonner";

export function CreateTaskDialog({ projectId, members, onTaskCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // State form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assigneeId: "",
    dueAt: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/tasks", {
        ...formData,
        projectId,
        assigneeId: formData.assigneeId || null,
      });

      toast.success("Task created successfully!");
      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "MEDIUM",
        assigneeId: "",
        dueAt: "",
      });
      setOpen(false);

      if (onTaskCreated) onTaskCreated();
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus size={18} /> New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
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
              placeholder="e.g. Design Homepage UI"
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
              placeholder="Add details about this task..."
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
                type="datetime-local"
                value={formData.dueAt}
                onChange={(e) =>
                  setFormData({ ...formData, dueAt: e.target.value })
                }
              />
            </div>
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

          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
