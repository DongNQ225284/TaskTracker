import Project from "../models/projectModel.js";
import Task from "../models/taskModel.js";

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      ownerId: req.user._id,
      members: [
        {
          userId: req.user._id,
          role: "OWNER",
          joinedAt: Date.now(),
        },
      ],
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects of current user
// @route   GET /api/projects
// @access  Private
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      "members.userId": req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project details
// @route   GET /api/projects/:id
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("ownerId", "name email avatarUrl")
      .populate("members.userId", "name email avatarUrl");

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check if current user is a member
    const isMember = project.members.some(
      (m) => m.userId._id.toString() === req.user._id.toString()
    );

    if (!isMember) return res.status(403).json({ message: "Not authorized" });

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project details (Owner only)
// @route   PUT /api/projects/:id
export const updateProject = async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Only OWNER can edit
    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only Project Owner can update details" });
    }

    project.name = name || project.name;
    project.description = description || project.description;

    // Update settings if provided
    if (settings) {
      project.settings = {
        ...project.settings, // Keep old values
        ...settings, // Override with new values
      };
    }

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project (Owner only, requires name confirmation)
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const { confirmationName } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    // 1. Check Owner permission
    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only Project Owner can delete this project" });
    }

    // 2. Confirm project name (second confirmation step)
    if (project.name !== confirmationName) {
      return res
        .status(400)
        .json({ message: "Confirmation project name does not match" });
    }

    // 3. Delete all related tasks first
    await Task.deleteMany({ projectId: project._id });

    // 4. Delete project
    await project.deleteOne();

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a member (Owner only)
// @route   DELETE /api/projects/:projectId/members/:userId
export const removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const project = await Project.findById(projectId);

    // Check Owner
    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only Owner can remove members" });
    }

    // Cannot remove the Owner themself
    if (userId === project.ownerId.toString()) {
      return res.status(400).json({ message: "Cannot remove Owner" });
    }

    // Filter member out from the array
    project.members = project.members.filter(
      (member) => member.userId.toString() !== userId
    );

    await project.save();
    res.status(200).json({ message: "Member removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update member role (Owner only)
// @route   PATCH /api/projects/:projectId/members/:userId
export const updateMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body; // LEADER or MEMBER

    if (!["LEADER", "MEMBER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const project = await Project.findById(projectId);

    // Check Owner
    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only Owner can update roles" });
    }

    // Find and update role
    const memberIndex = project.members.findIndex(
      (m) => m.userId.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: "Member not found in project" });
    }

    project.members[memberIndex].role = role;
    await project.save();

    res.status(200).json({ message: "Member role updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave project (member self-leave)
// @route   POST /api/projects/:id/leave
export const leaveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // 1. Owner cannot leave (must delete project or transfer ownership first)
    if (project.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Owner cannot leave the project. Delete it instead.",
      });
    }

    // 2. Check if user is a member
    const isMember = project.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(400)
        .json({ message: "You are not a member of this project" });
    }

    // 3. Filter user out of members array
    project.members = project.members.filter(
      (m) => m.userId.toString() !== req.user._id.toString()
    );

    await project.save();
    res.status(200).json({ message: "Left project successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
