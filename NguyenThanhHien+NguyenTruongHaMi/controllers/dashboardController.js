const { sql, poolPromise } = require('../models/db');
const dayjs = require('dayjs');

exports.getDashboard = async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.render('index', {
                stats: { tongNV: 0, tongDG: 0, tongSach: 0, dangMuon: 0, quaHan: 0 },
                overdueList: [],
                recentBorrows: [],
                error: 'Chưa kết nối được CSDL SQL Server! Vui lòng chạy file database/schema.sql và cấu hình file .env',
                dayjs
            });
        }

        const today = dayjs().format('YYYY-MM-DD');

        // Thống kê số lượng
        const nvCount = await pool.request().query('SELECT COUNT(*) AS count FROM NhanVien');
        const dgCount = await pool.request().query('SELECT COUNT(*) AS count FROM DocGia');
        const sachCount = await pool.request().query('SELECT COUNT(*) AS count FROM Sach');
        const borrowingCount = await pool.request().query("SELECT COUNT(*) AS count FROM ChiTietPhieuMuon WHERE TrangThai = N'Đang mượn'");
        
        // Sách quá hạn
        const overdueCount = await pool.request()
            .input('Today', sql.Date, today)
            .query(`
                SELECT COUNT(*) AS count 
                FROM ChiTietPhieuMuon ct
                JOIN PhieuMuon pm ON ct.MaPhieuMuon = pm.MaPhieuMuon
                WHERE ct.TrangThai = N'Đang mượn' AND pm.HanTra < @Today
            `);

        // Danh sách sách quá hạn để cảnh báo trên Dashboard
        const overdueListRes = await pool.request()
            .input('Today', sql.Date, today)
            .query(`
                SELECT pm.MaPhieuMuon, pm.HanTra, dg.HoTen AS TenDocGia, dg.Email, s.TenSach, s.MaSach
                FROM ChiTietPhieuMuon ct
                JOIN PhieuMuon pm ON ct.MaPhieuMuon = pm.MaPhieuMuon
                JOIN DocGia dg ON pm.MaDocGia = dg.MaDocGia
                JOIN Sach s ON ct.MaSach = s.MaSach
                WHERE ct.TrangThai = N'Đang mượn' AND pm.HanTra < @Today
                ORDER BY pm.HanTra ASC
            `);

        // Phiếu mượn mới nhất
        const recentBorrowsRes = await pool.request().query(`
            SELECT TOP 5 pm.MaPhieuMuon, pm.NgayMuon, pm.HanTra, dg.HoTen AS TenDocGia,
                   COUNT(ct.MaSach) AS SoSach
            FROM PhieuMuon pm
            JOIN DocGia dg ON pm.MaDocGia = dg.MaDocGia
            LEFT JOIN ChiTietPhieuMuon ct ON pm.MaPhieuMuon = ct.MaPhieuMuon
            GROUP BY pm.MaPhieuMuon, pm.NgayMuon, pm.HanTra, dg.HoTen
            ORDER BY pm.MaPhieuMuon DESC
        `);

        res.render('index', {
            stats: {
                tongNV: nvCount.recordset[0].count,
                tongDG: dgCount.recordset[0].count,
                tongSach: sachCount.recordset[0].count,
                dangMuon: borrowingCount.recordset[0].count,
                quaHan: overdueCount.recordset[0].count
            },
            overdueList: overdueListRes.recordset,
            recentBorrows: recentBorrowsRes.recordset,
            error: null,
            dayjs
        });
    } catch (err) {
        console.error('Lỗi dashboard:', err);
        res.render('index', {
            stats: { tongNV: 0, tongDG: 0, tongSach: 0, dangMuon: 0, quaHan: 0 },
            overdueList: [],
            recentBorrows: [],
            error: 'Lỗi máy chủ: ' + err.message,
            dayjs
        });
    }
};
