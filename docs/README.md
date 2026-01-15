# 📊 BÁOCÁO PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

**Dự án:** TaskTracker - Ứng dụng Quản lý Công việc Dự án  
**Phiên bản:** 1.0  
**Ngày hoàn thành:** Tháng 12, 2025  
**Tác giả:** Team Developer

---

## 📑 MỤC LỤC

1. [Mục 1: Đặt Vấn Đề](01_problem_statement.md)
2. [Mục 2: Cơ Sở Lý Thuyết & Công Nghệ](02_foundation_technology.md)
3. [Mục 3: Phân Tích & Thiết Kế](03_analysis_design.md)
4. [Mục 4: Triển Khai & Thử Nghiệm](04_deployment_testing.md)
5. [Mục 5: Tài Liệu Tham Khảo](05_references.md)

---

## 🎯 TÓM TẮT EXECUTIVE SUMMARY

### Tên Dự Án

**TaskTracker** - Ứng dụng Web Quản lý Công việc Dự án (Project Management Tool)

### Mục Tiêu

Xây dựng nền tảng quản lý dự án hiện đại, cho phép các nhóm làm việc:

- ✅ Quản lý dự án và công việc hiệu quả
- ✅ Phân chia trách nhiệm rõ ràng
- ✅ Theo dõi tiến độ và hạn chót
- ✅ Cộng tác và giao tiếp trong nhóm

### Công Nghệ

```
┌─────────────────┐
│    Frontend     │  React.js + Tailwind + Shadcn
├─────────────────┤
│    Backend      │  Node.js + Express.js
├─────────────────┤
│    Database     │  MongoDB (NoSQL)
├─────────────────┤
│ External APIs   │  Google OAuth, Cloudinary, Gmail
└─────────────────┘
```

### Tính Năng Chính

1. **Xác thực** - Google OAuth
2. **Quản lý Dự án** - Tạo, chỉnh sửa, xóa dự án
3. **Quản lý Công việc** - Task với trạng thái, ưu tiên, deadline
4. **Quản lý Thành viên** - Mời, giao quyền, xóa
5. **Nhắc nhở Tự động** - Email reminder dạo hạn sắp tới
6. **Đính kèm File** - Upload lên Cloudinary

---

## 📈 THỐNG KÊ DỰ ÁN

| Tiêu Chí              | Giá Trị                                                     |
| --------------------- | ----------------------------------------------------------- |
| **Số Models**         | 4 (User, Project, Task, Invitation)                         |
| **Số Routes**         | 5 nhóm (Auth, Projects, Tasks, Members, Invitations)        |
| **Số Pages**          | 5 (Login, Dashboard, Projects, ProjectDetail, AcceptInvite) |
| **Số Components**     | 20+                                                         |
| **Lines of Code**     | ~3500+                                                      |
| **Phân Quyền**        | 3 cấp (Owner, Leader, Member)                               |
| **Dịch Vụ Bên Thứ 3** | 3 (Google, Cloudinary, Gmail)                               |

---

## 📋 CẤU TRÚC TỀ LỀU

```
docs/
├── 01_problem_statement.md      (Đặt vấn đề)
├── 02_foundation_technology.md  (Cơ sở lý thuyết)
├── 03_analysis_design.md        (Phân tích & thiết kế)
├── 04_deployment_testing.md     (Triển khai & thử nghiệm)
├── 05_references.md             (Tài liệu tham khảo)
└── images/                       (Biểu đồ, hình ảnh)
    ├── architecture.png
    ├── database_schema.png
    ├── use_case_diagram.png
    ├── sequence_diagram.png
    ├── activity_diagram.png
    └── screenshots/             (Ảnh giao diện)
```

---

**📄 Để xem chi tiết từng mục, vui lòng truy cập các file báo cáo tương ứng.**
