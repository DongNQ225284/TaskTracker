# QuickStart

Hướng dẫn này giải thích cách thiết lập và chạy dự án TaskTracker cục bộ để phát triển.

## Yêu cầu

- Node.js (khuyến nghị v18+)
- npm
- Git
- Tài khoản MongoDB (cục bộ) hoặc MongoDB Atlas
- Dự án Firebase (dành cho SDK xác thực và quản trị viên)
- (Tùy chọn) Tài khoản Cloudinary để tải tệp lên

## 1. Sao chép kho lưu trữ

```bash
clone git <repo-url>
cd TaskTracker
```

## 2. Cài đặt phụ thuộc

Cài đặt cả phụ thuộc `server` và `client`:

```bash
cd server
npm i

cd ../client
npm i
cd ..
```

## 3. Biến môi trường

Có hai tệp `.env` mà bạn có thể cần thiết lập:

- `server/.env` — thông tin bí mật phía máy chủ (URI MongoDB, mã hóa bí mật JWT, thông tin tài khoản dịch vụ Firebase, khóa Cloudinary, SMTP)

- `client/.env` — cấu hình web Firebase hướng tới người dùng giao diện (khóa API, authDomain, projectId, storageBucket, MessenderId, appId)

Ví dụ về `server/.env`:

```
PORT=5000
MONGO_URI=<your-mongo-uri>
JWT_SECRET=khoa_bi_mat
CLIENT_URL=http://localhost:5173

# Cloudinary (tùy chọn)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=you@example.com
SMTP_PASSWORD=<mật khẩu ứng dụng>
```

[Làm sao để lấy các giá trị trên?](https://chatgpt.com/)

Ví dụ về `client/.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

```

[Làm sao để lấy các giá trị trên?](https://chatgpt.com/)

## 4. Bảo mật

- Không bao giờ cam kết `.env` hoặc JSON tài khoản dịch vụ vào Git.
- Thêm các mục này vào `.gitignore`:

```
.env
server/src/config/serviceAccountKey.json
```

- Nếu bất kỳ thông tin bí mật nào được đẩy lên, hãy xoay vòng/thu hồi ngay lập tức (API, khóa Firebase, mật khẩu SMTP).
