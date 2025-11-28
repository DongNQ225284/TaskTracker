# TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG

**Dự án:** Task Tracker (Quản lý công việc dự án)  
**Phiên bản:** 1.0  
**Ngày cập nhật:** 28/11/2025

---

## CHƯƠNG 1: TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

### 1.1. Mục tiêu

Xây dựng ứng dụng web giúp các nhóm làm việc quản lý tiến độ dự án, phân chia công việc và theo dõi hạn chót (deadline) hiệu quả. Hệ thống tập trung vào:

- Trải nghiệm người dùng tối giản
- Phân quyền rõ ràng
- Khả năng làm việc cộng tác (collaboration)

### 1.2. Phân quyền (Roles)

Hệ thống hoạt động dựa trên 3 vai trò trong một dự án:

1. **OWNER (Chủ dự án)**

   - Người tạo dự án
   - Có toàn quyền: Quản lý thành viên, Xóa dự án, Cài đặt chung

2. **LEADER (Trưởng nhóm)**

   - Được Owner chỉ định
   - Có quyền quản lý Task (Tạo/Sửa/Xóa/Giao việc)
   - Không được can thiệp cấu trúc dự án (cài đặt cấp hệ thống/cấu trúc)

3. **MEMBER (Thành viên)**
   - Người thực hiện công việc
   - Quyền: Xem task (tùy cài đặt), cập nhật trạng thái các task được giao

### 1.3. Công nghệ sử dụng (Tech Stack)

- **Frontend:** ReactJS
- **Backend:** Node.js, ExpressJS
- **Database:** MongoDB (NoSQL)
- **Dịch vụ bên thứ 3:**
  - Google OAuth (Login)
  - Cloudinary (Lưu trữ file)
  - Gmail SMTP (Gửi mail)

---

## CHƯƠNG 2: PHÂN TÍCH CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 2.1. Phân hệ Xác thực (Authentication)

- **Đăng nhập Google:** Người dùng đăng nhập thông qua Google OAuth.
- **Tự động tham gia:**
  - Nếu người dùng nhấp vào link mời tham gia dự án qua email
  - → Yêu cầu đăng nhập Google
  - → Tự động add vào dự án sau khi login thành công (validate token mời).

### 2.2. Phân hệ Dự án (Project)

- **Quản lý dự án:**

  - Tạo dự án
  - Xem danh sách dự án đã tham gia
  - Cập nhật thông tin dự án

- **Cài đặt dự án (Owner only):**

  - Cho phép Member xem:
    - Toàn bộ task trong dự án, hoặc
    - Chỉ task được assign cho chính mình
  - Bật/tắt tính năng nhắc nhở qua email (email reminder automation)

- **Xóa dự án:**
  - Yêu cầu Owner nhập **chính xác tên dự án** để xác nhận xóa (Strict Check)

### 2.3. Phân hệ Công việc (Task)

- **Thông tin Task:**

  - Tên
  - Mô tả
  - Hạn chót (Deadline)
  - Độ ưu tiên: `Low / Medium / High`
  - Trạng thái: `Todo / In Progress / Review / Done`

- **Đính kèm file:**

  - Hỗ trợ: Ảnh, PDF, Docs
  - Lưu trên Cloudinary
  - Giới hạn:
    - Tối đa **5 file / task**
    - Tối đa **5MB / file**

- **Hệ thống nhắc hẹn (Automation):**
  - Cron Job chạy lúc **07:00 AM** mỗi ngày
  - Quét các task có hạn chót trong vòng **24h tới**
  - Gửi email nhắc nhở đến thành viên được assign task

### 2.4. Phân hệ Thành viên (Membership)

- **Mời thành viên:**

  - Owner nhập email
  - Hệ thống gửi email chứa link mời kèm Token (Invitation Token)

- **Quản lý thành viên:**

  - Chỉ Owner:
    - Thăng chức (Member → Leader)
    - Giáng chức (Leader → Member)
    - Mời ra khỏi dự án (Remove khỏi members list)

- **Rời dự án:**
  - Thành viên có thể tự thoát dự án
  - Yêu cầu xác nhận 2 bước (Confirm dialog / nhập lại tên dự án, v.v.)

---

## CHƯƠNG 3: THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

