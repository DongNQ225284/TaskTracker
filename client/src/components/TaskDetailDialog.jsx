import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Paperclip, Calendar, User, AlignLeft } from "lucide-react";

export function TaskDetailDialog({ task, open, onOpenChange }) {
  if (!task) return null;

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

            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                <Paperclip size={16} /> Attachments (
                {task.attachments?.length || 0})
              </h4>
              {task.attachments?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {task.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:underline truncate max-w-[200px]"
                    >
                      {file.fileName}
                    </a>
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
