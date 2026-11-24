const { sql, poolPromise } = require('../models/db');
const dayjs = require('dayjs');

// Danh mục chuẩn theo QĐ1
const DANH_MUC = {
    bangCap: ['Tú Tài', 'Trung Cấp', 'Cao Đẳng', 'Đại Học', 'Thạc Sĩ', 'Tiến Sĩ'],
    boPhan: ['Thủ Thư', 'Thủ Kho', 'Thủ Quỹ', 'Ban Giám Đốc'],
    chucVu: ['Giám Đốc', 'Phó Giám Đốc', 'Trưởng Phòng', 'Phó Phòng', 'Nhân Viên']
};

exports.getBM1 = async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.render('bm1_nhanvien', {
                danhMuc: DANH_MUC,
                nhanViens: [],
                error: 'Chưa kết nối được CSDL SQL Server! Vui lòng kiểm tra lại cấu hình .env',
                success: null,
                dayjs
            });
        }

        const result = await pool.request().query('SELECT * FROM NhanVien ORDER BY MaNV DESC');
        res.render('bm1_nhanvien', {
            danhMuc: DANH_MUC,
            nhanViens: result.recordset,
            error: null,
            success: req.query.success || null,
            dayjs
        });
    } catch (err) {
        console.error('Lỗi lấy danh sách nhân viên:', err);
        res.render('bm1_nhanvien', {
            danhMuc: DANH_MUC,
            nhanViens: [],
            error: 'Lỗi máy chủ: ' + err.message,
            success: null,
            dayjs
        });
    }
};

exports.postBM1 = async (req, res) => {
    const { hoTen, ngaySinh, diaChi, dienThoai, bangCap, boPhan, chucVu } = req.body;

    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).send('CSDL SQL Server chưa sẵn sàng!');
        }

        // --- VALIDATION THEO QĐ1 ---
        if (!hoTen || !ngaySinh || !bangCap || !boPhan || !chucVu) {
            const list = await pool.request().query('SELECT * FROM NhanVien ORDER BY MaNV DESC');
            return res.render('bm1_nhanvien', {
                danhMuc: DANH_MUC,
                nhanViens: list.recordset,
                error: 'Vui lòng điền đầy đủ các trường bắt buộc!',
                success: null,
                dayjs
            });
        }

        if (!DANH_MUC.bangCap.includes(bangCap)) {
            const list = await pool.request().query('SELECT * FROM NhanVien ORDER BY MaNV DESC');
            return res.render('bm1_nhanvien', {
                danhMuc: DANH_MUC,
                nhanViens: list.recordset,
                error: 'QĐ1: Bằng cấp không hợp lệ! Chỉ chấp nhận: ' + DANH_MUC.bangCap.join(', '),
                success: null,
                dayjs
            });
        }

        if (!DANH_MUC.boPhan.includes(boPhan)) {
            const list = await pool.request().query('SELECT * FROM NhanVien ORDER BY MaNV DESC');
            return res.render('bm1_nhanvien', {
                danhMuc: DANH_MUC,
                nhanViens: list.recordset,
                error: 'QĐ1: Bộ phận không hợp lệ! Chỉ gồm: ' + DANH_MUC.boPhan.join(', '),
                success: null,
                dayjs
            });
        }

        if (!DANH_MUC.chucVu.includes(chucVu)) {
            const list = await pool.request().query('SELECT * FROM NhanVien ORDER BY MaNV DESC');
            return res.render('bm1_nhanvien', {
                danhMuc: DANH_MUC,
                nhanViens: list.recordset,
                error: 'QĐ1: Chức vụ không hợp lệ! Chỉ gồm: ' + DANH_MUC.chucVu.join(', '),
                success: null,
                dayjs
            });
        }

        await pool.request()
            .input('HoTen', sql.NVarChar(100), hoTen.trim())
            .input('NgaySinh', sql.Date, ngaySinh)
            .input('DiaChi', sql.NVarChar(255), diaChi || '')
            .input('DienThoai', sql.VarChar(20), dienThoai || '')
            .input('BangCap', sql.NVarChar(50), bangCap)
            .input('BoPhan', sql.NVarChar(50), boPhan)
            .input('ChucVu', sql.NVarChar(50), chucVu)
            .query(`
                INSERT INTO NhanVien (HoTen, NgaySinh, DiaChi, DienThoai, BangCap, BoPhan, ChucVu)
                VALUES (@HoTen, @NgaySinh, @DiaChi, @DienThoai, @BangCap, @BoPhan, @ChucVu)
            `);

        res.redirect('/nhan-vien?success=Tiếp nhận nhân viên thành công (Theo BM1 - QĐ1)!');
    } catch (err) {
        console.error('Lỗi thêm nhân viên:', err);
        res.status(500).send('Lỗi máy chủ khi tiếp nhận nhân viên: ' + err.message);
    }
};
