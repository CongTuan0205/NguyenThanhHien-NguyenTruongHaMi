-- =================================================================================
-- ĐỀ TÀI 1.1: THIẾT KẾ PHẦN MỀM QUẢN LÝ THƯ VIỆN (HỌC PHẦN CÔNG NGHỆ PHẦN MỀM)
-- CƠ SỞ DỮ LIỆU ĐẦY ĐỦ CÁC BẢNG CHUẨN BM1, BM2, BM3, BM4 & QUY ĐỊNH QĐ1, QĐ2, QĐ3, QĐ4
-- =================================================================================

CREATE DATABASE QuanLyThuVien_CNPM;
GO
USE QuanLyThuVien_CNPM;
GO

-- 1. BẢNG THAM SỐ QUY ĐỊNH (QĐ5)
CREATE TABLE ThamSo (
    TenThamSo VARCHAR(50) PRIMARY KEY,
    GiaTri INT NOT NULL,
    MoTa NVARCHAR(255)
);

-- 2. BẢNG HỒ SƠ NHÂN VIÊN (Chuẩn BM1 & QĐ1 trang 3 tài liệu đề tài 1.1)
-- BM1 gồm: Họ và tên, Địa chỉ, Ngày Sinh, Điện Thoại, Bằng Cấp, Bộ Phận, Chức vụ
-- QĐ1: 6 Bằng cấp (Tú Tài, Trung Cấp, Cao Đẳng, Đại Học, Thạc Sĩ, Tiến Sĩ),
--      4 Bộ phận (Thủ Thư, Thủ Kho, Thủ Quỹ, Ban Giám Đốc),
--      5 Chức vụ (Giám Đốc, Phó Giám Đốc, Trưởng Phòng, Phó Phòng, Nhân Viên)
CREATE TABLE NhanVien (
    MaNV VARCHAR(20) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    DiaChi NVARCHAR(255) NOT NULL,
    NgaySinh DATE NOT NULL,
    DienThoai VARCHAR(20) NOT NULL,
    BangCap NVARCHAR(50) NOT NULL CHECK (BangCap IN (N'Tú tài', N'Trung cấp', N'Cao đẳng', N'Đại học', N'Thạc sĩ', N'Tiến sĩ')),
    BoPhan NVARCHAR(50) NOT NULL CHECK (BoPhan IN (N'Thủ Thư', N'Thủ Kho', N'Thủ Quỹ', N'Ban Giám Đốc')),
    ChucVu NVARCHAR(50) NOT NULL CHECK (ChucVu IN (N'Giám Đốc', N'Phó Giám Đốc', N'Trưởng Phòng', N'Phó Phòng', N'Nhân Viên')),
    TaiKhoan VARCHAR(50),
    MatKhau VARCHAR(100) DEFAULT '123456'
);

-- 3. BẢNG THẺ ĐỘC GIẢ (Chuẩn BM2 & QĐ2 trang 3-4 tài liệu đề tài 1.1)
-- BM2 gồm: Họ và tên, Loại độc giả, Ngày sinh, Địa chỉ, Email, Ngày lập thẻ, Người lập
-- QĐ2: 2 loại độc giả (X, Y), Tuổi từ 18 đến 55, Thẻ có giá trị 6 tháng, Người lập thuộc bộ phận Thủ Thư
CREATE TABLE DocGia (
    MaDocGia VARCHAR(20) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    LoaiDocGia CHAR(1) NOT NULL CHECK (LoaiDocGia IN ('X', 'Y')),
    NgaySinh DATE NOT NULL,
    DiaChi NVARCHAR(255) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE CHECK (Email LIKE '%_@gmail.com'),
    MatKhau VARCHAR(100) DEFAULT '123456',
    GoiDangKy VARCHAR(30) DEFAULT 'GOI_6THANG',
    TenGoi NVARCHAR(100) DEFAULT N'Gói Tiêu Chuẩn QĐ2 (6 Tháng)',
    PhiDangKy DECIMAL(18,0) DEFAULT 50000,
    NgayLapThe DATE NOT NULL,
    NgayHetHan DATE NOT NULL,
    NguoiLapThe VARCHAR(20) NOT NULL REFERENCES NhanVien(MaNV)
);

