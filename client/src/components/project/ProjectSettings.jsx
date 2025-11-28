import { useState, useEffect } from "react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";

// Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

// Icons
import { Save, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ProjectSettings({ project, onUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    allowMemberViewAllTasks: true,
    enableEmailReminders: true,
  });

  // Load dữ liệu ban đầu vào form
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        allowMemberViewAllTasks:
          project.settings?.allowMemberViewAllTasks ?? true,
        enableEmailReminders: project.settings?.enableEmailReminders ?? true,
      });
    }
  }, [project]);

  // --- Xử lý Lưu thay đổi ---
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/projects/${project._id}`, {
        name: formData.name,
        description: formData.description,
        settings: {
          allowMemberViewAllTasks: formData.allowMemberViewAllTasks,
          enableEmailReminders: formData.enableEmailReminders,
        },
      });
      toast.success("Settings updated successfully!");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  // --- (Danger Zone) ---
  const handleDeleteProject = async () => {
    const confirmName = window.prompt(
      `Type "${project.name}" to confirm deletion:`
    );
    if (confirmName !== project.name) {
      return toast.error("Project name does not match.");
    }

    try {
      await api.delete(`/projects/${project._id}`, {
        data: { confirmationName: project.name },
      });
      toast.success("Project deleted. Redirecting...");
      navigate("/projects");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* SECTION 1: General Information */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Update your project name and description.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
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
        </CardContent>
      </Card>

      {/* SECTION 2: Permissions & Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Permissions</CardTitle>
          <CardDescription>
            Configure how members interact with this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Switch 1: Task Visibility */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Member Task Visibility</Label>
              <p className="text-sm text-gray-500">
                Allow members to view all tasks in the project, not just their
                own.
              </p>
            </div>
            <Switch
              checked={formData.allowMemberViewAllTasks}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, allowMemberViewAllTasks: checked })
              }
            />
          </div>

          <hr />

          {/* Switch 2: Email Reminders */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Email Reminders</Label>
              <p className="text-sm text-gray-500">
                Send automatic daily digest emails to members for due tasks.
              </p>
            </div>
            <Switch
              checked={formData.enableEmailReminders}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enableEmailReminders: checked })
              }
            />
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t p-4 flex justify-end">
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            <Save size={16} /> Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* SECTION 3: Danger Zone */}
      <Card className="border-red-200 shadow-none">
        <CardHeader className="bg-red-50/50 rounded-t-xl">
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} /> Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600/80">
            Irreversible actions. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Delete Project</h4>
              <p className="text-sm text-gray-500">
                Once deleted, all tasks and data will be permanently lost.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              className="gap-2"
            >
              <Trash2 size={16} /> Delete Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