Hệ thống sử dụng **MongoDB (NoSQL)**. Dữ liệu được tổ chức thành **4 Collections** (Bộ sưu tập) chính.  
Chiến lược thiết kế ưu tiên **nhúng dữ liệu (Embedding)** ở bảng `Projects` để tối ưu hóa tốc độ đọc.

### 3.1. Collection: `Users` (Người dùng)

**Mục đích:** Lưu trữ thông tin định danh từ Google.

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc | Mô tả & Ràng buộc                                       |
| ------------------ | ------------------- | -------- | ------------------------------------------------------- |
| `_id`              | ObjectId            | Có       | Khóa chính (Primary Key)                                |
| `googleId`         | String              | Có       | Unique, Index. ID trả về từ Google OAuth. Dùng để login |
| `email`            | String              | Có       | Unique. Email của người dùng                            |
| `name`             | String              | Có       | Tên hiển thị                                            |
| `avatarUrl`        | String              | Không    | Đường dẫn ảnh đại diện (Lấy từ Google)                  |
| `createdAt`        | Date                | Có       | Thời gian tạo tài khoản                                 |

---

### 3.2. Collection: `Projects` (Dự án)

**Mục đích:** Lưu thông tin dự án. Danh sách thành viên được nhúng trực tiếp vào đây.

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc | Mô tả & Ràng buộc                                  |
| ------------------ | ------------------- | -------- | -------------------------------------------------- |
| `_id`              | ObjectId            | Có       | Khóa chính                                         |
| `name`             | String              | Có       | Tên dự án                                          |
| `description`      | String              | Không    | Mô tả ngắn về dự án                                |
| `ownerId`          | ObjectId            | Có       | Reference (`Users`). ID người tạo dự án            |
| `status`           | String              | Có       | Enum: `['ACTIVE', 'ARCHIVED']`. Mặc định: `ACTIVE` |
| `settings`         | Object              | Có       | Cấu hình dự án (xem bảng chi tiết bên dưới)        |
| `members`          | Array of Objects    | Có       | Danh sách thành viên (xem bảng chi tiết bên dưới)  |
| `createdAt`        | Date                | Có       | Thời gian tạo dự án                                |

**Lưu ý:** Đánh **Index** tại `members.userId` để truy vấn danh sách dự án của một user nhanh chóng.

#### Cấu trúc phần tử trong mảng `members`

| Tên trường con | Kiểu dữ liệu | Mô tả                                 |
| -------------- | ------------ | ------------------------------------- |
| `userId`       | ObjectId     | Reference (`Users`). ID thành viên    |
| `role`         | String       | Enum: `['OWNER', 'LEADER', 'MEMBER']` |
| `joinedAt`     | Date         | Ngày tham gia vào dự án               |

#### Cấu trúc object `settings`

| Tên trường con            | Kiểu dữ liệu | Mô tả                                                                   |
| ------------------------- | ------------ | ----------------------------------------------------------------------- |
| `allowMemberViewAllTasks` | Boolean      | `true`: Member xem hết task; `false`: Chỉ xem task được giao            |
| `enableEmailReminders`    | Boolean      | `true`: Bật tính năng gửi mail nhắc nhở tự động; `false`: Tắt tính năng |

---

### 3.3. Collection: `Tasks` (Công việc)

**Mục đích:** Lưu trữ các đầu việc trong dự án.

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc | Mô tả & Ràng buộc                                                   |
| ------------------ | ------------------- | -------- | ------------------------------------------------------------------- |
| `_id`              | ObjectId            | Có       | Khóa chính                                                          |
| `projectId`        | ObjectId            | Có       | Reference (`Projects`). Task thuộc dự án nào? (Index)               |
| `title`            | String              | Có       | Tên công việc                                                       |
| `description`      | String              | Không    | Mô tả chi tiết                                                      |
| `status`           | String              | Có       | Enum: `['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']`. Mặc định: `TODO` |
| `priority`         | String              | Có       | Enum: `['LOW', 'MEDIUM', 'HIGH']`. Mặc định: `MEDIUM`               |
| `assigneeId`       | ObjectId            | Không    | Reference (`Users`). Người được giao việc. (Index)                  |
| `dueAt`            | Date                | Không    | Hạn chót hoàn thành. (Index phục vụ Cron Job nhắc nhở)              |
| `isReminded`       | Boolean             | Không    | `true` nếu hệ thống đã gửi mail nhắc nhở. Mặc định: `false`         |
| `attachments`      | Array of Objects    | Không    | Danh sách file đính kèm                                             |

