# Hướng Dẫn Triển Khai Dự Án Bất Động Sản Với Docker

Tài liệu này hướng dẫn bạn cách chạy toàn bộ hệ thống (Database, Backend, Frontend Admin, Frontend Client) chỉ bằng vài câu lệnh đơn giản thông qua Docker. Bạn không cần phải cài đặt Node.js hay PostgreSQL trực tiếp lên máy tính của mình.

## 1. Docker là gì? (Giải thích cơ bản)
*   **Docker** giống như một cái "hộp" chứa sẵn mọi thứ cần thiết (mã nguồn, công cụ, cấu hình, cơ sở dữ liệu) để chạy dự án. Nhờ vậy, dự án có thể chạy trơn tru trên mọi máy tính mà không sợ bị lỗi "máy tôi chạy được nhưng máy bạn thì không".
*   **Docker Compose** là công cụ giúp quản lý nhiều "hộp" (containers) cùng một lúc. Trong dự án này, chúng ta có 4 hộp:
    1.  `database`: Cơ sở dữ liệu PostgreSQL.
    2.  `backend`: API Server.
    3.  `frontend_admin`: Giao diện quản trị.
    4.  `frontend_client`: Giao diện người dùng ngoài.

## 2. Điều kiện bắt buộc (Cần làm trước tiên)
Bạn phải cài đặt **Docker Desktop** trên máy tính tính (Windows). 
*   Link tải: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
*   Cài đặt xong, hãy mở ứng dụng Docker Desktop lên và đảm bảo nó đang chạy (có icon hình con cá voi ở góc dưới bên phải màn hình).

---

## 3. Các bước triển khai dự án

### Bước 1: Chuẩn bị file biến môi trường (`.env`)
Dự án cần một file `.env` chứa các thông tin cấu hình như mật khẩu database, cổng chạy ứng dụng.
Hãy đảm bảo bạn đã tạo một file có tên là `.env` (không có đuôi nào khác) ở thư mục gốc của dự án (`e:\Working\Batdongsan\.env`). File này nên có các nội dung tối thiểu sau:

```env
# Cấu hình Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=batdongsan_db
POSTGRES_PORT=5432

# Cấu hình Backend
BACKEND_PORT=3000
JWT_SECRET=my-super-secret-key
JWT_EXPIRES_IN=7d

# Cấu hình Frontend
FRONTEND_ADMIN_PORT=3001
FRONTEND_CLIENT_PORT=3002
```
*(Bạn có thể thay đổi mật khẩu và thông tin tùy ý)*

### Bước 2: Chạy toàn bộ hệ thống
Mở Terminal (hoặc PowerShell) tại thư mục gốc của dự án (`e:\Working\Batdongsan`) và chạy lệnh sau:

```bash
docker-compose up -d --build
```

**Giải thích lệnh:**
*   `up`: Yêu cầu Docker khởi động các containers.
*   `-d`: (Detached) Cho phép các hộp chạy ngầm, bạn có thể tiếp tục sử dụng terminal để gõ lệnh khác mà không bị treo.
*   `--build`: Buộc Docker phải đóng gói lại mã nguồn mới nhất của bạn trước khi chạy (rất cần thiết khi bạn vừa sửa code).

Lần đầu tiên chạy lệnh này sẽ mất một chút thời gian (có thể vài phút) vì Docker phải tải hệ điều hành, cấu hình môi trường và tải các thư viện NPM.

### Bước 3: Truy cập vào các ứng dụng
Sau khi lệnh trên chạy xong, dự án của bạn đã hoạt động. Hãy mở trình duyệt lên và truy cập vào các đường link sau:

*   **Backend API:** `http://localhost:3000`
*   **Giao diện Admin:** `http://localhost:3001`
*   **Giao diện Người dùng:** `http://localhost:3002`

### Bước 4: Tắt dự án
Khi không làm việc nữa và muốn tắt để nhẹ máy, hãy chạy lệnh sau trong Terminal:

```bash
docker-compose down
```
Lệnh này sẽ tắt và dọn dẹp các hộp. Yên tâm là dữ liệu trong database vẫn được giữ lại một cách an toàn.

---

## 4. Các câu lệnh thao tác thường dùng khác

Trong quá trình phát triển dự án, bạn có thể cần dùng một số lệnh sau:

**1. Xem log (lỗi) của một dịch vụ:**
Nếu một dịch vụ nào đó không chạy được, bạn có thể xem lỗi bằng lệnh:
```bash
# Cú pháp: docker-compose logs -f <tên_service>
docker-compose logs -f backend
docker-compose logs -f frontend_client
```
*(Bấm `Ctrl + C` để thoát khỏi chế độ xem log)*

**2. Khởi động lại một dịch vụ cụ thể (khi code bị treo):**
```bash
docker-compose restart backend
```

**3. Tắt dự án VÀ xóa luôn dữ liệu database (Cẩn thận!!):**
Nếu bạn muốn reset lại toàn bộ cơ sở dữ liệu làm lại từ đầu:
```bash
docker-compose down -v
```

---

## 5. Cơ chế Hot-Reload (Tự cập nhật khi sửa code)
Dự án đã được cấu hình sẵn **Volume**. Điều này có nghĩa là thư mục code trên máy tính của bạn (`backend`, `frontend_admin`, `frontend_client`, `shared`) được liên kết trực tiếp vào bên trong Docker.

👉 **Cách hoạt động:** Khi bạn sửa code ở máy và bấm Lưu (Save), code trong Docker cũng thay đổi theo ngay lập tức. Bạn KHÔNG cần phải khởi động lại Docker mỗi khi sửa code!
