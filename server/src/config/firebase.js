import admin from "firebase-admin";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

let serviceAccount;

// Try multiple credential sources (order matters):
// 1) /etc/secrets/serviceAccountKey.json (platform secret mount)
// 2) FIREBASE_SERVICE_ACCOUNT env var (JSON string)
// 3) GOOGLE_APPLICATION_CREDENTIALS env var (path to JSON file)
// 4) local ./serviceAccountKey.json

try {
  serviceAccount = require("/etc/secrets/serviceAccountKey.json");
} catch (err1) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const content = fs.readFileSync(path, "utf8");
      serviceAccount = content;
    } catch (pathErr) {
      console.error(
        "❌ Could not read JSON from GOOGLE_APPLICATION_CREDENTIALS path:",
        pathErr
      );
      process.exit(1);
    }
  } else {
    try {
      serviceAccount = require("./serviceAccountKey.json");
    } catch (localError) {
      console.error("❌ Could not load serviceAccountKey.json from anywhere.");
      console.error(
        "   - Place the JSON at server/src/config/serviceAccountKey.json, or set FIREBASE_SERVICE_ACCOUNT env var, or set GOOGLE_APPLICATION_CREDENTIALS to the JSON path."
      );
      process.exit(1);
    }
  }
}

try {
  // If serviceAccount is a string (env or file content), parse it
  if (typeof serviceAccount === "string") {
    try {
      serviceAccount = JSON.parse(serviceAccount);
    } catch (e) {
      // parsing failed — will throw below with clearer message
    }
  }

  if (!serviceAccount || typeof serviceAccount !== "object") {
    throw new Error(
      "Service account must be an object. Check FIREBASE_SERVICE_ACCOUNT / file content"
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin Initialized");
} catch (error) {
  console.error("❌ Firebase Admin Error:", error);
}

export default admin;