#### Cấu trúc phần tử trong mảng `attachments`

| Tên trường con | Kiểu dữ liệu | Mô tả                          |
| -------------- | ------------ | ------------------------------ |
| `fileName`     | String       | Tên file hiển thị              |
| `fileUrl`      | String       | Đường dẫn file trên Cloudinary |
| `uploadedAt`   | Date         | Thời gian upload               |

---

### 3.4. Collection: `Invitations` (Lời mời)

**Mục đích:** Quản lý các lời mời tham gia dự án gửi qua email.

| Tên trường (Field) | Kiểu dữ liệu (Type) | Bắt buộc | Mô tả & Ràng buộc                                  |
| ------------------ | ------------------- | -------- | -------------------------------------------------- |
| `_id`              | ObjectId            | Có       | Khóa chính                                         |
| `projectId`        | ObjectId            | Có       | Reference (`Projects`). Mời vào dự án nào?         |
| `inviterId`        | ObjectId            | Có       | Reference (`Users`). Ai là người mời?              |
| `email`            | String              | Có       | Email người nhận lời mời                           |
| `role`             | String              | Có       | Vai trò dự kiến (Leader/Member)                    |
| `token`            | String              | Có       | Unique. Chuỗi mã hóa dùng để xác thực khi bấm link |
| `expiresAt`        | Date                | Có       | Thời gian hết hạn của link mời (Ví dụ: sau 7 ngày) |
| `createdAt`        | Date                | Có       | Thời gian gửi lời mời                              |

---

## CHƯƠNG 4: THIẾT KẾ API (RESTFUL SPECIFICATION)

### 4.1. Auth & User

| Method | Endpoint           | Mô tả                               |
| ------ | ------------------ | ----------------------------------- |
| POST   | `/api/auth/google` | Đăng nhập/Đăng ký bằng Google Token |
| GET    | `/api/auth/me`     | Lấy thông tin user hiện tại         |

---

### 4.2. Projects

| Method | Endpoint            | Mô tả                                   |
| ------ | ------------------- | --------------------------------------- |
| GET    | `/api/projects`     | Lấy danh sách dự án đã tham gia         |
| POST   | `/api/projects`     | Tạo dự án mới                           |
| GET    | `/api/projects/:id` | Xem chi tiết dự án                      |
| PATCH  | `/api/projects/:id` | Cập nhật thông tin/setting dự án        |
| DELETE | `/api/projects/:id` | Xóa dự án (Strict Check - xác nhận tên) |

---

### 4.3. Members (Sub-resource of Project)

| Method | Endpoint                            | Mô tả               |
| ------ | ----------------------------------- | ------------------- |
| PATCH  | `/api/projects/:id/members/:userId` | Đổi role thành viên |
| DELETE | `/api/projects/:id/members/:userId` | Xóa thành viên      |
| POST   | `/api/projects/:id/leave`           | Tự rời dự án        |

---

### 4.4. Tasks

| Method | Endpoint                     | Query Params                        | Mô tả                                |
| ------ | ---------------------------- | ----------------------------------- | ------------------------------------ |
| GET    | `/api/tasks`                 | `projectId=...`<br>`assigneeId=...` | Lấy danh sách task theo bộ lọc       |
| POST   | `/api/tasks`                 | -                                   | Tạo task mới                         |
| GET    | `/api/tasks/:id`             | -                                   | Xem chi tiết task                    |
| PATCH  | `/api/tasks/:id`             | -                                   | Cập nhật task (trạng thái/thông tin) |
| DELETE | `/api/tasks/:id`             | -                                   | Xóa task                             |
| POST   | `/api/tasks/:id/attachments` | -                                   | Upload file đính kèm cho task        |

---

### 4.5. Invitations

| Method | Endpoint                  | Mô tả                        |
| ------ | ------------------------- | ---------------------------- |
| POST   | `/api/invitations`        | Gửi email mời tham gia dự án |
| POST   | `/api/invitations/accept` | Xác nhận tham gia qua Token  |
