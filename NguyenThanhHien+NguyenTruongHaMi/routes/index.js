const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const nhanVienController = require('../controllers/nhanVienController');
const docGiaController = require('../controllers/docGiaController');
const sachController = require('../controllers/sachController');
const muonSachController = require('../controllers/muonSachController');

// 1. Dashboard
router.get('/', dashboardController.getDashboard);

// 2. BM1: Hồ sơ nhân viên & QĐ1
router.get('/nhan-vien', nhanVienController.getBM1);
router.post('/nhan-vien', nhanVienController.postBM1);

// 3. BM2: Thẻ độc giả & QĐ2
router.get('/doc-gia', docGiaController.getBM2);
router.post('/doc-gia', docGiaController.postBM2);

// 4. BM3: Tiếp nhận sách & QĐ3
router.get('/sach', sachController.getBM3);
router.post('/sach', sachController.postBM3);

// 5. BM4: Mượn sách & QĐ4
router.get('/muon-sach', muonSachController.getBM4);
router.post('/muon-sach', muonSachController.postBM4);

// 6. Quản lý trả sách (Hoàn thiện quy trình mượn - trả)
router.get('/tra-sach', muonSachController.getTraSach);
router.post('/tra-sach', muonSachController.postTraSach);

module.exports = router;
