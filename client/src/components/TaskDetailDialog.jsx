import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  Paperclip,
  Calendar,
  User,
  AlignLeft,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../services/api";
import { Button } from "@/components/ui/button";

// --- SỬA Ở ĐÂY: Thêm onTaskUpdated ---
export function TaskDetailDialog({ task, open, onOpenChange, onTaskUpdated }) {
  if (!task) return null;

  const [deletingId, setDeletingId] = useState(null);

  // State quản lý danh sách file nội bộ để cập nhật UI ngay lập tức
  const [localAttachments, setLocalAttachments] = useState(
    task.attachments || []
  );

  // Đồng bộ lại khi mở task khác
  useEffect(() => {
    setLocalAttachments(task.attachments || []);
  }, [task]);

  const handleDeleteFile = async (attachmentId, fileName) => {
    if (!window.confirm(`Delete file "${fileName}"?`)) return;

    setDeletingId(attachmentId);
    try {
      await api.delete(`/tasks/${task._id}/attachments/${attachmentId}`);
      toast.success("File deleted successfully");

      // 1. Cập nhật UI ngay lập tức
      setLocalAttachments((prev) =>
        prev.filter((file) => file._id !== attachmentId)
      );

      // 2. Gọi refresh
      if (onTaskUpdated && typeof onTaskUpdated === "function") {
        onTaskUpdated(true);
      }
    } catch (error) {
      toast.error("Failed to delete file");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3 pr-8">
            <Badge variant={task.status === "DONE" ? "success" : "secondary"}>
              {task.status.replace("_", " ")}
            </Badge>
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6 py-4">
          {/* Cột trái: Thông tin chính */}
          <div className="col-span-2 space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                <AlignLeft size={16} /> Description
              </h4>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md min-h-[80px]">
                {task.description || "No description provided."}
              </div>
            </div>

            {/* --- PHẦN HIỂN THỊ FILE --- */}
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                <Paperclip size={16} /> Attachments ({localAttachments.length})
              </h4>

              {localAttachments.length > 0 ? (
                <div className="space-y-2">
                  {localAttachments.map((file) => (
                    <div
                      key={file._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 group"
                    >
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate max-w-[300px]"
                      >
                        {file.fileName}
                      </a>

                      {/* Nút Xóa */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          handleDeleteFile(file._id, file.fileName)
                        }
                        disabled={deletingId === file._id}
                      >
                        {deletingId === file._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No attachments</p>
              )}
            </div>
          </div>

          {/* Cột phải: Meta data */}
          <div className="space-y-4 border-l pl-6">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase">
                Priority
              </span>
              <div className="mt-1">
                <Badge variant="outline">{task.priority}</Badge>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase">
                Assignee
              </span>
              <div className="mt-1 flex items-center gap-2">
                {task.assigneeId ? (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assigneeId.avatarUrl} />
                      <AvatarFallback>
                        {task.assigneeId.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.assigneeId.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase">
                Due Date
              </span>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                <Calendar size={14} />
                {task.dueAt ? format(new Date(task.dueAt), "PPP p") : "-"}
              </div>
            </div>

            <div className="pt-4 border-t mt-4">
              <p className="text-xs text-gray-400">
                Created: {format(new Date(task.createdAt), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
