import Invitation from "../models/invitationModel.js";
import Project from "../models/projectModel.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/userModel.js";

// @desc    Send invitation to email
// @route   POST /api/invitations
// @access  Private (Owner/Leader only)
export const sendInvitation = async (req, res) => {
  try {
    const { projectId, email, role } = req.body;

    // 1. Check Project & Quyền hạn
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Chỉ Owner hoặc Leader mới được mời
    const currentUserMember = project.members.find(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (!currentUserMember || currentUserMember.role === "MEMBER") {
      return res.status(403).json({ message: "Not authorized to invite" });
    }

    // 2. Check xem người này đã trong dự án chưa?
    // Bước 2a: Tìm user trong hệ thống dựa trên email
    const userToInvite = await User.findOne({ email });

    // Bước 2b: Nếu User này đã có tài khoản, check xem họ có trong project chưa
    if (userToInvite) {
      const isAlreadyMember = project.members.some(
        (member) => member.userId.toString() === userToInvite._id.toString()
      );

      if (isAlreadyMember) {
        return res
          .status(400)
          .json({ message: "This member is already in the project" });
      }
    }
    // 3. Tạo Token ngẫu nhiên
    const invitationToken = crypto.randomBytes(20).toString("hex");

    // 4. Lưu vào DB Invitation
    const invitation = await Invitation.create({
      projectId,
      inviterId: req.user._id,
      email,
      role: role || "MEMBER",
      token: invitationToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Hết hạn sau 24h
    });

    // 5. Tạo Link mời (Frontend URL)
    const inviteUrl = `${process.env.CLIENT_URL}/accept-invite?token=${invitationToken}`;

    const message = `
      <h1>You are invited to join the project!</h1>
      <p>Hello,</p>
      <p>You have been invited to join a project at Task Tracker.</p>
      <p>Role: <b>${role || "MEMBER"}</b></p>
      <a href="${inviteUrl}" style="background:blue; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
        Accept the invitation
      </a>
    `;
    try {
      await sendEmail({
        email: email,
        subject: "Invite to join the project - Task Tracker",
        message: message,
      });
    } catch (err) {
      console.error(err);
    }
    res.status(201).json({ message: "Invitation sent to email!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept invitation
// @route   POST /api/invitations/accept
// @access  Private (User phải login rồi mới bấm accept được)
export const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;

    // 1. Tìm Invitation theo token
    const invitation = await Invitation.findOne({
      token,
      status: "PENDING",
      expiresAt: { $gt: Date.now() }, // Chưa hết hạn
    });

    if (!invitation) {
      return res
        .status(400)
        .json({ message: "Invalid or expired invitation token" });
    }

    // 2. Tìm Project
    const project = await Project.findById(invitation.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // 3. Check xem user đã trong dự án chưa (tránh add trùng)
    const alreadyMember = project.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res
        .status(400)
        .json({ message: "You are already a member of this project" });
    }

    // 4. Thêm User vào Project
    project.members.push({
      userId: req.user._id,
      role: invitation.role,
      joinedAt: Date.now(),
    });
    await project.save();

    // 5. Update trạng thái Invitation -> ACCEPTED
    invitation.status = "ACCEPTED";
    await invitation.save();

    res
      .status(200)
      .json({ message: "Joined project successfully", projectId: project._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