-- 4. BẢNG THÔNG TIN SÁCH (Chuẩn BM3 & QĐ3 trang 4 tài liệu đề tài 1.1)
-- BM3 gồm: Tên sách, Thể loại, Tác giả, Năm xuất bản, Nhà xuất bản, Ngày nhập, Trị giá, Người Tiếp Nhận
-- QĐ3: 3 thể loại (A, B, C), Chỉ nhận sách xuất bản trong vòng 8 năm, Người nhận thuộc bộ phận Thủ Kho
CREATE TABLE Sach (
    MaSach VARCHAR(20) PRIMARY KEY,
    TenSach NVARCHAR(250) NOT NULL,
    TheLoai CHAR(1) NOT NULL CHECK (TheLoai IN ('A', 'B', 'C')),
    ChuyenMuc NVARCHAR(100),
    TacGia NVARCHAR(150) NOT NULL,
    NamXuatBan INT NOT NULL,
    NhaXuatBan NVARCHAR(150) NOT NULL,
    NgayNhap DATE NOT NULL,
    TriGia DECIMAL(18,0) NOT NULL CHECK (TriGia >= 0),
    NguoiTiepNhan VARCHAR(20) NOT NULL REFERENCES NhanVien(MaNV),
    TinhTrang VARCHAR(20) NOT NULL DEFAULT 'Con' CHECK (TinhTrang IN ('Con', 'DangMuon')),
    HinhAnh NVARCHAR(500)
);

-- 5. BẢNG PHIẾU MƯỢN SÁCH (Chuẩn BM4 & QĐ4 trang 4 tài liệu đề tài 1.1)
-- BM4 gồm: Họ tên độc giả (MaDocGia), Ngày mượn, Hạn trả đăng ký, và Danh sách chi tiết sách mượn
-- QĐ4: Chỉ cho mượn với thẻ còn hạn, không có sách quá hạn, sách không có người đang mượn, tối đa 5 quyển trong 4 ngày
CREATE TABLE PhieuMuon (
    MaPhieuMuon VARCHAR(20) PRIMARY KEY,
    MaDocGia VARCHAR(20) NOT NULL REFERENCES DocGia(MaDocGia),
    NgayMuon DATE NOT NULL,
    HanTra DATE NOT NULL,
    NguoiChoMuon VARCHAR(20) REFERENCES NhanVien(MaNV),
    GhiChu NVARCHAR(255)
);

-- 6. BẢNG CHI TIẾT PHIẾU MƯỢN (Lưu STT, Mã Sách, Tình trạng mượn trả của BM4)
CREATE TABLE ChiTietPhieuMuon (
    MaPhieuMuon VARCHAR(20) NOT NULL REFERENCES PhieuMuon(MaPhieuMuon),
    MaSach VARCHAR(20) NOT NULL REFERENCES Sach(MaSach),
    TinhTrangMuon VARCHAR(20) NOT NULL DEFAULT 'DangMuon' CHECK (TinhTrangMuon IN ('DangMuon', 'DaTra')),
    NgayTra DATE NULL,
    PRIMARY KEY (MaPhieuMuon, MaSach)
);
GO

-- =================================================================================
-- TRIGGER KIỂM TRA RÀNG BUỘC NGHIỆP VỤ TỰ ĐỘNG TRONG SQL SERVER (QĐ2, QĐ3, QĐ4)
-- =================================================================================

