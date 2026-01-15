import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";
import { v2 as cloudinary } from "cloudinary";

// --- Helper function to check permission ---
const checkPermission = (
  project,
  userId,
  allowedRoles = ["OWNER", "LEADER"]
) => {
  const member = project.members.find(
    (m) => m.userId.toString() === userId.toString()
  );
  if (!member) return false;
  return allowedRoles.includes(member.role);
};

// --- Helper to check file permission (Owner, Leader or Assignee) ---
const checkFilePermission = (project, task, userId) => {
  const member = project.members.find(
    (m) => m.userId.toString() === userId.toString()
  );

  // 1. If not a member -> deny immediately
  if (!member) return false;

  // 2. If OWNER or LEADER -> allowed
  if (["OWNER", "LEADER"].includes(member.role)) return true;

  // 3. If this user is the assignee -> allowed
  if (task.assigneeId && task.assigneeId.toString() === userId.toString()) {
    return true;
  }

  return false;
};
// @desc    Create Task (OWNER, LEADER only) - includes time
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, projectId, dueAt, assigneeId } =
      req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // UPDATE: Only OWNER or LEADER can create
    const canCreate = checkPermission(project, req.user._id);
    if (!canCreate) {
      return res
        .status(403)
        .json({ message: "Only Owner/Leader can create tasks" });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      projectId,
      dueAt,
      assigneeId: assigneeId || null,
      status: "TODO",
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task detail (Any member can view)
// @route   GET /api/tasks/detail/:id
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assigneeId", "name email avatarUrl")
      .populate("projectId", "name");

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Need to check if user belongs to the project of this task
    const project = await Project.findById(task.projectId);
    const isMember = project.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: "Not authorized" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Task
// @route   PUT /api/tasks/detail/:id
export const updateTask = async (req, res) => {
  try {
    const { title, description, priority, dueAt, assigneeId, status } =
      req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.projectId);

    // 1. Check quyền Manager (Owner/Leader)
    const isManager = checkPermission(project, req.user._id);

    // 2. Check xem người dùng hiện tại có phải là người được giao việc không
    const isAssignee = task.assigneeId?.toString() === req.user._id.toString();

    // 3. Nếu không phải Manager VÀ không phải Assignee -> Chặn
    if (!isManager && !isAssignee) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    if (isManager) {
      task.title = title || task.title;
      task.description = description || task.description;
      task.priority = priority || task.priority;
      task.dueAt = dueAt || task.dueAt;
      task.assigneeId = assigneeId || task.assigneeId;
      task.status = status || task.status;
    } else if (isAssignee) {
      task.status = status || task.status;
    }

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Delete Task (OWNER, LEADER only)
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.projectId);

    // Check permission
    const canDelete = checkPermission(project, req.user._id);
    if (!canDelete) {
      return res
        .status(403)
        .json({ message: "Only Owner/Leader can delete tasks" });
    }

    // 1. Delete all attachments from Cloudinary
    if (task.attachments && task.attachments.length > 0) {
      for (const attachment of task.attachments) {
        const publicId = `task-tracker-uploads/${attachment.fileName}`;
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error(
            `Failed to delete file ${attachment.fileName}:`,
            cloudinaryError
          );
          // Continue deleting other files
        }
      }
    }

    // 2. Delete task from MongoDB
    await task.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks by Project ID
// @route   GET /api/tasks/:projectId
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // 1. Find current member info
    const currentMember = project.members.find(
      (m) => m.userId.toString() === req.user._id.toString()
    );
    if (!currentMember)
      return res.status(403).json({ message: "Not authorized" });

    // 2. Build query to find tasks
    let query = { projectId };

    // 3. View visibility logic
    // If MEMBER (not Owner/Leader) AND project disallows view all
    const isRestrictedMember =
      currentMember.role === "MEMBER" &&
      project.settings?.allowMemberViewAllTasks === false;

    if (isRestrictedMember) {
      // Only see tasks assigned to themself
      query.assigneeId = req.user._id;
    }

    // 4. Execute query
    const tasks = await Task.find(query)
      .populate("assigneeId", "name avatarUrl email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:projectId
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks assigned to me (personal dashboard)
// @route   GET /api/tasks/assigned/me
export const getMyAssignedTasks = async (req, res) => {
  try {
    // Find tasks where assigneeId is the current user
    const tasks = await Task.find({ assigneeId: req.user._id })
      .populate("projectId", "name")
      .sort({ dueAt: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload attachments (with permission check)
// @route   POST /api/tasks/:id/attachments
export const uploadTaskAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.projectId);

    // --- NEW PERMISSION CHECK ---
    const canUpload = checkFilePermission(project, task, req.user._id);
    if (!canUpload) {
      return res
        .status(403)
        .json({ message: "Only Owner, Leader or Assignee can upload files" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const newAttachments = req.files.map((file) => ({
      fileName: file.originalname,
      fileUrl: file.path,
      // Mongoose will automatically generate _id for each attachment subdocument
    }));

    task.attachments.push(...newAttachments);
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete attachment
// @route   DELETE /api/tasks/:taskId/attachments/:attachmentId
export const deleteTaskAttachment = async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.projectId);

    // --- PERMISSION CHECK ---
    const canDelete = checkFilePermission(project, task, req.user._id);
    if (!canDelete) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete files" });
    }

    // 1. Tìm file cần xóa trong mảng attachments
    const attachmentToRemove = task.attachments.id(attachmentId);

    if (!attachmentToRemove) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    // 2. Xóa trên Cloudinary
    const publicId = `task-tracker-uploads/${attachmentToRemove.fileName}`;

    try {
      // Gọi API xóa của Cloudinary
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.error("Cloudinary delete error:", cloudinaryError);
    }

    // 3. Xóa trong Database (Sử dụng pull để loại bỏ phần tử khỏi mảng)
    task.attachments.pull(attachmentId);
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
