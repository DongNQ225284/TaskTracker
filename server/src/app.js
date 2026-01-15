import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import projectRoutes from "./routes/projectRoute.js";
import taskRoutes from "./routes/taskRoute.js";
import invitationRoutes from "./routes/invitationRoute.js";
import startReminderCron from "./cron/reminderCron.js";

dotenv.config();

connectDB();

startReminderCron();

const app = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/invitations", invitationRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
