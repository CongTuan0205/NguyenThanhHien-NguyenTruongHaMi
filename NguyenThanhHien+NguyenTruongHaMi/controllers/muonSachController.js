const { sql, poolPromise } = require('../models/db');
const dayjs = require('dayjs');

// Hiển thị form BM4 Lập Phiếu Mượn Sách
exports.getBM4 = async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.render('bm4_muonsach', {
                docGias: [],
                sachCons: [],
                phieuMuons: [],
                error: 'Chưa kết nối được CSDL SQL Server!',
                success: null,
                dayjs
            });
        }

        // Lấy danh sách độc giả còn hạn thẻ
        const docGiasRes = await pool.request().query(`
            SELECT MaDocGia, HoTen, LoaiDocGia, NgayHetHan 
            FROM DocGia 
            ORDER BY HoTen
        `);

        // Lấy danh sách sách có trạng thái 'Còn'
        const sachsRes = await pool.request().query(`
            SELECT MaSach, TenSach, TheLoai, TacGia, NamXuatBan, TrangThai 
            FROM Sach 
            WHERE TrangThai = N'Còn'
            ORDER BY TenSach
        `);

        // Lấy các phiếu mượn gần đây
        const phieuMuonsRes = await pool.request().query(`
            SELECT pm.MaPhieuMuon, pm.NgayMuon, pm.HanTra, dg.HoTen AS TenDocGia, dg.LoaiDocGia,
                   COUNT(ct.MaSach) AS SoSachMuon,
                   SUM(CASE WHEN ct.TrangThai = N'Đang mượn' THEN 1 ELSE 0 END) AS SoSachChuaTra
            FROM PhieuMuon pm
            JOIN DocGia dg ON pm.MaDocGia = dg.MaDocGia
            LEFT JOIN ChiTietPhieuMuon ct ON pm.MaPhieuMuon = ct.MaPhieuMuon
            GROUP BY pm.MaPhieuMuon, pm.NgayMuon, pm.HanTra, dg.HoTen, dg.LoaiDocGia
            ORDER BY pm.MaPhieuMuon DESC
        `);

        res.render('bm4_muonsach', {
            docGias: docGiasRes.recordset,
            sachCons: sachsRes.recordset,
            phieuMuons: phieuMuonsRes.recordset,
            error: null,
            success: req.query.success || null,
            dayjs
        });
    } catch (err) {
        console.error('Lỗi tải trang mượn sách:', err);
        res.render('bm4_muonsach', {
            docGias: [],
            sachCons: [],
            phieuMuons: [],
            error: 'Lỗi: ' + err.message,
            success: null,
            dayjs
        });
    }
};

