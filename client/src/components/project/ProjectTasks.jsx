import { useState } from "react";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { UploadAttachmentDialog } from "../UploadAttachmentDialog";
// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom Components
import { CreateTaskDialog } from "../CreateTaskDialog";
import { EditTaskDialog } from "../EditTaskDialog";
import { TaskDetailDialog } from "../TaskDetailDialog";

// Icons
import { Search, Info, Trash2, Pencil, Paperclip } from "lucide-react";
import { toast } from "sonner";

export default function ProjectTasks({
  project,
  tasks,
  loading,
  onTaskUpdate,
}) {
  const { user } = useAuth();

  // --- States bộ lọc ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  // --- States Modal ---
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  // --- Kiểm tra quyền hạn ---
  const currentMember = project?.members.find(
    (m) => m.userId._id === user._id || m.userId === user._id
  );
  const userRole = currentMember?.role || "MEMBER";
  const isManager = ["OWNER", "LEADER"].includes(userRole);

  // --- Logic Lọc Task ---
  const filteredTasks = tasks.filter((task) => {
    // 1. Tìm theo tên
    const matchSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // 2. Lọc theo trạng thái
    const matchStatus = statusFilter === "ALL" || task.status === statusFilter;

    // 3. Lọc theo độ ưu tiên
    const matchPriority =
      priorityFilter === "ALL" || task.priority === priorityFilter;

    // 4. Lọc theo ngày tạo (Created Date)
    let matchDate = true;
    const createdDate = new Date(task.createdAt);
    if (dateStart) {
      const start = new Date(dateStart);
      matchDate = matchDate && createdDate >= start;
    }
    if (dateEnd) {
      const end = new Date(dateEnd);
      end.setHours(23, 59, 59);
      matchDate = matchDate && createdDate <= end;
    }

    return matchSearch && matchStatus && matchPriority && matchDate;
  });

  // --- Hàm xử lý xóa Task ---
  const handleDeleteTask = async (task) => {
    if (
      !window.confirm(`Are you sure you want to delete task "${task.title}"?`)
    )
      return;

    try {
      await api.delete(`/tasks/detail/${task._id}`);
      toast.success("Task deleted successfully");
      onTaskUpdate();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  if (loading) return <div className="text-center py-10">Loading tasks...</div>;

  return (
    <div className="space-y-4">
      {/* --- TOOLBAR --- */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-lg border shadow-sm">
        {/* Hàng 1: Search & Status & Priority */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="flex flex-1 gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search tasks..."
                className="pl-8 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px] h-10">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priority</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nút tạo task (Chỉ Manager) */}
          {isManager && (
            <CreateTaskDialog
              projectId={project._id}
              members={project.members}
              onTaskCreated={onTaskUpdate}
            />
          )}
        </div>

        {/* Hàng 2: Date Filter */}
        <div className="flex items-center gap-2 pt-2 border-t mt-1">
          <span className="text-sm text-gray-500 font-medium">
            Created Date:
          </span>
          <Input
            type="date"
            className="w-auto h-9 text-sm"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <Input
            type="date"
            className="w-auto h-9 text-sm"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
          />
          {(dateStart || dateEnd) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-gray-500 hover:text-gray-900"
              onClick={() => {
                setDateStart("");
                setDateEnd("");
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* --- TASK TABLE --- */}
      <div className="border rounded-md bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-[35%]">Task Name</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-32 text-gray-500"
                >
                  No tasks found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => {
                const isAssignee =
                  task.assigneeId?._id === user._id ||
                  task.assigneeId === user._id;
                const canUpload = isManager || isAssignee;
                return (
                  <TableRow
                    key={task._id}
                    className="group hover:bg-gray-50 transition-colors"
                  >
                    {/* 1. Tên Task & Info */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-medium text-gray-900 line-clamp-1"
                          title={task.title}
                        >
                          {task.title}
                        </span>

                        {/* Icon kẹp giấy nếu có file */}
                        {task.attachments?.length > 0 && (
                          <Paperclip
                            size={14}
                            className="text-gray-400 flex-shrink-0"
                          />
                        )}

                        {/* Nút Info  */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-blue-600 flex-shrink-0"
                          onClick={() => setViewingTask(task)} // Mở modal xem chi tiết
                        >
                          <Info size={14} />
                        </Button>
                      </div>
                    </TableCell>

                    {/* 2. Assignee */}
                    <TableCell>
                      {task.assigneeId ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-gray-200">
                            <AvatarImage src={task.assigneeId.avatarUrl} />
                            <AvatarFallback className="text-[10px]">
                              {task.assigneeId.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className="text-sm text-gray-600 truncate max-w-[100px]"
                            title={task.assigneeId.name}
                          >
                            {task.assigneeId.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          Unassigned
                        </span>
                      )}
                    </TableCell>

                    {/* 3. Due Date */}
                    <TableCell>
                      {task.dueAt ? (
                        <span
                          className={`text-sm ${
                            new Date(task.dueAt) < new Date() &&
                            task.status !== "DONE"
                              ? "text-red-600 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {format(new Date(task.dueAt), "MMM dd, HH:mm")}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    {/* 4. Priority */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`
                        font-normal
                        ${
                          task.priority === "HIGH"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : task.priority === "MEDIUM"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }
                     `}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>

                    {/* 5. Status */}
                    <TableCell>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border
                        ${
                          task.status === "DONE"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : task.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : task.status === "REVIEW"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }
                     `}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </TableCell>

                    {/* 6. Actions (Chỉ Manager) */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Nút Upload (Cho Manager hoặc Assignee) */}
                        {canUpload && (
                          <UploadAttachmentDialog
                            taskId={task._id}
                            onUploadSuccess={onTaskUpdate}
                          />
                        )}

                        {/* Nút Sửa */}
                        {(isManager || isAssignee) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            onClick={() => setEditingTask(task)}
                          >
                            <Pencil size={14} />
                          </Button>
                        )}

                        {/*  Nút Xóa  */}
                        {isManager && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteTask(task)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Modal Xem Chi Tiết */}
      {viewingTask && (
        <TaskDetailDialog
          open={!!viewingTask}
          onOpenChange={(open) => !open && setViewingTask(null)}
          task={viewingTask}
          onTaskUpdated={onTaskUpdate}
        />
      )}

      {/* 2. Modal Sửa Task */}
      {editingTask && (
        <EditTaskDialog
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          task={editingTask}
          members={project.members}
          onTaskUpdated={onTaskUpdate}
          isManager={isManager} 
        />
      )}
    </div>
  );
}
