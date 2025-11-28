import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Sub-components
import ProjectTasks from "../components/project/ProjectTasks";
import ProjectMembers from "../components/project/ProjectMembers";
import ProjectSettings from "../components/project/ProjectSettings"; // <--- Import

// Icons
import {
  ArrowLeft,
  Users,
  Settings as SettingsIcon,
  LayoutList,
} from "lucide-react";
import { toast } from "sonner";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);

  // --- Hàm tải dữ liệu ---
  const fetchProjectData = async () => {
    try {
      // 1. Lấy thông tin Project
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);

      // 2. Lấy Tasks (Riêng biệt để reload khi cần)
      await fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error("Failed to load project details");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setTaskLoading(true);
    try {
      const tasksRes = await api.get(`/tasks/${id}`);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error("Failed to fetch tasks");
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (!project) return null;

  // Check quyền Owner để hiện Tab Setting
  const isOwner =
    project.ownerId?._id === user._id || project.ownerId === user._id;

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {project.name}
                <Badge variant="secondary" className="text-xs font-normal">
                  {isOwner ? "Owner" : "Member"}
                </Badge>
              </h1>
              <p className="text-gray-500 mt-1 max-w-2xl">
                {project.description || "No description provided."}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  {project.members.length} members
                </div>
                <div>
                  Updated: {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABS NAVIGATION --- */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="tasks" className="gap-2">
            <LayoutList size={16} /> Tasks
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users size={16} /> Members
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon size={16} /> Settings
            </TabsTrigger>
          )}
        </TabsList>

        {/* 1. TASK TAB CONTENT */}
        <TabsContent value="tasks" className="mt-6">
          <ProjectTasks
            project={project}
            tasks={tasks}
            loading={taskLoading}
            onTaskUpdate={fetchTasks}
          />
        </TabsContent>

        {/* 2. MEMBER TAB CONTENT (Placeholder) */}
        <TabsContent value="members" className="mt-6">
          <ProjectMembers
            project={project}
            onUpdate={fetchProjectData} // Truyền hàm reload để cập nhật UI khi xóa member
          />
        </TabsContent>

        {/* 3. SETTINGS TAB CONTENT (Placeholder) */}
        {isOwner && (
          <TabsContent value="settings" className="mt-6">
            <ProjectSettings
              project={project}
              onUpdate={fetchProjectData} // Truyền hàm reload để cập nhật thông tin mới sửa
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
