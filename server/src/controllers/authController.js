import admin from "../config/firebase.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// @desc    Login/Register with Google
// @route   POST /api/auth/google
// @access  Public
export const loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // 1. Xác thực Token với Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 2. Lấy thông tin user từ token đã giải mã
    const { email, name, picture, uid } = decodedToken;

    // 3. Tìm user trong DB hoặc tạo mới (Upsert logic)
    let user = await User.findOne({ email });

    if (user) {
      user.avatarUrl = picture;
      await user.save();
    } else {
      user = await User.create({
        email,
        name,
        googleId: uid,
        avatarUrl: picture,
      });
    }

    const appToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token: appToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};
