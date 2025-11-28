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
import { Paperclip, UploadCloud } from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

export function UploadAttachmentDialog({ taskId, onUploadSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files) {
      toast.error("Please select file!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      // --- SỬA ĐOẠN NÀY ---
      // Thêm tham số thứ 3 là config object để ghi đè header
      await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // --------------------

      toast.success("Upload successful!");
      setOpen(false);
      setFiles(null);

      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error(error);
      // Hiển thị lỗi chi tiết từ backend nếu có
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Đổi class h-6 w-6 thành h-8 w-8 và tăng kích thước icon lên 16 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-900"
        >
          <Paperclip size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attach documents</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-5">
            <Label htmlFor="file">Select file (Image, PDF, Doc...)</Label>
            <Input
              id="file"
              type="file"
              multiple // Cho phép chọn nhiều file
              onChange={handleFileChange}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">Uploading...</span>
              ) : (
                <span className="flex items-center gap-2">
                  <UploadCloud size={16} /> Upload
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