// Xử lý tạo Phiếu Mượn Sách (BM4 & QĐ4)
exports.postBM4 = async (req, res) => {
    let { maDocGia, ngayMuon, maSach, hanTra, ngayTra } = req.body;

    try {
        const pool = await poolPromise;
        if (!pool) return res.status(500).send('CSDL SQL Server chưa sẵn sàng!');

        // Chuẩn hóa danh sách mã sách (có thể là string đơn hoặc mảng)
        let danhSachMaSach = [];
        if (Array.isArray(maSach)) {
            danhSachMaSach = maSach.map(id => parseInt(id, 10));
        } else if (maSach) {
            danhSachMaSach = [parseInt(maSach, 10)];
        }

        const reloadWithError = async (msg) => {
            const docGiasRes = await pool.request().query(`SELECT MaDocGia, HoTen, LoaiDocGia, NgayHetHan FROM DocGia ORDER BY HoTen`);
            const sachsRes = await pool.request().query(`SELECT MaSach, TenSach, TheLoai, TacGia, NamXuatBan, TrangThai FROM Sach WHERE TrangThai = N'Còn' ORDER BY TenSach`);
            const phieuMuonsRes = await pool.request().query(`
                SELECT pm.MaPhieuMuon, pm.NgayMuon, pm.HanTra, dg.HoTen AS TenDocGia, dg.LoaiDocGia,
                       COUNT(ct.MaSach) AS SoSachMuon,
                       SUM(CASE WHEN ct.TrangThai = N'Đang mượn' THEN 1 ELSE 0 END) AS SoSachChuaTra
                FROM PhieuMuon pm
                JOIN DocGia dg ON pm.MaDocGia = dg.MaDocGia
                LEFT JOIN ChiTietPhieuMuon ct ON pm.MaPhieuMuon = ct.MaPhieuMuon
                GROUP BY pm.MaPhieuMuon, pm.NgayMuon, pm.HanTra, dg.HoTen, dg.LoaiDocGia
                ORDER BY pm.MaPhieuMuon DESC
            `);
            return res.render('bm4_muonsach', {
                docGias: docGiasRes.recordset,
                sachCons: sachsRes.recordset,
                phieuMuons: phieuMuonsRes.recordset,
                error: msg,
                success: null,
                dayjs
            });
        };

        if (!maDocGia || !ngayMuon || danhSachMaSach.length === 0) {
            return reloadWithError('Vui lòng chọn độc giả, ngày mượn và ít nhất 1 quyển sách!');
        }

        const dNgayMuon = dayjs(ngayMuon);

        // --- 1. QĐ4: CHỈ CHO MƯỢN VỚI THẺ CÒN HẠN ---
        const dgRes = await pool.request()
            .input('MaDocGia', sql.Int, maDocGia)
            .query('SELECT HoTen, NgayHetHan FROM DocGia WHERE MaDocGia = @MaDocGia');

        if (dgRes.recordset.length === 0) {
            return reloadWithError('Không tìm thấy thông tin độc giả!');
        }

        const docGia = dgRes.recordset[0];
        const dNgayHetHan = dayjs(docGia.NgayHetHan);
        if (dNgayMuon.isAfter(dNgayHetHan, 'day')) {
            return reloadWithError(`QĐ4: Thẻ độc giả "${docGia.HoTen}" đã hết hạn vào ngày ${dNgayHetHan.format('DD/MM/YYYY')}! Không được phép mượn.`);
        }

        // --- 2. QĐ4: KHÔNG CÓ SÁCH MƯỢN QUÁ HẠN ---
        // Sách quá hạn là sách thuộc các phiếu mượn trước đó, có TrangThai = 'Đang mượn' và HanTra < NgayMuon
        const overdueRes = await pool.request()
            .input('MaDocGia', sql.Int, maDocGia)
            .input('NgayMuon', sql.Date, ngayMuon)
            .query(`
                SELECT pm.MaPhieuMuon, pm.HanTra, s.TenSach 
                FROM PhieuMuon pm
                JOIN ChiTietPhieuMuon ct ON pm.MaPhieuMuon = ct.MaPhieuMuon
                JOIN Sach s ON ct.MaSach = s.MaSach
                WHERE pm.MaDocGia = @MaDocGia 
                  AND ct.TrangThai = N'Đang mượn' 
                  AND pm.HanTra < @NgayMuon
            `);

        if (overdueRes.recordset.length > 0) {
            const sachTre = overdueRes.recordset.map(r => `"${r.TenSach}" (Hạn trả: ${dayjs(r.HanTra).format('DD/MM/YYYY')})`).join(', ');
            return reloadWithError(`QĐ4: Độc giả đang có sách mượn QUÁ HẠN chưa trả (${sachTre})! Bắt buộc phải trả sách quá hạn trước khi mượn tiếp.`);
        }

        // --- 3. QĐ4: MỖI ĐỘC GIẢ MƯỢN TỐI ĐA 5 QUYỂN SÁCH ---
        const currentCountRes = await pool.request()
            .input('MaDocGia', sql.Int, maDocGia)
            .query(`
                SELECT COUNT(*) AS SoLuongDangGiu 
                FROM PhieuMuon pm
                JOIN ChiTietPhieuMuon ct ON pm.MaPhieuMuon = ct.MaPhieuMuon
                WHERE pm.MaDocGia = @MaDocGia AND ct.TrangThai = N'Đang mượn'
            `);

        const dangGiu = currentCountRes.recordset[0].SoLuongDangGiu;
        const muonThem = danhSachMaSach.length;

        if (dangGiu + muonThem > 5) {
            return reloadWithError(`QĐ4: Mỗi độc giả chỉ mượn TỐI ĐA 5 quyển sách! Độc giả đang giữ ${dangGiu} quyển, định mượn thêm ${muonThem} quyển (Tổng: ${dangGiu + muonThem} > 5).`);
        }

        // --- 4. QĐ4: SÁCH KHÔNG CÓ NGƯỜI ĐANG MƯỢN ---
        for (let ms of danhSachMaSach) {
            const sCheck = await pool.request()
                .input('MaSach', sql.Int, ms)
                .query('SELECT TenSach, TrangThai FROM Sach WHERE MaSach = @MaSach');

            if (sCheck.recordset.length === 0 || sCheck.recordset[0].TrangThai !== 'Còn') {
                return reloadWithError(`QĐ4: Cuốn sách "${sCheck.recordset[0]?.TenSach || ms}" hiện đang có người mượn hoặc không sẵn sàng!`);
            }
        }

        // --- 5. QĐ4 & Đăng ký ngày hẹn trả ---
        const dHanTra = (hanTra || ngayTra) ? dayjs(hanTra || ngayTra).format('YYYY-MM-DD') : dNgayMuon.add(4, 'day').format('YYYY-MM-DD');

        // BẮT ĐẦU TRANSACTION LƯU DỮ LIỆU
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const insertPM = new sql.Request(transaction);
            const pmResult = await insertPM
                .input('MaDocGia', sql.Int, maDocGia)
                .input('NgayMuon', sql.Date, ngayMuon)
                .input('HanTra', sql.Date, dHanTra)
                .query(`
                    INSERT INTO PhieuMuon (MaDocGia, NgayMuon, HanTra)
                    OUTPUT INSERTED.MaPhieuMuon
                    VALUES (@MaDocGia, @NgayMuon, @HanTra)
                `);

            const maPhieuMuon = pmResult.recordset[0].MaPhieuMuon;

            for (let ms of danhSachMaSach) {
                // Thêm chi tiết phiếu mượn
                const insertCT = new sql.Request(transaction);
                await insertCT
                    .input('MaPhieuMuon', sql.Int, maPhieuMuon)
                    .input('MaSach', sql.Int, ms)
                    .query(`
                        INSERT INTO ChiTietPhieuMuon (MaPhieuMuon, MaSach, TrangThai)
                        VALUES (@MaPhieuMuon, @MaSach, N'Đang mượn')
                    `);

                // Cập nhật trạng thái sách thành 'Đang mượn'
                const updateSach = new sql.Request(transaction);
                await updateSach
                    .input('MaSach', sql.Int, ms)
                    .query(`UPDATE Sach SET TrangThai = N'Đang mượn' WHERE MaSach = @MaSach`);
            }

            await transaction.commit();
            res.redirect(`/muon-sach?success=Lập phiếu mượn số #${maPhieuMuon} thành công! Hạn trả là 4 ngày (${dayjs(dHanTra).format('DD/MM/YYYY')}).`);
        } catch (txErr) {
            await transaction.rollback();
            throw txErr;
        }

    } catch (err) {
        console.error('Lỗi cho mượn sách:', err);
        res.status(500).send('Lỗi máy chủ khi cho mượn sách: ' + err.message);
    }
};

