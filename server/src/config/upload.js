import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "task-tracker-uploads",
    resource_type: "auto",
    public_id: (req, file) => file.originalname,
  },
});

// 3. Initialize Multer with manual file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") || // image
      file.mimetype === "application/pdf" || // PDF
      file.mimetype === "application/msword" || // DOC
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // DOCX
    ) {
      cb(null, true);
    } else {
      cb(new Error("File format is not supported!"), false);
    }
  },
});

export default upload;
