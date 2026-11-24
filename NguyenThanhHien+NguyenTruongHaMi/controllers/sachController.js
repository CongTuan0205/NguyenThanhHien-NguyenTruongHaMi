const { sql, poolPromise } = require('../models/db');
const dayjs = require('dayjs');

exports.getBM3 = async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.render('bm3_nhapsach', {
                sachs: [],
                nhanViens: [],
                error: 'Chưa kết nối được CSDL SQL Server!',
                success: null,
                dayjs
            });
        }

        const sachsRes = await pool.request().query(`
            SELECT s.*, nv.HoTen AS TenNguoiNhan, nv.BoPhan 
            FROM Sach s
            JOIN NhanVien nv ON s.MaNVTiepNhan = nv.MaNV
            ORDER BY s.MaSach DESC
        `);

        const nhanViensRes = await pool.request().query(`
            SELECT MaNV, HoTen, BoPhan, ChucVu 
            FROM NhanVien 
            ORDER BY BoPhan, HoTen
        `);

        res.render('bm3_nhapsach', {
            sachs: sachsRes.recordset,
            nhanViens: nhanViensRes.recordset,
            error: null,
            success: req.query.success || null,
            dayjs
        });
    } catch (err) {
        console.error('Lỗi lấy danh sách sách:', err);
        res.render('bm3_nhapsach', {
            sachs: [],
            nhanViens: [],
            error: 'Lỗi: ' + err.message,
            success: null,
            dayjs
        });
    }
};

exports.postBM3 = async (req, res) => {
    const { tenSach, theLoai, tacGia, namXuatBan, nhaXuatBan, ngayNhap, triGia, maNVTiepNhan } = req.body;

    try {
        const pool = await poolPromise;
        if (!pool) return res.status(500).send('CSDL SQL Server chưa sẵn sàng!');

        const reloadWithError = async (msg) => {
            const sachsRes = await pool.request().query(`
                SELECT s.*, nv.HoTen AS TenNguoiNhan, nv.BoPhan 
                FROM Sach s
                JOIN NhanVien nv ON s.MaNVTiepNhan = nv.MaNV
                ORDER BY s.MaSach DESC
            `);
            const nhanViensRes = await pool.request().query(`
                SELECT MaNV, HoTen, BoPhan, ChucVu FROM NhanVien ORDER BY BoPhan, HoTen
            `);
            return res.render('bm3_nhapsach', {
                sachs: sachsRes.recordset,
                nhanViens: nhanViensRes.recordset,
                error: msg,
                success: null,
                dayjs
            });
        };

        // 1. Kiểm tra trường bắt buộc
        if (!tenSach || !theLoai || !tacGia || !namXuatBan || !ngayNhap || !triGia || !maNVTiepNhan) {
            return reloadWithError('Vui lòng nhập đầy đủ các trường thông tin sách!');
        }

        // 2. QĐ3: Có 3 thể loại (A, B, C)
        if (!['A', 'B', 'C'].includes(theLoai)) {
            return reloadWithError('QĐ3: Thể loại sách chỉ được là A, B hoặc C!');
        }

        // 3. QĐ3: Chỉ nhận các sách xuất bản trong vòng 8 năm
        const namNhap = dayjs(ngayNhap).year();
        const nxb = parseInt(namXuatBan, 10);
        if (nxb > namNhap) {
            return reloadWithError(`Năm xuất bản (${nxb}) không được lớn hơn năm tiếp nhận (${namNhap})!`);
        }
        if (namNhap - nxb > 8) {
            return reloadWithError(`QĐ3: Chỉ nhận sách xuất bản trong vòng 8 năm! (Sách XB năm ${nxb}, tính đến năm tiếp nhận ${namNhap} đã quá ${namNhap - nxb} năm)`);
        }

        // 4. QĐ3: Người nhận sách phải là nhân viên thuộc bộ phận Thủ Kho
        const nvCheck = await pool.request()
            .input('MaNV', sql.Int, maNVTiepNhan)
            .query('SELECT HoTen, BoPhan FROM NhanVien WHERE MaNV = @MaNV');

        if (nvCheck.recordset.length === 0) {
            return reloadWithError('Không tìm thấy nhân viên tiếp nhận!');
        }

        const nv = nvCheck.recordset[0];
        if (nv.BoPhan !== 'Thủ Kho') {
            return reloadWithError(`QĐ3: Người nhận sách phải là nhân viên thuộc bộ phận Thủ Kho! (Nhân viên "${nv.HoTen}" thuộc bộ phận "${nv.BoPhan}")`);
        }

        // Lưu vào CSDL
        await pool.request()
            .input('TenSach', sql.NVarChar(255), tenSach.trim())
            .input('TheLoai', sql.VarChar(5), theLoai)
            .input('TacGia', sql.NVarChar(150), tacGia.trim())
            .input('NamXuatBan', sql.Int, nxb)
            .input('NhaXuatBan', sql.NVarChar(150), nhaXuatBan || '')
            .input('NgayNhap', sql.Date, ngayNhap)
            .input('TriGia', sql.Decimal(18, 0), triGia)
            .input('MaNVTiepNhan', sql.Int, maNVTiepNhan)
            .query(`
                INSERT INTO Sach (TenSach, TheLoai, TacGia, NamXuatBan, NhaXuatBan, NgayNhap, TriGia, MaNVTiepNhan, TrangThai)
                VALUES (@TenSach, @TheLoai, @TacGia, @NamXuatBan, @NhaXuatBan, @NgayNhap, @TriGia, @MaNVTiepNhan, N'Còn')
            `);

        res.redirect('/sach?success=Tiếp nhận sách mới thành công (Theo BM3 - QĐ3)!');
    } catch (err) {
        console.error('Lỗi tiếp nhận sách:', err);
        res.status(500).send('Lỗi máy chủ khi tiếp nhận sách: ' + err.message);
    }
};
