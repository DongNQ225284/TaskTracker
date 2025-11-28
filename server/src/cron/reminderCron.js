import cron from "node-cron";
import Task from "../models/taskModel.js";
import sendEmail from "../utils/sendEmail.js";

const startReminderCron = () => {
  // 1. Schedule: Run at 07:00 every morning
  // Cron structure: Minute(0) Hour(7) Day(*) Month(*) Weekday(*)
  cron.schedule("0 7 * * *", async () => {
    console.log("🌅 DAILY CRON JOB: Start sending daily work reports...");

    try {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const tasks = await Task.find({
        status: { $ne: "DONE" },
        assigneeId: { $ne: null },
        dueAt: { $lte: next24Hours },
      })
        .populate("assigneeId", "email name")
        .populate("projectId", "settings name");

      if (tasks.length === 0) return;

      const tasksByUser = {};

      tasks.forEach((task) => {
        if (
          task.projectId &&
          task.projectId.settings?.enableEmailReminders === false
        ) {
          return;
        }

        const user = task.assigneeId;
        if (!user || !user.email) return;

        const userId = user._id.toString();
        if (!tasksByUser[userId]) {
          tasksByUser[userId] = { userInfo: user, taskList: [] };
        }
        tasksByUser[userId].taskList.push(task);
      });

      // 4. Loop through each user and send one digest email
      for (const userId in tasksByUser) {
        const { userInfo, taskList } = tasksByUser[userId];

        // Build HTML table
        const tableRows = taskList
          .map((task, index) => {
            const dueDate = new Date(task.dueAt);
            const isOverdue = dueDate < now;

            // Handle status text
            const statusText = isOverdue ? "🔴 Overdue" : "🟡 Due soon";
            const statusStyle = isOverdue
              ? "color: red; font-weight: bold;"
              : "color: #d97706;";

            // Shorten description (30 characters)
            let shortDesc = task.description || "";
            if (shortDesc.length > 30)
              shortDesc = shortDesc.substring(0, 30) + "...";

            return `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; text-align: center;">${index + 1}</td>
              <td style="padding: 10px;">
                <b>${task.title}</b><br/>
                <span style="font-size: 12px; color: #666;">${shortDesc}</span>
              </td>
              <td style="padding: 10px;">${dueDate.toLocaleString("vi-VN")}</td>
              <td style="padding: 10px; text-align: center;">${
                task.priority
              }</td>
              <td style="padding: 10px; ${statusStyle}">${statusText}</td>
            </tr>
          `;
          })
          .join("");

        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #2563eb; padding: 20px; text-align: center; color: white;">
              <h2 style="margin: 0;">📅 Daily task report for ${now.toLocaleDateString(
                "vi-VN"
              )}</h2>
            </div>
            
            <div style="padding: 20px;">
              <p>Hello <b>${userInfo.name}</b>,</p>
              <p>You have <b>${taskList.length} tasks</b> to focus on today:</p>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background-color: #f8f9fa; text-align: left;">
                    <th style="padding: 10px; text-align: center;">#</th>
                    <th style="padding: 10px;">Task</th>
                    <th style="padding: 10px;">Deadline</th>
                    <th style="padding: 10px; text-align: center;">Priority</th>
                    <th style="padding: 10px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>

              <div style="margin-top: 30px; text-align: center;">
                <a href="${
                  process.env.CLIENT_URL
                }/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Open Dashboard
                </a>
              </div>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              This email was sent automatically from the Task Tracker system.
            </div>
          </div>
        `;

        // Send email
        try {
          await sendEmail({
            email: userInfo.email,
            subject: `[Task Tracker] 📅 You have ${taskList.length} tasks to handle today`,
            message: emailContent,
          });
          console.log(`📨 Sent digest email to: ${userInfo.email}`);
        } catch (err) {
          console.error(
            `❌ Error sending email to ${userInfo.email}:`,
            err.message
          );
        }
      }
    } catch (error) {
      console.error("❌ Cron Job Error:", error);
    }
  });
};

export default startReminderCron;