// Hiển thị danh sách trả sách / Chi tiết phiếu mượn
exports.getTraSach = async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) return res.render('tra_sach', { danhSachMuon: [], error: 'CSDL chưa kết nối!', success: null, dayjs });

        const result = await pool.request().query(`
            SELECT pm.MaPhieuMuon, pm.NgayMuon, pm.HanTra,
                   dg.HoTen AS TenDocGia, dg.Email,
                   s.MaSach, s.TenSach, s.TheLoai, s.TacGia,
                   ct.NgayTra, ct.TrangThai
            FROM ChiTietPhieuMuon ct
            JOIN PhieuMuon pm ON ct.MaPhieuMuon = pm.MaPhieuMuon
            JOIN DocGia dg ON pm.MaDocGia = dg.MaDocGia
            JOIN Sach s ON ct.MaSach = s.MaSach
            ORDER BY ct.TrangThai DESC, pm.HanTra ASC
        `);

        res.render('tra_sach', {
            danhSachMuon: result.recordset,
            error: null,
            success: req.query.success || null,
            dayjs
        });
    } catch (err) {
        console.error('Lỗi tải danh sách trả sách:', err);
        res.render('tra_sach', { danhSachMuon: [], error: err.message, success: null, dayjs });
    }
};

// Xử lý trả sách
exports.postTraSach = async (req, res) => {
    const { maPhieuMuon, maSach } = req.body;

    try {
        const pool = await poolPromise;
        if (!pool) return res.status(500).send('CSDL chưa kết nối!');

        const ngayTra = dayjs().format('YYYY-MM-DD');

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Cập nhật chi tiết phiếu mượn
            const reqCT = new sql.Request(transaction);
            await reqCT
                .input('MaPhieuMuon', sql.Int, maPhieuMuon)
                .input('MaSach', sql.Int, maSach)
                .input('NgayTra', sql.Date, ngayTra)
                .query(`
                    UPDATE ChiTietPhieuMuon 
                    SET TrangThai = N'Đã trả', NgayTra = @NgayTra 
                    WHERE MaPhieuMuon = @MaPhieuMuon AND MaSach = @MaSach
                `);

            // Giải phóng trạng thái sách
            const reqSach = new sql.Request(transaction);
            await reqSach
                .input('MaSach', sql.Int, maSach)
                .query(`UPDATE Sach SET TrangThai = N'Còn' WHERE MaSach = @MaSach`);

            await transaction.commit();
            res.redirect('/tra-sach?success=Đã trả sách thành công và cập nhật lại trạng thái sách vào kho!');
        } catch (txErr) {
            await transaction.rollback();
            throw txErr;
        }

    } catch (err) {
        console.error('Lỗi trả sách:', err);
        res.status(500).send('Lỗi máy chủ khi trả sách: ' + err.message);
    }
};
