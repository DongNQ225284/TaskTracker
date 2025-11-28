# TaskTracker 🧩

**Project Management Tool xây dựng trên MERN Stack**

TaskTracker là một ứng dụng quản lý dự án và công việc toàn diện, giúp đội nhóm làm việc hiệu quả hơn thông qua việc tạo dự án, phân công nhiệm vụ, theo dõi tiến độ và cộng tác thời gian thực.

---

## 📌 Mục lục

1. [Giới thiệu](#-giới-thiệu)
2. [Tính năng nổi bật](#-tính-năng-nổi-bật)
3. [Công nghệ sử dụng](#️-công-nghệ-sử-dụng-tech-stack)
4. [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
   - [Yêu cầu](#yêu-cầu)
   - [Clone dự án](#1-clone-dự-án)
   - [Cấu hình biến môi trường](#2-cấu-hình-biến-môi-trường-env)
   - [Cài đặt & chạy server](#3-cài-đặt-và-chạy-server)
   - [Cài đặt & chạy client](#4-cài-đặt-và-chạy-client)

---

## 📖 Giới thiệu

**TaskTracker** giúp bạn:

- Quản lý nhiều dự án cùng lúc
- Phân công task rõ ràng cho từng thành viên
- Theo dõi trạng thái công việc theo từng giai đoạn
- Cộng tác nhóm hiệu quả với thông báo & email nhắc việc tự động

---

## 🚀 Tính năng nổi bật

### 🗂 Quản lý Dự án

- Tạo, sửa, xóa dự án
- Thiết lập quyền hạn cho từng dự án
- Quản lý thành viên trong từng dự án

### ✅ Quản lý Công việc (Tasks)

- Tạo task với đầy đủ thông tin:
  - Tiêu đề
  - Mô tả
  - Hạn chót (**Deadline**)
  - Độ ưu tiên (**Priority**)
- Gán task cho thành viên cụ thể
- Cập nhật trạng thái theo luồng:
  - `To Do → In Progress → Review → Done`

### 🤝 Cộng tác Nhóm

- Mời thành viên vào dự án qua **Email**
- Phân quyền chi tiết:
  - **Owner** (Chủ sở hữu)
  - **Leader** (Trưởng nhóm)
  - **Member** (Thành viên)
- Upload & quản lý tài liệu:
  - Đính kèm file (ảnh, tài liệu) vào từng task
  - Lưu trữ trên **Cloudinary**

### 🔔 Thông báo & Nhắc nhở

- Hệ thống tự động gửi email **Daily Digest** mỗi sáng
- Nhắc các task sắp đến hạn, ưu tiên cao

### 🔐 Bảo mật

- Đăng nhập bằng **Google** (Firebase Auth)
- Xác thực 2 lớp (Client & Server) với **JWT**

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### 🎨 Front-end

- **React 19** & **Vite**: Hiệu năng cao, trải nghiệm mượt mà
- **Tailwind CSS** & **Shadcn UI**: Giao diện hiện đại, tối giản và đẹp mắt
- **Axios**: Xử lý HTTP request
- **React Router DOM v7**: Điều hướng trang

### 🧩 Back-end

- **Node.js** & **Express.js**: Xây dựng RESTful API
- **MongoDB** & **Mongoose**: Cơ sở dữ liệu NoSQL linh hoạt
- **Firebase Admin SDK**: Xác thực Google Token
- **Cloudinary**: Lưu trữ file đính kèm
- **Nodemailer**: Dịch vụ gửi email
- **Node-cron**: Lập lịch tác vụ tự động (Daily Digest, nhắc nhở, ...)

---

## ⚙️ Cài đặt và Chạy dự án

### Yêu cầu

- **Node.js** (v14 trở lên)
- **MongoDB** (MongoDB Atlas hoặc cài local)
- Tài khoản:
  - **Cloudinary**
  - **Firebase**
  - **Gmail** (App Password để gửi email)

---

### 1. Clone dự án

```bash
git clone https://github.com/username/TaskTracker.git
cd TaskTracker
```

### 2. Cấu hình biến môi trường (.env)

#### 📁 Server (`/server/.env`)

```text
PORT=5000
MONGO_URI=mongodb+srv://... # Link MongoDB của bạn
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

#### Cloudinary

```text
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

#### Email (Gmail SMTP)

```text
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### 📁 Client (`/client/.env`)

```text
VITE_API_URL=http://localhost:5000/api

#### Firebase Config (Lấy từ Firebase Console)

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
... các thông số khác
```

### 3. Cài đặt và Chạy Server

```bash
cd server
npm install
npm run dev
```

#### Server chạy tại: http://localhost:5000

### 4. Cài đặt và Chạy Client

```bash
cd client
npm install
npm run dev
```

#### Client chạy tại: http://localhost:517
