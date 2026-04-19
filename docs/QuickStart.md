# QuickStart

Tài liệu này hướng dẫn cách thiết lập và chạy dự án TaskTracker trên máy cục bộ để phát triển.

## Yêu cầu

- Node.js 20+
- npm
- Git
- MongoDB local hoặc MongoDB Atlas
- Firebase project
- Tài khoản Gmail để gửi mail qua App Password nếu muốn dùng tính năng email
- (Tùy chọn) Cloudinary để tải file đính kèm

## 1. Clone repository

```bash
git clone https://github.com/DongNQ225284/TaskTracker
cd TaskTracker
```

## 2. Cài đặt dependencies

Cài dependencies cho cả `server` và `client`:

```bash
cd server
npm install

cd ../client
npm install

cd ..
```

## 3. Cấu hình biến môi trường

Dự án dùng 2 file môi trường:

- `server/.env`: cấu hình backend
- `client/.env`: cấu hình frontend

### `server/.env`

Tạo file `server/.env` với nội dung mẫu:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tasktracker
JWT_SECRET=replace_with_a_strong_secret
CLIENT_URL=http://localhost:5173

# Cloudinary (tùy chọn, nhưng cần nếu muốn upload file)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Gmail SMTP (cần nếu muốn gửi thư mời / mail nhắc hạn)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=you@example.com
SMTP_PASSWORD=your_app_password
```

Giải thích nhanh:

- `PORT`: cổng backend, mặc định là `5000`
- `MONGO_URI`: chuỗi kết nối MongoDB
- `JWT_SECRET`: secret dùng để ký JWT
- `CLIENT_URL`: URL frontend để cấu hình CORS và tạo link mời
- `CLOUDINARY_*`: chỉ cần khi dùng upload file
- `SMTP_*`: chỉ cần khi dùng email

### Firebase Admin cho server

Backend cần Firebase Admin credentials để xác thực token đăng nhập Google. Ứng dụng hiện hỗ trợ một trong các cách sau:

1. Đặt file JSON tại `server/src/config/serviceAccountKey.json`
2. Khai báo biến môi trường `FIREBASE_SERVICE_ACCOUNT` chứa toàn bộ JSON dưới dạng string
3. Khai báo biến môi trường `GOOGLE_APPLICATION_CREDENTIALS` trỏ tới đường dẫn file JSON
4. Trên một số môi trường deploy, dùng `/etc/secrets/serviceAccountKey.json`

Khi chạy local, cách đơn giản nhất là tải service account key từ Firebase Console và đặt tại:

```text
server/src/config/serviceAccountKey.json
```

Tài liệu tham khảo:

- Firebase service accounts: https://firebase.google.com/docs/admin/setup

### `client/.env`

Tạo file `client/.env` với nội dung mẫu:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Các biến này là Firebase Web App config dùng ở frontend.

Tài liệu tham khảo:

- Firebase Web setup: https://firebase.google.com/docs/web/setup
- MongoDB connection string: https://www.mongodb.com/docs/manual/reference/connection-string/
- Cloudinary credentials: https://cloudinary.com/documentation/finding_your_credentials_tutorial
- Gmail App Password: https://support.google.com/accounts/answer/185833

## 4. Chạy dự án

Mở 2 terminal riêng.

### Chạy backend

```bash
cd server
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:5000
```

### Chạy frontend

```bash
cd client
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

## 5. Kiểm tra nhanh

- Mở `http://localhost:5173`
- Kiểm tra backend bằng cách truy cập `http://localhost:5000/`
- Nếu backend hoạt động đúng, endpoint gốc sẽ trả về `API is running...`

## 6. Lưu ý bảo mật

- Không commit file `.env`
- Không commit `server/src/config/serviceAccountKey.json`
- Nếu lỡ đẩy secrets lên Git, hãy rotate ngay các khóa liên quan

Các mục nên có trong `.gitignore`:

```gitignore
.env
server/src/config/serviceAccountKey.json
node_modules/
dist/
```