-- 1. Trigger QĐ2: Kiểm tra tuổi độc giả 18..55 và Người lập thẻ phải thuộc bộ phận 'Thủ Thư'
CREATE TRIGGER TRG_Check_QD2_DocGia
ON DocGia
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE (YEAR(GETDATE()) - YEAR(NgaySinh)) < 18
           OR (YEAR(GETDATE()) - YEAR(NgaySinh)) > 55
    )
    BEGIN
        RAISERROR(N'Vi phạm QĐ2: Tuổi độc giả phải từ 18 đến 55 tuổi!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN NhanVien nv ON i.NguoiLapThe = nv.MaNV
        WHERE nv.BoPhan <> N'Thủ Thư'
    )
    BEGIN
        RAISERROR(N'Vi phạm QĐ2: Người lập thẻ độc giả phải là nhân viên thuộc bộ phận Thủ Thư!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- 2. Trigger QĐ3: Kiểm tra sách xuất bản trong vòng 8 năm (không lớn hơn năm hiện tại) và Người tiếp nhận thuộc bộ phận 'Thủ Kho'
CREATE TRIGGER TRG_Check_QD3_Sach
ON Sach
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE NamXuatBan > YEAR(GETDATE()) OR (YEAR(GETDATE()) - NamXuatBan) > 8
    )
    BEGIN
        RAISERROR(N'Vi phạm QĐ3: Chỉ nhận các sách xuất bản trong vòng 8 năm trở lại đây!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN NhanVien nv ON i.NguoiTiepNhan = nv.MaNV
        WHERE nv.BoPhan <> N'Thủ Kho'
    )
    BEGIN
        RAISERROR(N'Vi phạm QĐ3: Người tiếp nhận sách phải là nhân viên thuộc bộ phận Thủ Kho!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- 3. Trigger QĐ4 (Bảng PhieuMuon): Kiểm tra Thẻ độc giả còn hạn, không có sách quá hạn & thời gian mượn tối đa 4 ngày
CREATE TRIGGER TRG_Check_QD4_PhieuMuon
ON PhieuMuon
AFTER INSERT, UPDATE
AS
BEGIN
    -- Kiểm tra thời hạn mượn tối đa 4 ngày theo QĐ4
    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE DATEDIFF(DAY, NgayMuon, HanTra) <= 0 OR DATEDIFF(DAY, NgayMuon, HanTra) > 4
    )
    BEGIN
        RAISERROR(N'Vi phạm QĐ4: Mỗi độc giả chỉ được mượn sách trong tối đa 4 ngày (từ 1 đến 4 ngày)!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Kiểm tra thẻ còn hạn
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN DocGia dg ON i.MaDocGia = dg.MaDocGia
        WHERE dg.NgayHetHan < i.NgayMuon
    )
    BEGIN
        RAISERROR(N'Vi phạm QĐ4: Thẻ độc giả đã hết hạn, không thể cho mượn sách!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Kiểm tra độc giả không có sách mượn quá hạn chưa trả
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN PhieuMuon pm ON i.MaDocGia = pm.MaDocGia AND i.MaPhieuMuon <> pm.MaPhieuMuon
        JOIN ChiTietPhieuMuon ct ON pm.MaPhieuMuon = ct.MaPhieuMuon
        WHERE ct.TinhTrangMuon = 'DangMuon' AND pm.HanTra < i.NgayMuon
    )
    BEGIN
        RAISERROR(N'Vi phạm QĐ4: Độc giả đang có sách mượn quá hạn chưa trả!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- 4. Trigger QĐ4 (Bảng ChiTietPhieuMuon): Kiểm tra tối đa 5 quyển sách & Tự động cập nhật TinhTrang sách
CREATE TRIGGER TRG_Check_QD4_ChiTietPhieuMuon
ON ChiTietPhieuMuon
AFTER INSERT
AS
BEGIN
    -- Kiểm tra tổng số sách đang mượn của độc giả không vượt quá 5 quyển
    IF EXISTS (
        SELECT pm.MaDocGia
        FROM PhieuMuon pm
        JOIN ChiTietPhieuMuon ct ON pm.MaPhieuMuon = ct.MaPhieuMuon
        WHERE ct.TinhTrangMuon = 'DangMuon'
          AND pm.MaDocGia IN (
              SELECT p.MaDocGia FROM inserted i JOIN PhieuMuon p ON i.MaPhieuMuon = p.MaPhieuMuon
          )
        GROUP BY pm.MaDocGia
        HAVING COUNT(*) > 5
    )
    BEGIN
        RAISERROR(N'Vi phạm QĐ4: Mỗi độc giả chỉ được mượn tối đa 5 quyển sách!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Tự động chuyển tình trạng sách sang 'DangMuon'
    UPDATE Sach
    SET TinhTrang = 'DangMuon'
    FROM Sach s
    JOIN inserted i ON s.MaSach = i.MaSach
    WHERE i.TinhTrangMuon = 'DangMuon';
END;
GO

-- =================================================================================
-- DỮ LIỆU KHỞI TẠO (SEED DATA)
-- =================================================================================

INSERT INTO ThamSo VALUES
('TuoiToiThieu', 18, N'Tuổi độc giả tối thiểu (QĐ2)'),
('TuoiToiDa', 55, N'Tuổi độc giả tối đa (QĐ2)'),
('ThoiHanTheThang', 6, N'Thời hạn thẻ có giá trị 6 tháng (QĐ2)'),
('KhoangCachNamXB', 8, N'Chỉ nhận sách xuất bản trong vòng 8 năm (QĐ3)'),
('SoSachMuonToiDa', 5, N'Mỗi độc giả mượn tối đa 5 quyển sách (QĐ4)'),
('SoNgayMuonToiDa', 4, N'Mượn tối đa trong 4 ngày (QĐ4)');

INSERT INTO NhanVien (MaNV, HoTen, DiaChi, NgaySinh, DienThoai, BangCap, BoPhan, ChucVu, TaiKhoan, MatKhau) VALUES
('NV001', N'Nguyễn Minh Hoàng', N'12 Lê Duẩn, Quận 1, TP.HCM', '1988-05-14', '0901234567', N'Thạc sĩ', N'Ban Giám Đốc', N'Giám Đốc', 'admin', 'admin123'),
('NV002', N'Trần Thị Thu Hà', N'45 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', '1995-08-20', '0912345678', N'Đại học', N'Thủ Thư', N'Nhân Viên', 'thuthu', '123456'),
('NV003', N'Lê Quốc Bảo', N'88 Võ Văn Ngân, TP. Thủ Đức', '1993-11-02', '0923456789', N'Đại học', N'Thủ Kho', N'Trưởng Phòng', 'thukho', '123456'),
('NV004', N'Phạm Hoàng Yến', N'210 Cách Mạng Tháng 8, Quận 10, TP.HCM', '1997-02-18', '0934567890', N'Cao đẳng', N'Thủ Quỹ', N'Nhân Viên', 'thuquy', '123456'),
('NV005', N'Võ Văn Kiệt', N'19 Lý Thường Kiệt, Quận Tân Bình, TP.HCM', '1996-07-12', '0945678901', N'Đại học', N'Thủ Thư', N'Phó Phòng', 'kietvv', '123456');

INSERT INTO DocGia VALUES
('DG001', N'Nguyễn Văn An', 'X', '2003-04-15', N'125 Nguyễn Văn Cừ, Q.5, TP.HCM', 'nguyenvanan@gmail.com', '123456', 'GOI_NAM_VIP', N'Gói Thành Viên VIP (1 Năm)', 100000, '2026-10-01', '2027-10-01', 'NV002'),
('DG002', N'Lê Thị Bích Ngọc', 'Y', '1992-09-10', N'48 Lê Lợi, Q.1, TP.HCM', 'bichngocle@gmail.com', '123456', 'GOI_6THANG', N'Gói Tiêu Chuẩn QĐ2 (6 Tháng)', 50000, '2026-11-01', '2027-05-01', 'NV002'),
('DG003', N'Trần Minh Quân', 'X', '2004-11-25', N'KTX Khu B ĐHQG, TP. Thủ Đức', 'tranminhquan@gmail.com', '123456', 'GOI_6THANG', N'Gói Tiêu Chuẩn QĐ2 (6 Tháng)', 50000, '2025-01-05', '2025-07-05', 'NV005');

-- 43 ĐẦU SÁCH PHÂN LOẠI NHÓM A, B, C (BM3 - QĐ3)
INSERT INTO Sach (MaSach, TenSach, TheLoai, ChuyenMuc, TacGia, NamXuatBan, NhaXuatBan, NgayNhap, TriGia, NguoiTiepNhan, TinhTrang, HinhAnh) VALUES
('MS001', N'Giáo Trình Giáo Dục Học', 'A', N'Giáo Dục & Sư Phạm', N'Nguyễn Thị Hường (Chủ biên)', 2022, N'NXB Đại Học Vinh', '2025-01-10', 85000, 'NV003', 'Con', 'images/nhom A/1794538676885_112601018615683622_3100374492545443504_b491343d78e50d1b905aada8e28e5f39.jpg'),
('MS002', N'Giáo Dục Học', 'A', N'Giáo Dục & Sư Phạm', N'Phạm Viết Vượng', 2021, N'NXB Đại Học Sư Phạm', '2025-01-10', 78000, 'NV003', 'Con', 'images/nhom A/1794538676931_112601018615683622_3100374492545443504_5f1af2c0260f287ee4b1eb3b6e10d7af.jpg'),
('MS003', N'Giáo Trình Giáo Dục Học - Tập Một', 'A', N'Giáo Dục & Sư Phạm', N'Phan Thị Hồng Vinh - Trần Thị Tuyết Oanh', 2022, N'NXB Đại Học Sư Phạm', '2025-01-11', 92000, 'NV003', 'Con', 'images/nhom A/1794538676945_112601018615683622_3100374492545443504_bbdc18af9967f403297d1d2979ecb54c.jpg'),
('MS004', N'Giáo Dục Vì Cuộc Sống Sáng Tạo', 'A', N'Triết Lý Giáo Dục', N'Tsunesaburo Makiguchi', 2021, N'NXB Trẻ', '2025-01-12', 125000, 'NV003', 'Con', 'images/nhom A/1794538676955_112601018615683622_3100374492545443504_8cc451d98c7ce5d5dc48180ffd3ff082.jpg'),
('MS005', N'Tâm Lý Học Toàn Thư: Lịch Sử Tâm Lý Học', 'A', N'Tâm Lý Học', N'Nhiều Tác Giả (Vương Mộc dịch)', 2023, N'NXB Trẻ', '2025-01-12', 145000, 'NV003', 'Con', 'images/nhom A/1794538676964_112601018615683622_3100374492545443504_190aed939bfccaa5124b969eb6200fd7.jpg'),
('MS006', N'Tâm Lý Học Toàn Thư: Tâm Lý Học Bất Thường', 'A', N'Tâm Lý Học', N'Nhiều Tác Giả (Nguyễn Tuấn Việt dịch)', 2023, N'NXB Trẻ', '2025-01-14', 148000, 'NV003', 'Con', 'images/nhom A/1794538676972_112601018615683622_3100374492545443504_5adc2acc1976bfa5972ac06ad4f93d6e.jpg'),
('MS007', N'Tâm Lý Học Toàn Thư: Tư Duy Và Hiểu Biết', 'A', N'Tâm Lý Học Nhận Thức', N'Nhiều Tác Giả (Nguyễn Vũ Minh Anh dịch)', 2023, N'NXB Trẻ', '2025-01-14', 142000, 'NV003', 'Con', 'images/nhom A/1794538676981_112601018615683622_3100374492545443504_e0f090dd93408ef7121d2905596e53f2.jpg'),
('MS008', N'Thách Thức Sáng Tạo (The Innovator''s Dilemma)', 'A', N'Tư Duy & Đổi Mới', N'Clayton M. Christensen', 2022, N'NXB Tổng Hợp TP.HCM', '2025-01-15', 165000, 'NV003', 'Con', 'images/nhom A/1794538676989_112601018615683622_3100374492545443504_9a55d0fc095614a370ded8434692894d.jpg'),
('MS009', N'Cách Trí Giáo Khoa Thư', 'A', N'Di Sản Giáo Dục', N'Trần Trọng Kim - Nguyễn Văn Ngọc', 2021, N'NXB Kim Đồng', '2025-01-16', 65000, 'NV003', 'Con', 'images/nhom A/1794538676995_112601018615683622_3100374492545443504_9863bda7e98230c87003ca8b066b0a3d.jpg'),
('MS010', N'Sử Ký Giáo Khoa Thư', 'A', N'Lịch Sử & Giáo Dục', N'Trần Trọng Kim - Nguyễn Văn Ngọc', 2021, N'NXB Trẻ', '2025-01-16', 70000, 'NV003', 'Con', 'images/nhom A/1794538677003_112601018615683622_3100374492545443504_b204b10ca194de86468738ab921f45cb.jpg'),
('MS011', N'Những Câu Chuyện Giáo Dục: Chim Sẻ Và Cô Tiên', 'A', N'Giáo Dục Nhân Cách', N'Nhật Linh (Biên soạn)', 2022, N'NXB Mỹ Thuật', '2025-01-18', 55000, 'NV003', 'Con', 'images/nhom A/1794538677009_112601018615683622_3100374492545443504_7387e8453cb14304fd37cd56ecc1bd3c.jpg'),
('MS012', N'Học Ở Trường, Học Ở Sách Vở, Học Lẫn Nhau Và Học Nhân Dân', 'A', N'Tư Tưởng Giáo Dục', N'Hồ Chí Minh', 2023, N'NXB Trẻ', '2025-01-18', 82000, 'NV003', 'Con', 'images/nhom A/1794538677015_112601018615683622_3100374492545443504_5d10d24dc0ee7d86b74caa169ebdab32.jpg'),
('MS013', N'Tâm Lý Học Dành Cho Người Hay Lo Nghĩ', 'A', N'Tâm Lý Ứng Dụng', N'Kim Hye-nam', 2023, N'NXB Trẻ', '2025-01-20', 115000, 'NV003', 'Con', 'images/nhom A/1794538677022_112601018615683622_3100374492545443504_caff5b495d196d2ac75527e5f5f1b99b.jpg'),
('MS014', N'Bàn Về Giáo Dục Việt Nam Trước Và Sau Năm 1975', 'A', N'Nghiên Cứu Giáo Dục', N'Trần Văn Chánh', 2024, N'NXB Hà Nội (Omega+)', '2025-01-22', 189000, 'NV003', 'Con', 'images/nhom A/1794538677029_112601018615683622_3100374492545443504_13e6dd83dbf3a9beb3cecdf93a558b22.jpg'),

('MS015', N'Giai Điệu Bí Ẩn Và Con Người Đã Tạo Ra Vũ Trụ', 'B', N'Vật Lý Thiên Văn', N'Trịnh Xuân Thuận', 2022, N'NXB Trẻ', '2025-01-25', 175000, 'NV003', 'Con', 'images/nhom B/1794538814199_112601018615683622_3100374492545443504_370c8776a6ce27eb6f2c3d4476413e08.jpg'),
('MS016', N'Cơ Thể Người Trong 30 Giây', 'B', N'Y Sinh & Cơ Thể Học', N'Anne Claybourne', 2022, N'NXB Dân Trí', '2025-01-25', 98000, 'NV003', 'Con', 'images/nhom B/1794538814223_112601018615683622_3100374492545443504_83081f3cac035703167a1923a8ab5def.jpg'),
('MS017', N'Bách Khoa Thư Tiểu Học Larousse: Thiên Nhiên', 'B', N'Khoa Học Tự Nhiên', N'Larousse (Danh Việt dịch)', 2023, N'NXB Thế Giới (Nhã Nam)', '2025-01-26', 135000, 'NV003', 'Con', 'images/nhom B/1794538814239_112601018615683622_3100374492545443504_021a98aab7212bd3a074cfd61c382937.jpg'),
('MS018', N'Tỷ Lệ Vàng (The Golden Ratio: The Story of Phi)', 'B', N'Toán Học & Vũ Trụ', N'Mario Livio', 2021, N'Broadway Books', '2025-01-27', 195000, 'NV003', 'Con', 'images/nhom B/1794538814253_112601018615683622_3100374492545443504_84e14cbc98e32d1553c2c6d67225f7e2.jpg'),
('MS019', N'Chuyện Kể Khoa Học: Những Phát Minh Nổi Tiếng', 'B', N'Khoa Học & Phát Minh', N'Nhiều Tác Giả', 2023, N'NXB Trẻ', '2025-01-28', 68000, 'NV003', 'Con', 'images/nhom B/1794538814266_112601018615683622_3100374492545443504_6bdcdd2a69b6bf271619419568f87f7b.jpg'),
('MS020', N'Nhập Môn Triết Học & Khoa Học: Aristotle', 'B', N'Lịch Sử Khoa Học', N'Rupert Woodfin & Judy Groves', 2021, N'Icon Books', '2025-01-29', 110000, 'NV003', 'Con', 'images/nhom B/1794538814277_112601018615683622_3100374492545443504_57a54976fbe2a78166a744a63afdcbcf.jpg'),
('MS021', N'Cơ Thể Của Tôi Hoạt Động Như Thế Nào: Bộ Não', 'B', N'Khoa Học Thần Kinh', N'T.R. Bhanot', 2022, N'NXB Hồng Đức', '2025-01-30', 62000, 'NV003', 'Con', 'images/nhom B/1794538814287_112601018615683622_3100374492545443504_46295c3d0adc11d5732c83d7f7d175e2.jpg'),
('MS022', N'Con Gái Của Galileo (Galileo''s Daughter)', 'B', N'Ký Sự Khoa Học', N'Dava Sobel', 2020, N'Penguin Books', '2025-02-01', 168000, 'NV003', 'Con', 'images/nhom B/1794538814295_112601018615683622_3100374492545443504_cedf4d8f368d6ad7b5e164c73a0d0ab4.jpg'),
('MS023', N'Thông Điệp Từ Những Vì Sao (Starry Messenger)', 'B', N'Vũ Trụ Học', N'Neil deGrasse Tyson', 2023, N'NXB Trẻ', '2025-02-02', 155000, 'NV003', 'Con', 'images/nhom B/1794538814302_112601018615683622_3100374492545443504_d305d8f4c86ef926a34cdcac537a3fae.jpg'),
('MS024', N'Những Cuộc Đời Lớn: Các Danh Nhân Khoa Học', 'B', N'Danh Nhân Khoa Học', N'Catmint Books (Phạm Hữu Khánh dịch)', 2023, N'NXB Trẻ', '2025-02-03', 120000, 'NV003', 'Con', 'images/nhom B/1794538814310_112601018615683622_3100374492545443504_2bb56e95057dcd1e20b2f3f832ee7dc1.jpg'),
('MS025', N'Lược Sử Thời Gian (A Brief History of Time)', 'B', N'Vật Lý Vũ Trụ', N'Stephen Hawking', 2022, N'NXB Trẻ', '2025-02-04', 145000, 'NV003', 'Con', 'images/nhom B/1794538814317_112601018615683622_3100374492545443504_d39bc6c551cf5e16cf35c665eab5ac6c.jpg'),
('MS026', N'Khai Sáng Thời Hiện Đại (Enlightenment Now)', 'B', N'Khoa Học & Nhân Văn', N'Steven Pinker', 2021, N'NXB Khoa Học Và Kỹ Thuật (Alpha Books)', '2025-02-05', 249000, 'NV003', 'Con', 'images/nhom B/1794538814324_112601018615683622_3100374492545443504_2d9c17c1a30f7539204fc23743b5d5e7.jpg'),
('MS027', N'Sapiens: Lược Sử Loài Người', 'B', N'Lịch Sử Nhân Loại', N'Yuval Noah Harari', 2023, N'NXB Tri Thức (Omega+)', '2025-02-06', 215000, 'NV003', 'Con', 'images/nhom B/1794538814330_112601018615683622_3100374492545443504_33d0eef8faf9676d710ea8721e2c6ba0.jpg'),
('MS028', N'Hành Trình Nhân Loại: Nguồn Gốc Của Thịnh Vượng Và Bất Bình Đẳng', 'B', N'Tiến Hóa & Xã Hội', N'Oded Galor', 2023, N'NXB Dân Trí (Omega+)', '2025-02-07', 198000, 'NV003', 'Con', 'images/nhom B/1794538814337_112601018615683622_3100374492545443504_db63ed017d753c0dc0531e50b636e261.jpg'),

('MS029', N'Kinh Tế Học Thời Khó Nhọc (Good Economics for Hard Times)', 'C', N'Kinh Tế Học', N'Abhijit V. Banerjee & Esther Duflo', 2022, N'NXB Trẻ', '2025-02-08', 190000, 'NV003', 'Con', 'images/nhom C/1794538866201_112601018615683622_3100374492545443504_cc6214880c9a1704dbb82a7046d1be02.jpg'),
('MS030', N'Nền Kinh Tế Cảm Ơn (The Thank You Economy)', 'C', N'Kinh Doanh & Quản Trị', N'Gary Vaynerchuk', 2021, N'NXB Trẻ', '2025-02-09', 128000, 'NV003', 'Con', 'images/nhom C/1794538866224_112601018615683622_3100374492545443504_8a978ab03efea923067891c8d63a1787.jpg'),
('MS031', N'How Brands Grow: Con Đường Tăng Trưởng Thương Hiệu (Ứng Dụng)', 'C', N'Marketing & Thương Hiệu', N'Jenni Romaniuk & Byron Sharp', 2023, N'NXB Công Thương (Alpha Books)', '2025-02-10', 179000, 'NV003', 'Con', 'images/nhom C/1794538866240_112601018615683622_3100374492545443504_3ec94841202bd52cfdfc71301425d899.jpg'),
('MS032', N'Vụn Ký Ức', 'C', N'Văn Học Tuổi 20', N'Yang Phan', 2023, N'NXB Trẻ', '2025-02-11', 95000, 'NV003', 'Con', 'images/nhom C/1794538866254_112601018615683622_3100374492545443504_052007e5ce21d530f72bfe8157d3e689.jpg'),
('MS033', N'Đò Dọc', 'C', N'Tiểu Thuyết Việt Nam', N'Bình Nguyên Lộc', 2022, N'NXB Trẻ', '2025-02-12', 112000, 'NV003', 'Con', 'images/nhom C/1794538866267_112601018615683622_3100374492545443504_6cda40bded1cccd6e73d2a62b04d4489.jpg'),
('MS034', N'Giọng Của Phố', 'C', N'Tạp Văn & Bút Ký', N'Nguyễn Việt Hà', 2023, N'NXB Trẻ', '2025-02-12', 105000, 'NV003', 'Con', 'images/nhom C/1794538866279_112601018615683622_3100374492545443504_04c8712da511ed2d416bee6cfbad676b.jpg'),
('MS035', N'Xuân Tình (The Torrents of Spring)', 'C', N'Văn Học Kinh Điển', N'Ernest Hemingway', 2021, N'NXB Trẻ', '2025-02-13', 98000, 'NV003', 'Con', 'images/nhom C/1794538866289_112601018615683622_3100374492545443504_a85a6dce77f0ac0d68ba45fb58d633e4.jpg'),
('MS036', N'Sau Anh (After You)', 'C', N'Văn Học Nước Ngoài', N'Jojo Moyes', 2022, N'NXB Trẻ', '2025-02-14', 138000, 'NV003', 'Con', 'images/nhom C/1794538866297_112601018615683622_3100374492545443504_d08160ea42e2e5019b2f1b5fda949d1d.jpg'),
('MS037', N'Đường Về Nhà (The Way Home)', 'C', N'Kỹ Năng & Tâm Hồn', N'Ben Katt', 2023, N'NXB Công Thương (Thái Hà Books)', '2025-02-15', 118000, 'NV003', 'Con', 'images/nhom C/1794538866305_112601018615683622_3100374492545443504_2c3a7669ae586947738c092a838f79a8.jpg'),
('MS038', N'Phù Phiếm Truyện', 'C', N'Truyện Ngắn Hiện Đại', N'Phan Việt', 2021, N'NXB Trẻ', '2025-02-16', 89000, 'NV003', 'Con', 'images/nhom C/1794538866311_112601018615683622_3100374492545443504_d8dac20aff1ab5dfc6bc03db04eb95d0.jpg'),
('MS039', N'Chín Bỏ Làm Mười', 'C', N'Tiểu Thuyết Đương Đại', N'Trần Chiến', 2022, N'NXB Phụ Nữ', '2025-02-17', 115000, 'NV003', 'Con', 'images/nhom C/1794538866318_112601018615683622_3100374492545443504_7462c3f4d75b2f0533227d0ff0306061.jpg'),
('MS040', N'Cõi Người Mắc Cạn', 'C', N'Văn Học Tuổi 20', N'Hoàng Khánh Duy', 2023, N'NXB Trẻ', '2025-02-18', 86000, 'NV003', 'Con', 'images/nhom C/1794538866325_112601018615683622_3100374492545443504_e23220e907f4909f40ad2410bd736828.jpg'),
('MS041', N'Một Lần Lầm Lỡ', 'C', N'Tiểu Thuyết Tâm Lý', N'Bà Tùng Long', 2022, N'NXB Trẻ', '2025-02-19', 96000, 'NV003', 'Con', 'images/nhom C/1794538866331_112601018615683622_3100374492545443504_c3c18417ee7fe6ddadc06b4c35c775a8.jpg'),
('MS042', N'Đời Con Gái', 'C', N'Tiểu Thuyết Tâm Lý', N'Bà Tùng Long', 2022, N'NXB Trẻ', '2025-02-20', 98000, 'NV003', 'Con', 'images/nhom C/1794538866337_112601018615683622_3100374492545443504_1231b3185b1c9981a632bd533e4860d6.jpg'),
('MS043', N'Chúng Ta Sống Để Bước Tiếp', 'C', N'Tản Văn Truyền Cảm Hứng', N'Nguyễn Phong Việt', 2023, N'NXB Trẻ', '2025-02-21', 110000, 'NV003', 'Con', 'images/nhom C/1794538866343_112601018615683622_3100374492545443504_a7a2c5bb16b05d6e292fb7beeb3114ea.jpg');

-- DỮ LIỆU MẪU PHIẾU MƯỢN SÁCH (BM4 - QĐ4)
INSERT INTO PhieuMuon (MaPhieuMuon, MaDocGia, NgayMuon, HanTra, NguoiChoMuon, GhiChu) VALUES
('PM001', 'DG001', '2026-11-22', '2026-11-26', 'NV002', N'Mượn tài liệu tham khảo học phần Giáo dục học'),
('PM002', 'DG002', '2026-11-10', '2026-11-14', 'NV005', N'Mượn đọc văn học nước ngoài (Đã trả đúng hạn)');

INSERT INTO ChiTietPhieuMuon (MaPhieuMuon, MaSach, TinhTrangMuon, NgayTra) VALUES
('PM001', 'MS003', 'DangMuon', NULL),
('PM001', 'MS023', 'DangMuon', NULL),
('PM002', 'MS036', 'DaTra', '2026-11-13');
GO

-- =================================================================================
-- CÁC CÂU LỆNH TRUY VẤN KIỂM TRA BIỂU MẪU (BM1, BM2, BM3, BM4)
-- =================================================================================
-- 1. Truy vấn BM1 (Hồ sơ Nhân viên):
SELECT MaNV, HoTen, DiaChi, NgaySinh, DienThoai, BangCap, BoPhan, ChucVu FROM NhanVien;

-- 2. Truy vấn BM2 (Thẻ Độc giả kèm Tên Thủ thư lập thẻ):
SELECT dg.MaDocGia, dg.HoTen, dg.LoaiDocGia, dg.NgaySinh, dg.DiaChi, dg.Email, dg.NgayLapThe, dg.NgayHetHan, nv.HoTen AS NguoiLapThe
FROM DocGia dg JOIN NhanVien nv ON dg.NguoiLapThe = nv.MaNV;

-- 3. Truy vấn BM3 (Thông tin Sách kèm Tên Thủ kho tiếp nhận):
SELECT s.MaSach, s.TenSach, s.TheLoai, s.TacGia, s.NamXuatBan, s.NhaXuatBan, s.NgayNhap, s.TriGia, nv.HoTen AS NguoiTiepNhan, s.TinhTrang
FROM Sach s JOIN NhanVien nv ON s.NguoiTiepNhan = nv.MaNV;

-- 4. Truy vấn BM4 (Phiếu Mượn Sách chi tiết: Họ tên độc giả, Ngày mượn, Mã Sách, Tên Sách, Thể Loại, Tác Giả):
SELECT pm.MaPhieuMuon, dg.HoTen AS HoTenDocGia, pm.NgayMuon, pm.HanTra, s.MaSach, s.TenSach, s.TheLoai, s.TacGia, ct.TinhTrangMuon
FROM PhieuMuon pm
JOIN DocGia dg ON pm.MaDocGia = dg.MaDocGia
JOIN ChiTietPhieuMuon ct ON pm.MaPhieuMuon = ct.MaPhieuMuon
JOIN Sach s ON ct.MaSach = s.MaSach;
GO
