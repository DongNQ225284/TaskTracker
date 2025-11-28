import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import {
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { format, isSameDay, isPast } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProjects: 0,
    tasksDueToday: 0,
    overdueTasks: 0,
    completedTasks: 0,
    totalAssignedTasks: 0,
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy dữ liệu
        const [projectsRes, tasksRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks/assigned/me"),
        ]);

        const projects = projectsRes.data;
        const tasks = tasksRes.data;

        // 2. Tính toán số liệu (Frontend Calculation)
        const now = new Date();

        const dueToday = tasks.filter(
          (t) =>
            t.dueAt && isSameDay(new Date(t.dueAt), now) && t.status !== "DONE"
        ).length;

        const overdue = tasks.filter(
          (t) =>
            t.dueAt &&
            isPast(new Date(t.dueAt)) &&
            !isSameDay(new Date(t.dueAt), now) &&
            t.status !== "DONE"
        ).length;

        const completed = tasks.filter((t) => t.status === "DONE").length;

        setStats({
          totalProjects: projects.length,
          tasksDueToday: dueToday,
          overdueTasks: overdue,
          completedTasks: completed,
          totalAssignedTasks: tasks.length,
        });

        // Lấy 5 dự án mới nhất
        setRecentProjects(projects.slice(0, 5));
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- UI SKELETON (Khi đang tải) ---
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back,{" "}
            <span className="font-semibold text-indigo-600">{user?.name}</span>!
            Here's your overview.
          </p>
        </div>
        <Button onClick={() => navigate("/projects")}>View All Projects</Button>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-gray-500 mt-1">
              Projects you are participating in
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Due Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.tasksDueToday}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tasks expiring within 24 hours
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Overdue */}
        <Card
          className={stats.overdueTasks > 0 ? "border-red-200 bg-red-50" : ""}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Overdue Tasks
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdueTasks}
            </div>
            <p className="text-xs text-red-600/80 mt-1">
              Tasks requiring immediate attention
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completedTasks}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Out of {stats.totalAssignedTasks} assigned tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Projects Section */}
      <div className="grid gap-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No projects found. Create one to get started!
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/project/${project._id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {project.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Updated{" "}
                          {format(new Date(project.updatedAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
