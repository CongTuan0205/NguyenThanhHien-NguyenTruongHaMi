# HƯỚNG DẪN 4 CÁCH CHẠY PHẦN MỀM QUẢN LÝ THƯ VIỆN (ĐỀ TÀI 1.1 CNPM)

Bạn có thể khởi chạy phần mềm bằng **4 cách khác nhau** tùy theo nhu cầu khi thuyết trình, bảo vệ đồ án hoặc chạy trên máy giảng viên:

---

## Cách 1: Chạy ở chế độ Ứng dụng Desktop độc lập (Giống phần mềm `.exe` trên Windows)
- **Thao tác:** Nhấp đúp chuột vào file **[CHAY_PHAN_MEM_DESKTOP.bat](./CHAY_PHAN_MEM_DESKTOP.bat)**.
- **Đặc điểm:** Phần mềm sẽ mở ra trong một **cửa sổ ứng dụng Desktop riêng biệt** (ẩn toàn bộ thanh tab và thanh địa chỉ của trình duyệt), nhìn y hệt một phần mềm quản lý cài đặt trên máy tính Windows.

---

## Cách 2: Chạy qua Máy chủ Node.js (`http://localhost:3000`)
- **Thao tác 1 (Nhấp đúp chuột):** Nhấp đúp vào file **[CHAY_SERVER_NODEJS.bat](./CHAY_SERVER_NODEJS.bat)**.
- **Thao tác 2 (Chạy bằng lệnh Terminal trong VS Code):**
  ```bash
  npm start
  ```
  *(Hoặc gõ `node server.js`)*
- **Đặc điểm:** Khởi chạy Web Server Node.js thông qua file **[server.js](./server.js)** tại địa chỉ `http://localhost:3000` và tự động bật trình duyệt lên.

---

## Cách 3: Chạy bằng Extension Live Server trên Visual Studio Code
- **Thao tác:** Mở thư mục đề tài trong **VS Code** -> Nhấp chuột phải vào file **[index.html](./index.html)** -> Chọn **"Open with Live Server"** (hoặc nhấn `Alt + L, Alt + O`).
- **Đặc điểm:** Chạy trên địa chỉ máy chủ cục bộ `http://127.0.0.1:5500/index.html`, tự động làm mới trang khi bạn sửa code.

---

## Cách 4: Mở trực tiếp file [index.html](./index.html)
- **Thao tác:** Nhấp đúp trực tiếp vào file **[index.html](./index.html)**.
- **Đặc điểm:** Tiện lợi khi mang sang máy tính phòng máy của trường (ngay cả khi máy trường không cài Node.js hay VS Code vẫn chạy được 100%).

---

## Tài khoản phục vụ kiểm thử khi báo cáo (Tuần 14)

### 1. Tài khoản Độc giả (Hoặc tự đăng ký thẻ mới tại mục "Cấp Thẻ Thành Viên")
- **Tài khoản 1 (Thẻ còn hạn đến 10/2027, đang mượn 2 cuốn chưa quá hạn — có thể mượn thêm tối đa 3 cuốn mới):**
  - Mã thẻ / Email: `DG001` hoặc `nguyenvanan@gmail.com` — Mật khẩu: `123456`
- **Tài khoản 2 (Thẻ còn hạn đến 05/2027, không nợ sách — có thể mượn tối đa 5 cuốn mới):**
  - Mã thẻ / Email: `DG002` hoặc `bichngocle@gmail.com` — Mật khẩu: `123456`
- **Tài khoản 3 (Thẻ đã hết hạn 07/2025 và đang giữ 1 sách quá hạn — dùng để demo chặn mượn theo QĐ4 & báo cáo sách trễ BM6):**
  - Mã thẻ / Email: `DG003` hoặc `tranminhquan@gmail.com` — Mật khẩu: `123456`

### 2. Tài khoản Cán bộ Quản trị (Đăng nhập tại "Cổng Cán Bộ Quản Trị")
- **Ban Giám Đốc:** Tài khoản `admin` (hoặc `NV001`) — Mật khẩu: `admin123`
- **Bộ phận Thủ Thư:** Tài khoản `NV002` (hoặc `thuthu`) — Mật khẩu: `123456`
- **Bộ phận Thủ Kho:** Tài khoản `NV003` (hoặc `thukho`) — Mật khẩu: `123456`
