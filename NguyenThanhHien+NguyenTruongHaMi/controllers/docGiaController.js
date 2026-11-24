const { sql, poolPromise } = require('../models/db');
const dayjs = require('dayjs');

exports.getBM2 = async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.render('bm2_docgia', {
                docGias: [],
                thuThus: [],
                error: 'Chưa kết nối được CSDL SQL Server!',
                success: null,
                dayjs
            });
        }

        // Lấy danh sách độc giả kèm tên người lập thẻ
        const docGiasRes = await pool.request().query(`
            SELECT dg.*, nv.HoTen AS TenNguoiLap, nv.BoPhan 
            FROM DocGia dg
            JOIN NhanVien nv ON dg.MaNVLap = nv.MaNV
            ORDER BY dg.MaDocGia DESC
        `);

        // Lấy danh sách nhân viên để chọn người lập (hiển thị rõ bộ phận để test QĐ2)
        const nhanViensRes = await pool.request().query(`
            SELECT MaNV, HoTen, BoPhan, ChucVu 
            FROM NhanVien 
            ORDER BY BoPhan, HoTen
        `);

        res.render('bm2_docgia', {
            docGias: docGiasRes.recordset,
            nhanViens: nhanViensRes.recordset,
            error: null,
            success: req.query.success || null,
            dayjs
        });
    } catch (err) {
        console.error('Lỗi lấy danh sách độc giả:', err);
        res.render('bm2_docgia', {
            docGias: [],
            nhanViens: [],
            error: 'Lỗi: ' + err.message,
            success: null,
            dayjs
        });
    }
};

exports.postBM2 = async (req, res) => {
    const { hoTen, loaiDocGia, ngaySinh, diaChi, email, ngayLapThe, maNVLap } = req.body;

    try {
        const pool = await poolPromise;
        if (!pool) return res.status(500).send('CSDL SQL Server chưa sẵn sàng!');

        // Helper tải lại trang kèm thông báo lỗi
        const reloadWithError = async (msg) => {
            const docGiasRes = await pool.request().query(`
                SELECT dg.*, nv.HoTen AS TenNguoiLap, nv.BoPhan 
                FROM DocGia dg
                JOIN NhanVien nv ON dg.MaNVLap = nv.MaNV
                ORDER BY dg.MaDocGia DESC
            `);
            const nhanViensRes = await pool.request().query(`
                SELECT MaNV, HoTen, BoPhan, ChucVu FROM NhanVien ORDER BY BoPhan, HoTen
            `);
            return res.render('bm2_docgia', {
                docGias: docGiasRes.recordset,
                nhanViens: nhanViensRes.recordset,
                error: msg,
                success: null,
                dayjs
            });
        };

        // 1. Kiểm tra trường rỗng
        if (!hoTen || !loaiDocGia || !ngaySinh || !ngayLapThe || !maNVLap) {
            return reloadWithError('Vui lòng nhập đầy đủ các trường bắt buộc của Thẻ độc giả!');
        }

        // 2. QĐ2: Có 2 loại độc giả (X, Y)
        if (!['X', 'Y'].includes(loaiDocGia)) {
            return reloadWithError('QĐ2: Loại độc giả chỉ được là X hoặc Y!');
        }

        // Kiểm tra cấu trúc Email @gmail.com
        if (email && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim())) {
            return reloadWithError('Email bắt buộc phải có cấu trúc @gmail.com (Ví dụ: nguyenvana@gmail.com)!');
        }

        // 3. QĐ2: Tuổi độc giả từ 18 đến 55
        const dNgaySinh = dayjs(ngaySinh);
        const dNgayLap = dayjs(ngayLapThe);
        const age = dNgayLap.diff(dNgaySinh, 'year');

        if (age < 18 || age > 55) {
            return reloadWithError(`QĐ2: Tuổi độc giả phải từ 18 đến 55 tuổi (Tuổi hiện tại tính tại ngày lập thẻ: ${age} tuổi)!`);
        }

        // 4. QĐ2: Người lập thẻ độc giả phải là nhân viên thuộc bộ phận Thủ Thư
        const nvCheck = await pool.request()
            .input('MaNV', sql.Int, maNVLap)
            .query('SELECT HoTen, BoPhan FROM NhanVien WHERE MaNV = @MaNV');

        if (nvCheck.recordset.length === 0) {
            return reloadWithError('Không tìm thấy nhân viên lập thẻ!');
        }

        const nv = nvCheck.recordset[0];
        if (nv.BoPhan !== 'Thủ Thư') {
            return reloadWithError(`QĐ2: Người lập thẻ phải thuộc bộ phận Thủ Thư! (Nhân viên "${nv.HoTen}" thuộc bộ phận "${nv.BoPhan}")`);
        }

        // 5. QĐ2: Thẻ có giá trị đúng 6 tháng
        const ngayHetHan = dNgayLap.add(6, 'month').format('YYYY-MM-DD');

        // Lưu vào CSDL
        await pool.request()
            .input('HoTen', sql.NVarChar(100), hoTen.trim())
            .input('LoaiDocGia', sql.VarChar(5), loaiDocGia)
            .input('NgaySinh', sql.Date, ngaySinh)
            .input('DiaChi', sql.NVarChar(255), diaChi || '')
            .input('Email', sql.VarChar(100), email || '')
            .input('NgayLapThe', sql.Date, ngayLapThe)
            .input('NgayHetHan', sql.Date, ngayHetHan)
            .input('MaNVLap', sql.Int, maNVLap)
            .query(`
                INSERT INTO DocGia (HoTen, LoaiDocGia, NgaySinh, DiaChi, Email, NgayLapThe, NgayHetHan, MaNVLap)
                VALUES (@HoTen, @LoaiDocGia, @NgaySinh, @DiaChi, @Email, @NgayLapThe, @NgayHetHan, @MaNVLap)
            `);

        res.redirect('/doc-gia?success=Lập thẻ độc giả thành công! Thẻ có hạn đến ' + dayjs(ngayHetHan).format('DD/MM/YYYY'));
    } catch (err) {
        console.error('Lỗi lập thẻ độc giả:', err);
        res.status(500).send('Lỗi máy chủ khi lập thẻ độc giả: ' + err.message);
    }
};
