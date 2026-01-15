# Task Tracker (Quản lý công việc dự án)

## Mục tiêu

Xây dựng ứng dụng web giúp các nhóm làm việc quản lý tiến độ dự án, phân chia công việc và theo dõi hạn chót (deadline) hiệu quả. Hệ thống tập trung vào:

- Trải nghiệm người dùng tối giản
- Phân quyền rõ ràng
- Khả năng làm việc cộng tác

## Phân quyền (Roles)

Hệ thống hoạt động dựa trên 3 vai trò trong một dự án:

1. **OWNER (Chủ dự án)**

   - Người tạo dự án
   - Có toàn quyền: Quản lý thành viên, Xóa dự án, Cài đặt chung

2. **LEADER (Trưởng nhóm)**

   - Được Owner chỉ định
   - Có quyền quản lý Task (Xem/Tạo/Sửa/Xóa)
   - Không được can thiệp thiết lập dự án

3. **MEMBER (Thành viên)**
   - Người thực hiện công việc
   - Quyền: Xem task (tùy cài đặt), cập nhật trạng thái các task được giao

## Các tính năng

| STT | Mã          | Tính năng                    | Mô tả                                                                                 |
| --- | ----------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| 1   | F_AUTH-01   | Đăng nhập bằng Google        | Cho phép người dùng đăng nhập hệ thống thông qua tài khoản Google.                    |
| 2   | F_AUTH-02   | Đăng xuất hệ thống           | Cho phép người dùng đăng xuất khỏi hệ thống đang sử dụng.                             |
| 3   | F_PROJ-01   | Tạo dự án mới                | Người dùng có quyền tạo dự án mới với tên và mô tả dự án.                             |
| 4   | F_PROJ-02   | Xem danh sách dự án          | Người dùng xem danh sách tất cả các dự án mà họ là thành viên.                        |
| 5   | F_PROJ-03   | Xem chi tiết dự án           | Người dùng xem thông tin chi tiết của một dự án mà họ tham gia.                       |
| 6   | F_PROJ-04   | Cập nhật thông tin dự án     | Owner chỉnh sửa các thông tin cơ bản của dự án.                                       |
| 7   | F_PROJ-05   | Cấu hình cài đặt dự án       | Owner cấu hình quyền xem task của Member và bật/tắt nhắc hẹn.                         |
| 8   | F_PROJ-06   | Xóa dự án có xác nhận        | Owner xóa dự án sau khi nhập chính xác tên dự án để xác nhận.                         |
| 9   | F_TASK-01   | Tạo công việc                | Leader hoặc Owner tạo mới công việc trong dự án.                                      |
| 10  | F_TASK-02   | Cập nhật công việc           | Leader/Owner chỉnh sửa toàn bộ; Assignee chỉ được thay đổi trạng thái.                |
| 11  | F_TASK-03   | Xem danh sách công việc      | Hiển thị danh sách công việc theo vai trò và cấu hình dự án.                          |
| 12  | F_TASK-04   | Đính kèm tệp công việc       | Leader/Owner/Assignee đính kèm tệp vào công việc.                                     |
| 13  | F_TASK-05   | Xóa tệp đính kèm             | Leader/Owner/Assignee xóa tệp đã đính kèm trong công việc.                            |
| 14  | F_TASK-06   | Xem chi tiết công việc       | Leader/Owner/Assignee xem đầy đủ thông tin chi tiết của công việc.                    |
| 15  | F_TASK-07   | Xóa công việc                | Leader hoặc Owner xóa công việc khỏi dự án.                                           |
| 16  | F_TASK-08   | Gửi email nhắc hạn công việc | Hệ thống tự động gửi email nhắc nhở lúc 07:00 cho công việc sắp đến hạn hoặc quá hạn. |
| 17  | F_MEMBER-01 | Mời thành viên vào dự án     | Owner/Leader mời người dùng mới tham gia dự án thông qua email.                       |
| 18  | F_MEMBER-02 | Quản lý vai trò thành viên   | Owner thay đổi vai trò thành viên giữa Leader và Member.                              |
| 19  | F_MEMBER-03 | Xóa thành viên khỏi dự án    | Owner loại bỏ một thành viên ra khỏi dự án.                                           |
| 20  | F_MEMBER-04 | Rời khỏi dự án               | Leader hoặc Member chủ động rời khỏi dự án đang tham gia.                             |
| 21  | F_MEMBER-05 | Tham gia dự án qua email     | Người dùng chấp nhận lời mời và tham gia dự án thông qua email.                       |

## Kiến trúc

Dự án được xây dựng theo kiến trúc Client - Server

## Công nghệ sử dụng

- **Frontend:** ReactJS, Tailwind, Shadcn
- **Backend:** Node.js, ExpressJS
- **Database:** MongoDB (NoSQL)
- **Dịch vụ bên thứ 3:**
  - Google OAuth (Login)
  - Cloudinary (Lưu trữ file)
  - Gmail SMTP (Gửi mail)

---

> Hướng dẫn sử dụng được trình bày trong [QuickStart](\docs\QuickStart.md)  
> Chi tiết về Phân tích & thiết kế đươc trình bày tại [Software Requirements Specification](\docs\Software_Requirements_Specification.pdf)
