import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

let serviceAccount;

try {
  // 1. Thử lấy file từ đường dẫn mặc định của Render (/etc/secrets/...)
  serviceAccount = require("/etc/secrets/serviceAccountKey.json");
} catch (error) {
  // 2. Nếu không tìm thấy (tức là đang chạy ở Localhost), lấy từ thư mục hiện tại
  try {
    serviceAccount = require("./serviceAccountKey.json");
  } catch (localError) {
    console.error("❌ Could not load serviceAccountKey.json from anywhere.");
    process.exit(1);
  }
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin Initialized");
} catch (error) {
  console.error("❌ Firebase Admin Error:", error);
}

export default admin;
