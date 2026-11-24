// =========================================================================
// HỆ THỐNG QUẢN LÝ THƯ VIỆN SỐ (THE TH LIBRARY - OPAC & INTERNAL ADMIN ERP)
// Thiết kế chuẩn nghiệp vụ thực tế & tuân thủ 100% Quy định CNPM (BM1..BM6, QĐ1..QĐ5)
// =========================================================================

const STORAGE_KEY = 'QLTV_CNPM_REAL_V5';
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

function generateNextId(list, keyField, prefix) {
  const maxNum = (list || []).reduce((max, item) => {
    const num = parseInt(String(item[keyField] || '').replace(prefix, ''), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);
  return prefix + String(maxNum + 1).padStart(3, '0');
}

// Trạng thái phiên làm việc
let currentPortal = 'public'; // 'public' | 'admin-login' | 'admin'
let currentPublicPage = 'home'; // 'home' | 'catalog' | 'register-card' | 'rules' | 'reader-profile'
let currentAdminTab = 'dashboard'; // 'dashboard' | 'bm4' | 'return' | 'bm3' | 'bm2' | 'bm1' | 'bm5-bm6' | 'qd5'

// Bộ lọc trang Tra cứu OPAC
let selectedCategory = 'ALL'; // 'ALL' | 'A' | 'B' | 'C'
let selectedStatusFilter = 'ALL'; // 'ALL' | 'Con' | 'DangMuon'
let selectedSort = 'default';
let searchQuery = '';
let selectedPlanId = 'GOI_6THANG';

// Phiên đăng nhập thực tế (Không tự động chọn hộ hay lộ danh sách thẻ của người khác)
let currentReader = null; // Đối tượng độc giả đang đăng nhập
let currentAdmin = null;  // Đối tượng cán bộ nhân viên đang đăng nhập
let borrowCart = [];      // Danh sách mã sách độc giả chọn mượn

// Khởi tạo CSDL mặc định chuẩn CNPM
function getInitialDatabase() {
  return {
    version: window.LIBRARY_DATA_VERSION || '2026.43BOOKS.V2',
    thamSo: {
      TuoiToiThieu: 18,
      TuoiToiDa: 55,
      ThoiHanTheThang: 6,
      KhoangCachNamXB: 8,
      SoSachMuonToiDa: 5,
      SoNgayMuonToiDa: 4,
      PhiTheThang: 15000,
      PhiThe6Thang: 50000,
      PhiTheNam: 100000
    },
    nhanVien: [
      { maNV: 'NV001', taiKhoan: 'admin', matKhau: 'admin123', hoTen: 'Nguyễn Minh Hoàng', diaChi: '12 Lê Duẩn, Quận 1, TP.HCM', ngaySinh: '1988-05-14', dienThoai: '0901234567', bangCap: 'Thạc sĩ', boPhan: 'Ban Giám Đốc', chucVu: 'Giám Đốc', email: 'hoangnm@gmail.com' },
      { maNV: 'NV002', taiKhoan: 'thuthu', matKhau: '123456', hoTen: 'Trần Thị Thu Hà', diaChi: '45 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', ngaySinh: '1995-08-20', dienThoai: '0912345678', bangCap: 'Đại học', boPhan: 'Thủ Thư', chucVu: 'Nhân Viên', email: 'hattt@gmail.com' },
      { maNV: 'NV003', taiKhoan: 'thukho', matKhau: '123456', hoTen: 'Lê Quốc Bảo', diaChi: '88 Võ Văn Ngân, TP. Thủ Đức', ngaySinh: '1993-11-02', dienThoai: '0923456789', bangCap: 'Đại học', boPhan: 'Thủ Kho', chucVu: 'Trưởng Phòng', email: 'baolq@gmail.com' },
      { maNV: 'NV004', taiKhoan: 'thuquy', matKhau: '123456', hoTen: 'Phạm Hoàng Yến', diaChi: '210 Cách Mạng Tháng 8, Quận 10, TP.HCM', ngaySinh: '1997-02-18', dienThoai: '0934567890', bangCap: 'Cao đẳng', boPhan: 'Thủ Quỹ', chucVu: 'Nhân Viên', email: 'yenph@gmail.com' },
      { maNV: 'NV005', taiKhoan: 'kietvv', matKhau: '123456', hoTen: 'Võ Văn Kiệt', diaChi: '19 Lý Thường Kiệt, Quận Tân Bình, TP.HCM', ngaySinh: '1996-07-12', dienThoai: '0945678901', bangCap: 'Đại học', boPhan: 'Thủ Thư', chucVu: 'Phó Phòng', email: 'kietvv@gmail.com' }
    ],
    docGia: [
      {
        maDocGia: 'DG001',
        hoTen: 'Nguyễn Văn An',
        loaiDocGia: 'X',
        ngaySinh: '2003-04-15',
        diaChi: '125 Nguyễn Văn Cừ, Phường 2, Quận 5, TP.HCM',
        email: 'nguyenvanan@gmail.com',
        matKhau: '123456',
        ngayLapThe: '2026-10-01',
        ngayHetHan: '2027-10-01',
        goiDangKy: 'GOI_NAM_VIP',
        tenGoi: 'Gói Thành Viên VIP (1 Năm)',
        phiDangKy: 100000,
        nguoiLapThe: 'NV002'
      },
      {
        maDocGia: 'DG002',
        hoTen: 'Lê Thị Bích Ngọc',
        loaiDocGia: 'Y',
        ngaySinh: '1992-09-10',
        diaChi: '48 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
        email: 'bichngocle@gmail.com',
        matKhau: '123456',
        ngayLapThe: '2026-11-01',
        ngayHetHan: '2027-05-01',
        goiDangKy: 'GOI_6THANG',
        tenGoi: 'Gói Tiêu Chuẩn QĐ2 (6 Tháng)',
        phiDangKy: 50000,
        nguoiLapThe: 'NV002'
      },
      {
        maDocGia: 'DG003',
        hoTen: 'Trần Minh Quân',
        loaiDocGia: 'X',
        ngaySinh: '2004-11-25',
        diaChi: 'Khu Đô thị ĐHQG TP.HCM, TP. Thủ Đức',
        email: 'tranminhquan@gmail.com',
        matKhau: '123456',
        ngayLapThe: '2025-01-05',
        ngayHetHan: '2025-07-05',
        goiDangKy: 'GOI_6THANG',
        tenGoi: 'Gói Tiêu Chuẩn QĐ2 (6 Tháng)',
        phiDangKy: 50000,
        nguoiLapThe: 'NV005'
      }
    ],
    sach: JSON.parse(JSON.stringify(window.INITIAL_BOOKS_43 || [])),
    phieuMuon: [
      {
        maPhieuMuon: 'PM001',
        maDocGia: 'DG001',
        ngayMuon: addDays(new Date().toISOString().split('T')[0], -1),
        hanTra: addDays(new Date().toISOString().split('T')[0], 3),
        nguoiChoMuon: 'NV002',
        ghiChu: 'Mượn tài liệu tham khảo học phần Giáo dục học (Còn hạn)',
        chiTiet: [
          { maSach: 'MS003', tinhTrangMuon: 'DangMuon', ngayTra: null },
          { maSach: 'MS023', tinhTrangMuon: 'DangMuon', ngayTra: null }
        ]
      },
      {
        maPhieuMuon: 'PM002',
        maDocGia: 'DG003',
        ngayMuon: '2025-06-10',
        hanTra: '2025-06-14',
        nguoiChoMuon: 'NV005',
        ghiChu: 'Mượn đọc văn học nước ngoài (Mẫu kiểm thử sách quá hạn QĐ4 & BM6)',
        chiTiet: [
          { maSach: 'MS036', tinhTrangMuon: 'DangMuon', ngayTra: null }
        ]
      }
    ]
  };
}

let db = loadDatabase();

function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = getInitialDatabase();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.sach || parsed.sach.length < 43) {
      const fresh = getInitialDatabase();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return parsed;
  } catch (e) {
    return getInitialDatabase();
  }
}

function saveDatabase() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  if (currentReader) {
    currentReader = getReaderById(currentReader.maDocGia) || null;
  }
  if (currentAdmin) {
    currentAdmin = getStaffById(currentAdmin.maNV) || null;
  }
  refreshUI();
}

function resetDatabaseToDefault() {
  if (!confirm('Khôi phục dữ liệu hệ thống thư viện về trạng thái chuẩn ban đầu (43 đầu sách)?')) return;
  db = getInitialDatabase();
  borrowCart = [];
  currentReader = null;
  saveDatabase();
  showToast('Đã khôi phục cơ sở dữ liệu chuẩn của thư viện.', 'success');
}

// =========================================================================
// HÀM TIỆN ÍCH & KIỂM TRA QUY ĐỊNH (QĐ1, QĐ2, QĐ3, QĐ4, QĐ5)
// =========================================================================

function formatVND(num) {
  return Number(num || 0).toLocaleString('vi-VN') + ' ₫';
}

function calculateAge(dobStr) {
  if (!dobStr) return 0;
  const birthYear = new Date(dobStr).getFullYear();
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Number(days));
  return d.toISOString().split('T')[0];
}

function diffDays(date1Str, date2Str) {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function isValidGmail(email) {
  return GMAIL_REGEX.test(String(email || '').trim());
}

function getBookById(maSach) {
  return db.sach.find(s => s.maSach === maSach);
}

function getReaderById(maDocGia) {
  return db.docGia.find(d => d.maDocGia === maDocGia);
}

function getStaffById(maNV) {
  return db.nhanVien.find(n => n.maNV === maNV);
}

function getCategoryLabel(code) {
  if (code === 'A') return 'Nhóm A — Giáo Dục, Tâm Lý & Lịch Sử';
  if (code === 'B') return 'Nhóm B — Khoa Học, Vũ Trụ & Tự Nhiên';
  if (code === 'C') return 'Nhóm C — Kinh Tế, Thương Hiệu & Văn Học';
  return 'Chuyên mục khác';
}

function getCategoryBadgeClass(code) {
  if (code === 'A') return 'bg-sky-700 text-white';
  if (code === 'B') return 'bg-indigo-700 text-white';
  if (code === 'C') return 'bg-amber-700 text-white';
  return 'bg-slate-700 text-white';
}

function getReaderBorrowStatus(maDocGia) {
  const today = new Date().toISOString().split('T')[0];
  let activeCount = 0;
  let overdueBooks = [];
  let activeLoans = [];
  let historyLoans = [];

  db.phieuMuon.forEach(pm => {
    if (pm.maDocGia !== maDocGia) return;
    pm.chiTiet.forEach(ct => {
      const book = getBookById(ct.maSach);
      const daysLate = ct.tinhTrangMuon === 'DangMuon' ? Math.max(0, diffDays(pm.hanTra, today)) : 0;
      const item = {
        maPhieuMuon: pm.maPhieuMuon,
        maSach: ct.maSach,
        tenSach: book ? book.tenSach : ct.maSach,
        tacGia: book ? book.tacGia : '',
        hinhAnh: book ? book.hinhAnh : '',
        theLoai: book ? book.theLoai : 'A',
        ngayMuon: pm.ngayMuon,
        hanTra: pm.hanTra,
        ngayTra: ct.ngayTra,
        tinhTrangMuon: ct.tinhTrangMuon,
        daysLate
      };
      historyLoans.push(item);
      if (ct.tinhTrangMuon === 'DangMuon') {
        activeCount++;
        activeLoans.push(item);
        if (daysLate > 0) overdueBooks.push(item);
      }
    });
  });

  return { activeCount, overdueBooks, activeLoans, historyLoans };
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  const styleMap = {
    success: 'bg-emerald-800 border-emerald-600 text-white',
    error: 'bg-rose-800 border-rose-600 text-white',
    warning: 'bg-amber-700 border-amber-500 text-white',
    info: 'bg-slate-900 border-slate-700 text-white'
  };
  const iconMap = {
    success: 'fa-circle-check text-emerald-300',
    error: 'fa-circle-xmark text-rose-300',
    warning: 'fa-triangle-exclamation text-amber-300',
    info: 'fa-circle-info text-sky-300'
  };
  toast.className = `${styleMap[type] || styleMap.info} px-4 py-3.5 rounded-xl shadow-2xl border flex items-start gap-3 min-w-[310px] max-w-md transition-all duration-300`;
  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || iconMap.info} text-lg mt-0.5"></i>
    <div class="flex-1 text-xs sm:text-sm font-medium leading-relaxed">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-white/70 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btnEl.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    btnEl.innerHTML = '<i class="fa-regular fa-eye"></i>';
  }
}

// =========================================================================
// ĐIỀU HƯỚNG GIỮA CỔNG ĐỘC GIẢ (PUBLIC OPAC) & CỔNG CÁN BỘ (ADMIN PORTAL)
// =========================================================================

function navigatePortal(portal) {
  if (portal === 'admin' && !currentAdmin) {
    currentPortal = 'admin-login';
  } else {
    currentPortal = portal;
  }

  const publicEl = document.getElementById('portal-public');
  const adminLoginEl = document.getElementById('portal-admin-login');
  const adminWorkspaceEl = document.getElementById('portal-admin-workspace');

  if (publicEl) publicEl.classList.toggle('hidden', currentPortal !== 'public');
  if (adminLoginEl) adminLoginEl.classList.toggle('hidden', currentPortal !== 'admin-login');
  if (adminWorkspaceEl) adminWorkspaceEl.classList.toggle('hidden', currentPortal !== 'admin');

  refreshUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigatePublicPage(page) {
  if (page === 'reader-profile' && !currentReader) {
    openReaderLoginModal();
    return;
  }
  currentPublicPage = page;
  const pages = ['home', 'catalog', 'register-card', 'rules', 'reader-profile'];
  pages.forEach(p => {
    const sec = document.getElementById(`public-page-${p}`);
    const nav = document.getElementById(`public-nav-${p}`);
    if (sec) sec.classList.toggle('hidden', p !== page);
    if (nav) {
      if (p === page) {
        nav.className = 'px-4 py-2 rounded-lg text-sm font-bold bg-indigo-950 text-white shadow-sm transition';
      } else {
        nav.className = 'px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-indigo-950 transition';
      }
    }
  });
  refreshUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function refreshUI() {
  renderPublicHeaderAuth();
  updateCartBadge();
  if (currentPortal === 'public') {
    renderHomeHighlights();
    renderCatalogPage();
    renderMembershipPlans();
    renderRulesDynamicValues();
    renderReaderProfilePage();
  } else if (currentPortal === 'admin') {
    renderAdminWorkspace();
  }
}

// =========================================================================
// XÁC THỰC ĐỘC GIẢ THỰC TẾ (KHÔNG GỢI Ý HAY CHỌN SẴN THẺ CỦA NGƯỜI KHÁC)
// =========================================================================

function openReaderLoginModal() {
  const errBox = document.getElementById('reader-login-error');
  if (errBox) errBox.classList.add('hidden');
  document.getElementById('modal-reader-login').classList.remove('hidden');
  setTimeout(() => {
    const input = document.getElementById('reader-login-identifier');
    if (input) input.focus();
  }, 80);
}

function closeReaderLoginModal() {
  document.getElementById('modal-reader-login').classList.add('hidden');
}

function handleReaderLoginSubmit(e) {
  e.preventDefault();
  const identifier = document.getElementById('reader-login-identifier').value.trim();
  const password = document.getElementById('reader-login-password').value;
  const errBox = document.getElementById('reader-login-error');
  const errText = document.getElementById('reader-login-error-text');

  const showErr = (msg) => {
    if (errBox && errText) {
      errText.textContent = msg;
      errBox.classList.remove('hidden');
    } else {
      showToast(msg, 'error');
    }
  };

  if (!identifier || !password) {
    showErr('Vui lòng nhập đầy đủ Mã thẻ độc giả (hoặc Email @gmail.com) và Mật khẩu.');
    return;
  }

  // Nếu người dùng nhập có ký tự @ thì kiểm tra đúng cấu trúc @gmail.com
  if (identifier.includes('@') && !isValidGmail(identifier)) {
    showErr('Địa chỉ Email không hợp lệ! Hệ thống chỉ chấp nhận định dạng @gmail.com.');
    return;
  }

  const found = db.docGia.find(
    d => d.maDocGia.toLowerCase() === identifier.toLowerCase() || d.email.toLowerCase() === identifier.toLowerCase()
  );

  if (!found) {
    showErr('Không tìm thấy hồ sơ thẻ độc giả tương ứng trong hệ thống.');
    return;
  }

  if ((found.matKhau || '123456') !== password) {
    showErr('Mật khẩu thẻ độc giả không chính xác. Vui lòng kiểm tra lại.');
    return;
  }

  currentReader = found;
  if (errBox) errBox.classList.add('hidden');
  e.target.reset();
  closeReaderLoginModal();
  refreshUI();
  showToast(`Đăng nhập thành công! Xin chào độc giả ${found.hoTen} (${found.maDocGia}).`, 'success');
}

function handleReaderLogout() {
  currentReader = null;
  borrowCart = [];
  if (currentPublicPage === 'reader-profile') {
    navigatePublicPage('home');
  } else {
    refreshUI();
  }
  showToast('Đã đăng xuất khỏi cổng thông tin độc giả.', 'info');
}

function renderPublicHeaderAuth() {
  const container = document.getElementById('public-header-auth');
  if (!container) return;

  if (currentReader) {
    const st = getReaderBorrowStatus(currentReader.maDocGia);
    container.innerHTML = `
      <div class="flex items-center gap-2">
        <button onclick="navigatePublicPage('reader-profile')" class="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200 transition text-left">
          <div class="w-8 h-8 rounded-lg bg-indigo-950 text-amber-300 flex items-center justify-center font-bold text-xs">
            ${currentReader.hoTen.split(' ').pop().charAt(0)}
          </div>
          <div class="hidden sm:block">
            <div class="text-xs font-bold text-slate-900 leading-none">${currentReader.hoTen}</div>
            <div class="text-[11px] text-indigo-700 font-semibold mt-0.5">Mã thẻ: ${currentReader.maDocGia} • Đang mượn: ${st.activeCount}/${db.thamSo.SoSachMuonToiDa}</div>
          </div>
        </button>
        <button onclick="handleReaderLogout()" class="p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition text-xs" title="Đăng xuất tài khoản độc giả">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="flex items-center gap-2">
        <button onclick="openReaderLoginModal()" class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-indigo-950 bg-white hover:bg-slate-100 border border-slate-300 transition flex items-center gap-1.5 shadow-2xs">
          <i class="fa-regular fa-user"></i>
          <span>Đăng nhập Độc giả</span>
        </button>
        <button onclick="navigatePublicPage('register-card')" class="hidden md:flex px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-900 hover:bg-indigo-950 transition items-center gap-1.5 shadow-sm">
          <i class="fa-regular fa-id-card"></i>
          <span>Mở Thẻ Thư Viện</span>
        </button>
      </div>
    `;
  }
}

// =========================================================================
// XÁC THỰC CÁN BỘ QUẢN TRỊ NỘI BỘ (ADMIN PORTAL AUTHENTICATION)
// =========================================================================

function handleAdminLoginSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('admin-auth-username').value.trim();
  const password = document.getElementById('admin-auth-password').value;
  const errBox = document.getElementById('admin-auth-error');
  const errText = document.getElementById('admin-auth-error-text');

  const showErr = (msg) => {
    if (errBox && errText) {
      errText.textContent = msg;
      errBox.classList.remove('hidden');
    }
  };

  if (!username || !password) {
    showErr('Vui lòng nhập Mã cán bộ (hoặc Tài khoản nội bộ) và Mật khẩu.');
    return;
  }

  const staff = db.nhanVien.find(
    n =>
      n.maNV.toLowerCase() === username.toLowerCase() ||
      (n.taiKhoan && n.taiKhoan.toLowerCase() === username.toLowerCase()) ||
      (n.email && n.email.toLowerCase() === username.toLowerCase())
  );

  if (!staff) {
    showErr('Tài khoản hoặc Mã nhân viên không tồn tại trong phân hệ Nhân sự (BM1).');
    return;
  }

  const validPass = staff.matKhau || '123456';
  if (password !== validPass && !(username.toLowerCase() === 'admin' && password === 'admin123')) {
    showErr('Mật khẩu xác thực nội bộ không chính xác.');
    return;
  }

  currentAdmin = staff;
  if (errBox) errBox.classList.add('hidden');
  e.target.reset();
  navigatePortal('admin');
  showToast(`Xác thực thành công: Cán bộ ${staff.hoTen} — Bộ phận ${staff.boPhan} (${staff.chucVu}).`, 'success');
}

function handleAdminLogout() {
  currentAdmin = null;
  navigatePortal('public');
  showToast('Đã đăng xuất khỏi Phân hệ Quản trị Thư viện.', 'info');
}

// =========================================================================
// PHẦN 1: TRANG CHỦ THƯ VIỆN & TRA CỨU OPAC (43 ĐẦU SÁCH NHÓM A, B, C)
// =========================================================================

function renderHomeHighlights() {
  const totalBooks = db.sach.length;
  const availBooks = db.sach.filter(s => s.tinhTrang === 'Con').length;
  const countA = db.sach.filter(s => s.theLoai === 'A').length;
  const countB = db.sach.filter(s => s.theLoai === 'B').length;
  const countC = db.sach.filter(s => s.theLoai === 'C').length;

  const setTxt = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  setTxt('home-stat-total', totalBooks);
  setTxt('home-stat-avail', availBooks);
  setTxt('home-stat-a', countA);
  setTxt('home-stat-b', countB);
  setTxt('home-stat-c', countC);
  setTxt('home-stat-readers', db.docGia.length);

  // Hiển thị 10 đầu sách tiêu biểu trên trang chủ
  const featuredGrid = document.getElementById('home-featured-books');
  if (featuredGrid) {
    const featured = [
      db.sach[0], db.sach[3], db.sach[4], db.sach[14], db.sach[24],
      db.sach[26], db.sach[28], db.sach[30], db.sach[34], db.sach[42]
    ].filter(Boolean);
    featuredGrid.innerHTML = featured.map(b => createBookCardHTML(b)).join('');
  }
}

function jumpToCategoryCatalog(cat) {
  selectedCategory = cat;
  navigatePublicPage('catalog');
}

function filterStoreByCategory(cat) {
  selectedCategory = cat;
  renderCatalogPage();
}

function filterStoreByStatus(st) {
  selectedStatusFilter = st;
  renderCatalogPage();
}

function handleStoreSearch(val) {
  searchQuery = val.trim().toLowerCase();
  renderCatalogPage();
}

function handleStoreSort(val) {
  selectedSort = val;
  renderCatalogPage();
}

function createBookCardHTML(book) {
  const isAvail = book.tinhTrang === 'Con';
  const inCart = borrowCart.includes(book.maSach);
  const badgeClass = getCategoryBadgeClass(book.theLoai);

  return `
    <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group">
      <div class="relative aspect-[3/4] bg-slate-100 overflow-hidden cursor-pointer" onclick="openBookDetailModal('${book.maSach}')">
        <img src="${book.hinhAnh}" alt="${book.tenSach}" loading="lazy"
          onerror="this.src='https://placehold.co/400x550/1e1b4b/ffffff?text=' + encodeURIComponent('${book.maSach}')"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow ${badgeClass}">
            Nhóm ${book.theLoai}
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur-xs w-fit">
            ${book.maSach}
          </span>
        </div>
        <div class="absolute top-2.5 right-2.5">
          ${isAvail
            ? `<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-700 text-white shadow flex items-center gap-1"><i class="fa-solid fa-check"></i> Còn sẵn</span>`
            : `<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-700 text-white shadow flex items-center gap-1"><i class="fa-regular fa-clock"></i> Đang mượn</span>`
          }
        </div>
      </div>

      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div class="text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-1 truncate">${book.chuyenMuc || getCategoryLabel(book.theLoai)}</div>
          <h3 onclick="openBookDetailModal('${book.maSach}')" class="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-indigo-800 cursor-pointer min-h-[2.5rem]" title="${book.tenSach}">
            ${book.tenSach}
          </h3>
          <p class="text-xs text-slate-600 mt-1.5 truncate"><i class="fa-solid fa-user-pen text-slate-400 mr-1.5"></i>${book.tacGia}</p>
          <p class="text-[11px] text-slate-500 mt-0.5 truncate"><i class="fa-solid fa-building-columns text-slate-400 mr-1.5"></i>${book.nhaXuatBan} • ${book.namXuatBan}</p>
        </div>

        <div class="mt-3.5 pt-3 border-t border-slate-100">
          <div class="flex items-center justify-between text-xs mb-2.5">
            <span class="text-slate-500">Trị giá tài liệu:</span>
            <span class="font-extrabold text-slate-900">${formatVND(book.triGia)}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="openBookDetailModal('${book.maSach}')" class="px-2.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition" title="Xem thông tin biên mục">
              <i class="fa-regular fa-eye"></i>
            </button>
            ${isAvail ? (
              inCart ? `
                <button onclick="toggleBookInCart('${book.maSach}')" class="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition flex items-center justify-center gap-1.5">
                  <i class="fa-solid fa-check"></i> Đã chọn mượn
                </button>
              ` : `
                <button onclick="toggleBookInCart('${book.maSach}')" class="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-indigo-950 hover:bg-indigo-900 text-white shadow-xs transition flex items-center justify-center gap-1.5">
                  <i class="fa-solid fa-plus"></i> Đăng ký mượn
                </button>
              `
            ) : `
              <button disabled class="flex-1 py-2 px-3 rounded-xl font-semibold text-xs bg-slate-100 text-slate-400 cursor-not-allowed">
                Đang lưu thông
              </button>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCatalogPage() {
  const grid = document.getElementById('opac-book-grid');
  if (!grid) return;

  const countAll = db.sach.length;
  const countA = db.sach.filter(s => s.theLoai === 'A').length;
  const countB = db.sach.filter(s => s.theLoai === 'B').length;
  const countC = db.sach.filter(s => s.theLoai === 'C').length;

  const setTxt = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  setTxt('opac-count-all', countAll);
  setTxt('opac-count-a', countA);
  setTxt('opac-count-b', countB);
  setTxt('opac-count-c', countC);

  ['ALL', 'A', 'B', 'C'].forEach(cat => {
    const btn = document.getElementById(`opac-cat-btn-${cat}`);
    if (btn) {
      if (selectedCategory === cat) {
        btn.className = 'px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-950 text-white shadow-sm flex items-center gap-2 transition';
      } else {
        btn.className = 'px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-2 transition';
      }
    }
  });

  let filtered = db.sach.filter(s => {
    if (selectedCategory !== 'ALL' && s.theLoai !== selectedCategory) return false;
    if (selectedStatusFilter !== 'ALL' && s.tinhTrang !== selectedStatusFilter) return false;
    if (searchQuery) {
      const hay = `${s.maSach} ${s.tenSach} ${s.tacGia} ${s.nhaXuatBan} ${s.chuyenMuc || ''}`.toLowerCase();
      if (!hay.includes(searchQuery)) return false;
    }
    return true;
  });

  if (selectedSort === 'name-asc') filtered.sort((a, b) => a.tenSach.localeCompare(b.tenSach, 'vi'));
  else if (selectedSort === 'year-desc') filtered.sort((a, b) => b.namXuatBan - a.namXuatBan);
  else if (selectedSort === 'price-asc') filtered.sort((a, b) => a.triGia - b.triGia);
  else if (selectedSort === 'price-desc') filtered.sort((a, b) => b.triGia - a.triGia);

  setTxt('opac-result-summary', `Tìm thấy ${filtered.length} / ${countAll} tài liệu biên mục`);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
        <i class="fa-solid fa-magnifying-glass text-4xl text-slate-300 mb-3"></i>
        <h3 class="text-base font-bold text-slate-800">Không tìm thấy tài liệu phù hợp</h3>
        <p class="text-xs text-slate-500 mt-1">Vui lòng thử từ khóa khác hoặc đặt lại bộ lọc chuyên mục.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(b => createBookCardHTML(b)).join('');
}

// =========================================================================
// CHI TIẾT SÁCH & GIỎ PHIẾU YÊU CẦU MƯỢN SÁCH (CHUẨN THỰC TẾ QĐ4)
// =========================================================================

function openBookDetailModal(maSach) {
  const book = getBookById(maSach);
  if (!book) return;
  const staff = getStaffById(book.nguoiTiepNhan);
  const isAvail = book.tinhTrang === 'Con';
  const inCart = borrowCart.includes(book.maSach);

  const body = document.getElementById('modal-book-detail-body');
  body.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <div class="md:col-span-5 bg-slate-100 rounded-2xl p-3 border border-slate-200">
        <img src="${book.hinhAnh}" alt="${book.tenSach}" class="w-full h-auto object-cover rounded-xl max-h-[400px] mx-auto shadow-sm" />
      </div>
      <div class="md:col-span-7 space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-3 py-1 rounded-md text-xs font-bold ${getCategoryBadgeClass(book.theLoai)}">${getCategoryLabel(book.theLoai)}</span>
          <span class="px-3 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">Ký hiệu: ${book.maSach}</span>
          ${isAvail
            ? `<span class="px-3 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800"><i class="fa-solid fa-check mr-1"></i>Sẵn sàng cho mượn</span>`
            : `<span class="px-3 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800"><i class="fa-regular fa-clock mr-1"></i>Đang có độc giả mượn</span>`
          }
        </div>

        <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">${book.tenSach}</h2>

        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
          ${book.moTa || 'Tài liệu đã được kiểm duyệt và biên mục theo Quy định 3 (QĐ3) tại Thư viện.'}
        </p>

        <div class="grid grid-cols-2 gap-3 text-xs sm:text-sm bg-white p-4 rounded-xl border border-slate-200">
          <div><span class="text-slate-400 text-xs block">Tác giả / Chủ biên:</span><strong class="text-slate-900">${book.tacGia}</strong></div>
          <div><span class="text-slate-400 text-xs block">Nhà xuất bản:</span><strong class="text-slate-900">${book.nhaXuatBan}</strong></div>
          <div><span class="text-slate-400 text-xs block">Năm xuất bản (QĐ3):</span><strong class="text-slate-900">${book.namXuatBan}</strong></div>
          <div><span class="text-slate-400 text-xs block">Trị giá biên mục:</span><strong class="text-amber-700">${formatVND(book.triGia)}</strong></div>
          <div><span class="text-slate-400 text-xs block">Ngày nhập kho (BM3):</span><strong class="text-slate-900">${book.ngayNhap}</strong></div>
          <div><span class="text-slate-400 text-xs block">Cán bộ Thủ Kho tiếp nhận:</span><strong class="text-slate-900">${staff ? staff.hoTen : book.nguoiTiepNhan}</strong></div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          ${isAvail ? `
            <button onclick="toggleBookInCart('${book.maSach}'); closeBookDetailModal(); openBorrowDrawer();" class="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-indigo-950 hover:bg-indigo-900 text-white shadow-md transition flex items-center justify-center gap-2">
              <i class="fa-solid fa-book-medical"></i> ${inCart ? 'Xem Phiếu Yêu Cầu Mượn' : 'Chọn Mượn & Đăng Ký Ngày Trả'}
            </button>
          ` : `
            <button disabled class="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-slate-200 text-slate-500 cursor-not-allowed">
              Tài liệu đang lưu thông (Đang được mượn)
            </button>
          `}
          <button onclick="closeBookDetailModal()" class="py-3 px-5 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
            Đóng
          </button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-book-detail').classList.remove('hidden');
}

function closeBookDetailModal() {
  document.getElementById('modal-book-detail').classList.add('hidden');
}

function toggleBookInCart(maSach) {
  const book = getBookById(maSach);
  if (!book) return;
  if (book.tinhTrang !== 'Con') {
    showToast('Tài liệu này hiện đang được mượn, vui lòng chọn cuốn khác.', 'warning');
    return;
  }

  const idx = borrowCart.indexOf(maSach);
  if (idx > -1) {
    borrowCart.splice(idx, 1);
    showToast(`Đã xóa "${book.tenSach}" khỏi danh sách đăng ký mượn.`, 'info');
  } else {
    const maxBooks = db.thamSo.SoSachMuonToiDa;
    if (borrowCart.length >= maxBooks) {
      showToast(`Quy định 4 (QĐ4): Mỗi lần chỉ được đăng ký mượn tối đa ${maxBooks} quyển sách.`, 'error');
      return;
    }
    borrowCart.push(maSach);
    showToast(`Đã thêm "${book.tenSach}" vào Phiếu đăng ký mượn (${borrowCart.length}/${maxBooks}).`, 'success');
  }

  updateCartBadge();
  renderHomeHighlights();
  renderCatalogPage();
  renderBorrowDrawerContent();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count-badge');
  if (badge) badge.textContent = borrowCart.length;
}

function openBorrowDrawer() {
  renderBorrowDrawerContent();
  document.getElementById('modal-borrow-drawer').classList.remove('hidden');
}

function closeBorrowDrawer() {
  document.getElementById('modal-borrow-drawer').classList.add('hidden');
}

function renderBorrowDrawerContent() {
  const authBox = document.getElementById('drawer-reader-auth-box');
  const listEl = document.getElementById('drawer-cart-items');
  const qd4Box = document.getElementById('drawer-qd4-check');
  const borrowDateInput = document.getElementById('drawer-borrow-date');
  const returnDateInput = document.getElementById('drawer-return-date');
  if (!listEl || !authBox) return;

  const today = new Date().toISOString().split('T')[0];
  if (borrowDateInput && !borrowDateInput.value) borrowDateInput.value = today;
  if (returnDateInput && !returnDateInput.value) {
    returnDateInput.value = addDays(today, db.thamSo.SoNgayMuonToiDa);
  }

  // Hiển thị thông tin thẻ của độc giả đang đăng nhập (Chuẩn thực tế: Không hiển thị dropdown thẻ của người khác)
  if (!currentReader) {
    authBox.innerHTML = `
      <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2.5">
        <div class="font-bold flex items-center gap-1.5 text-sm text-amber-950">
          <i class="fa-solid fa-lock text-amber-600"></i> Yêu cầu xác thực Thẻ Độc Giả
        </div>
        <p class="leading-relaxed">Vui lòng đăng nhập bằng Mã thẻ độc giả hoặc Email <code>@gmail.com</code> của bạn để lập phiếu mượn sách.</p>
        <div class="flex items-center gap-2 pt-1">
          <button type="button" onclick="closeBorrowDrawer(); openReaderLoginModal();" class="px-3.5 py-2 rounded-lg bg-indigo-950 text-white font-bold text-xs hover:bg-indigo-900 transition">
            Đăng nhập Thẻ Độc Giả
          </button>
          <button type="button" onclick="closeBorrowDrawer(); navigatePublicPage('register-card');" class="px-3.5 py-2 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold text-xs hover:bg-amber-100 transition">
            Đăng ký mở thẻ mới
          </button>
        </div>
      </div>
    `;
    if (qd4Box) qd4Box.innerHTML = '';
  } else {
    const st = getReaderBorrowStatus(currentReader.maDocGia);
    const bDate = borrowDateInput?.value || today;
    const rDate = returnDateInput?.value || addDays(bDate, db.thamSo.SoNgayMuonToiDa);
    const daysRequested = diffDays(bDate, rDate);
    const isCardValid = currentReader.ngayHetHan >= bDate;
    const hasOverdue = st.overdueBooks.length > 0;
    const totalAfterBorrow = st.activeCount + borrowCart.length;
    const maxAllowed = db.thamSo.SoSachMuonToiDa;

    authBox.innerHTML = `
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
        <div>
          <div class="text-[11px] font-bold text-slate-400 uppercase">Độc giả đăng ký mượn (BM4):</div>
          <div class="text-sm font-extrabold text-slate-900 mt-0.5">${currentReader.hoTen} <span class="text-indigo-700">(${currentReader.maDocGia})</span></div>
          <div class="text-slate-500 mt-0.5">${currentReader.email} • Hạn thẻ: <b>${currentReader.ngayHetHan}</b></div>
        </div>
        <span class="px-2.5 py-1 rounded-md font-bold bg-indigo-100 text-indigo-800">Loại ${currentReader.loaiDocGia}</span>
      </div>
    `;

    let errors = [];
    if (!isCardValid) errors.push(`Thẻ độc giả đã hết hạn sử dụng (${currentReader.ngayHetHan}).`);
    if (hasOverdue) errors.push(`Đang có ${st.overdueBooks.length} cuốn sách quá hạn chưa trả.`);
    if (totalAfterBorrow > maxAllowed) errors.push(`Tổng sách đang giữ (${st.activeCount}) + đăng ký mới (${borrowCart.length}) vượt quá định mức ${maxAllowed} cuốn.`);
    if (daysRequested <= 0) errors.push(`Ngày đăng ký trả phải sau ngày mượn.`);
    if (daysRequested > db.thamSo.SoNgayMuonToiDa) errors.push(`Thời hạn mượn (${daysRequested} ngày) vượt quá tối đa ${db.thamSo.SoNgayMuonToiDa} ngày theo QĐ4.`);

    if (qd4Box) {
      if (errors.length > 0) {
        qd4Box.innerHTML = `
          <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <div class="font-bold"><i class="fa-solid fa-circle-xmark mr-1"></i>Chưa đạt điều kiện mượn sách (QĐ4):</div>
            <ul class="list-disc pl-4 space-y-0.5">${errors.map(e => `<li>${e}</li>`).join('')}</ul>
          </div>
        `;
      } else {
        qd4Box.innerHTML = `
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div class="font-bold"><i class="fa-solid fa-circle-check mr-1 text-emerald-700"></i>Đủ điều kiện mượn sách theo Quy định 4 (QĐ4)</div>
            <div>Số sách đang mượn: <b>${st.activeCount}/${maxAllowed}</b> • Thời hạn đăng ký: <b>${daysRequested} ngày</b> (Chuẩn QĐ4: ≤ ${db.thamSo.SoNgayMuonToiDa} ngày).</div>
          </div>
        `;
      }
    }
  }

  if (borrowCart.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <i class="fa-solid fa-book-open text-2xl text-slate-300 mb-2"></i>
        <p class="text-xs font-semibold text-slate-600">Chưa có tài liệu nào trong phiếu đăng ký mượn</p>
      </div>
    `;
  } else {
    listEl.innerHTML = borrowCart.map((maSach, idx) => {
      const b = getBookById(maSach);
      if (!b) return '';
      return `
        <div class="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
          <span class="w-6 h-6 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center">${idx + 1}</span>
          <img src="${b.hinhAnh}" class="w-10 h-14 object-cover rounded border" />
          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold text-slate-900 truncate">${b.tenSach}</div>
            <div class="text-[11px] text-slate-500">${b.maSach} • Nhóm ${b.theLoai} • ${b.tacGia}</div>
          </div>
          <button type="button" onclick="toggleBookInCart('${b.maSach}')" class="text-rose-600 hover:bg-rose-50 p-2 rounded-lg text-xs">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    }).join('');
  }
}

function setQuickReturnDays(days) {
  const bDate = document.getElementById('drawer-borrow-date').value || new Date().toISOString().split('T')[0];
  document.getElementById('drawer-return-date').value = addDays(bDate, days);
  renderBorrowDrawerContent();
}

function submitStoreBorrowOrder(e) {
  e.preventDefault();
  if (!currentReader) {
    closeBorrowDrawer();
    openReaderLoginModal();
    showToast('Vui lòng đăng nhập Thẻ Độc Giả trước khi gửi phiếu mượn sách.', 'warning');
    return;
  }

  if (borrowCart.length === 0) {
    showToast('Vui lòng chọn ít nhất 1 đầu sách để đăng ký mượn.', 'error');
    return;
  }

  const ngayMuon = document.getElementById('drawer-borrow-date').value;
  const hanTra = document.getElementById('drawer-return-date').value;
  const ghiChu = document.getElementById('drawer-borrow-note').value.trim();
  const st = getReaderBorrowStatus(currentReader.maDocGia);

  if (currentReader.ngayHetHan < ngayMuon) {
    showToast(`Từ chối mượn (QĐ4): Thẻ độc giả ${currentReader.maDocGia} đã hết hạn ngày ${currentReader.ngayHetHan}.`, 'error');
    return;
  }
  if (st.overdueBooks.length > 0) {
    showToast(`Từ chối mượn (QĐ4): Bạn đang có ${st.overdueBooks.length} cuốn sách quá hạn chưa trả.`, 'error');
    return;
  }
  if (st.activeCount + borrowCart.length > db.thamSo.SoSachMuonToiDa) {
    showToast(`Từ chối mượn (QĐ4): Vượt quá định mức tối đa ${db.thamSo.SoSachMuonToiDa} quyển sách.`, 'error');
    return;
  }
  const daysRequested = diffDays(ngayMuon, hanTra);
  if (daysRequested <= 0) {
    showToast('Ngày đăng ký trả sách phải sau ngày mượn.', 'error');
    return;
  }
  if (daysRequested > db.thamSo.SoNgayMuonToiDa) {
    showToast(`Từ chối mượn (QĐ4): Thời gian mượn (${daysRequested} ngày) vượt quá quy định tối đa ${db.thamSo.SoNgayMuonToiDa} ngày!`, 'error');
    return;
  }

  const thuThu = db.nhanVien.find(n => n.boPhan === 'Thủ Thư') || db.nhanVien[0];
  const newId = generateNextId(db.phieuMuon, 'maPhieuMuon', 'PM');

  db.phieuMuon.unshift({
    maPhieuMuon: newId,
    maDocGia: currentReader.maDocGia,
    ngayMuon,
    hanTra,
    nguoiChoMuon: thuThu.maNV,
    ghiChu: ghiChu || 'Đăng ký mượn qua Cổng thông tin Độc giả (OPAC)',
    chiTiet: borrowCart.map(ms => ({
      maSach: ms,
      tinhTrangMuon: 'DangMuon',
      ngayTra: null
    }))
  });

  borrowCart.forEach(ms => {
    const b = getBookById(ms);
    if (b) b.tinhTrang = 'DangMuon';
  });

  borrowCart = [];
  saveDatabase();
  closeBorrowDrawer();
  navigatePublicPage('reader-profile');
  showToast(`Lập phiếu mượn ${newId} thành công! Ngày đăng ký trả: ${hanTra}.`, 'success');
}

// =========================================================================
// PHẦN 2: ĐĂNG KÝ MỞ THẺ ĐỘC GIẢ (BM2 - QĐ2) & HỒ SƠ CÁ NHÂN ĐỘC GIẢ
// =========================================================================

function selectMembershipPlan(planId) {
  selectedPlanId = planId;
  renderMembershipPlans();
  const plan = window.MEMBERSHIP_PLANS.find(p => p.id === planId);
  const issueInput = document.getElementById('reg-issue-date');
  const expInput = document.getElementById('reg-expire-date');
  if (plan && issueInput && expInput) {
    const issueDate = issueInput.value || new Date().toISOString().split('T')[0];
    expInput.value = addMonths(issueDate, plan.months);
  }
}

function renderMembershipPlans() {
  const container = document.getElementById('membership-plans-grid');
  if (!container || !window.MEMBERSHIP_PLANS) return;

  container.innerHTML = window.MEMBERSHIP_PLANS.map(plan => {
    const isSelected = plan.id === selectedPlanId;
    return `
      <div onclick="selectMembershipPlan('${plan.id}')"
        class="cursor-pointer rounded-2xl p-6 transition-all border-2 flex flex-col justify-between ${
          isSelected
            ? 'border-indigo-950 bg-indigo-50/40 shadow-lg'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }">
        <div>
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${isSelected ? 'bg-indigo-950 text-amber-300' : 'bg-slate-100 text-slate-700'}">${plan.badge}</span>
            <span class="w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-950 bg-indigo-950 text-white' : 'border-slate-300'}">
              ${isSelected ? '<i class="fa-solid fa-check text-[10px]"></i>' : ''}
            </span>
          </div>
          <h3 class="text-base font-extrabold text-slate-900 mt-3">${plan.name}</h3>
          <div class="mt-2 flex items-baseline gap-1">
            <span class="text-2xl font-black text-indigo-950">${formatVND(plan.price)}</span>
            <span class="text-xs text-slate-500 font-semibold">/ ${plan.months} tháng</span>
          </div>
          <p class="text-xs text-slate-600 mt-2 leading-relaxed">${plan.desc}</p>
          <ul class="mt-4 space-y-1.5 text-xs text-slate-700">
            ${plan.features.map(f => `<li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-600"></i><span>${f}</span></li>`).join('')}
          </ul>
        </div>
        <div class="mt-5 pt-3 border-t border-slate-100 text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-500'}">
          ${isSelected ? '✓ Đang chọn biểu phí này' : 'Nhấn để chọn biểu phí này'}
        </div>
      </div>
    `;
  }).join('');

  const plan = window.MEMBERSHIP_PLANS.find(p => p.id === selectedPlanId) || window.MEMBERSHIP_PLANS[1];
  const summaryEl = document.getElementById('reg-selected-plan-summary');
  if (summaryEl && plan) {
    summaryEl.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span class="text-[11px] font-bold uppercase text-indigo-800 block">Gói thời hạn thẻ đăng ký:</span>
          <strong class="text-sm sm:text-base text-slate-900">${plan.name} — Thời hạn ${plan.months} tháng</strong>
        </div>
        <div class="text-right">
          <span class="text-[11px] text-slate-500 block">Lệ phí cấp thẻ:</span>
          <strong class="text-lg font-black text-emerald-700">${formatVND(plan.price)}</strong>
        </div>
      </div>
    `;
  }
}

function handleStoreMemberRegister(e) {
  e.preventDefault();
  const hoTen = document.getElementById('reg-fullname').value.trim();
  const loaiDocGia = document.getElementById('reg-type').value;
  const ngaySinh = document.getElementById('reg-dob').value;
  const email = document.getElementById('reg-email').value.trim();
  const matKhau = document.getElementById('reg-password').value.trim();
  const diaChi = document.getElementById('reg-address').value.trim();
  const ngayLapThe = document.getElementById('reg-issue-date').value;

  const emailErrEl = document.getElementById('reg-email-error');
  if (!isValidGmail(email)) {
    if (emailErrEl) emailErrEl.classList.remove('hidden');
    showToast('Email không đúng cấu trúc @gmail.com!', 'error');
    return;
  }
  if (emailErrEl) emailErrEl.classList.add('hidden');

  const age = calculateAge(ngaySinh);
  if (age < db.thamSo.TuoiToiThieu || age > db.thamSo.TuoiToiDa) {
    showToast(`Từ chối cấp thẻ (QĐ2): Độ tuổi độc giả là ${age} tuổi (Quy định từ ${db.thamSo.TuoiToiThieu} đến ${db.thamSo.TuoiToiDa} tuổi).`, 'error');
    return;
  }

  if (db.docGia.some(d => d.email.toLowerCase() === email.toLowerCase())) {
    showToast('Địa chỉ Email @gmail.com này đã được cấp thẻ trên hệ thống. Vui lòng đăng nhập.', 'warning');
    return;
  }

  const plan = window.MEMBERSHIP_PLANS.find(p => p.id === selectedPlanId) || window.MEMBERSHIP_PLANS[1];
  const ngayHetHan = addMonths(ngayLapThe, plan.months);
  const thuThu = db.nhanVien.find(n => n.boPhan === 'Thủ Thư') || db.nhanVien[0];
  const newCode = generateNextId(db.docGia, 'maDocGia', 'DG');

  const newReader = {
    maDocGia: newCode,
    hoTen,
    loaiDocGia,
    ngaySinh,
    diaChi,
    email,
    matKhau,
    ngayLapThe,
    ngayHetHan,
    goiDangKy: plan.id,
    tenGoi: plan.name,
    phiDangKy: plan.price,
    nguoiLapThe: thuThu.maNV
  };

  db.docGia.push(newReader);
  currentReader = newReader;
  saveDatabase();
  e.target.reset();
  initDefaultDates();
  navigatePublicPage('reader-profile');
  showToast(`Cấp thẻ thành công! Mã thẻ của bạn là ${newCode}.`, 'success');
}

function renderRulesDynamicValues() {
  const t = db.thamSo;
  const setTxt = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  setTxt('rule-val-min-age', t.TuoiToiThieu);
  setTxt('rule-val-max-age', t.TuoiToiDa);
  setTxt('rule-val-months', t.ThoiHanTheThang);
  setTxt('rule-val-pub-years', t.KhoangCachNamXB);
  setTxt('rule-val-max-books', t.SoSachMuonToiDa);
  setTxt('rule-val-max-days', t.SoNgayMuonToiDa);
}

function renderReaderProfilePage() {
  const container = document.getElementById('reader-profile-content');
  if (!container || !currentReader) return;

  const st = getReaderBorrowStatus(currentReader.maDocGia);
  const thuThu = getStaffById(currentReader.nguoiLapThe);
  const today = new Date().toISOString().split('T')[0];
  const isExpired = currentReader.ngayHetHan < today;

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Thẻ thư viện số chuẩn BM2 -->
      <div class="lg:col-span-5 space-y-4">
        <div class="rounded-2xl p-6 text-white bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl">
          <div class="flex items-center justify-between pb-4 border-b border-white/15">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <i class="fa-solid fa-building-columns"></i>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-widest text-amber-300 font-bold">THẺ THƯ VIỆN ĐIỆN TỬ (BM2)</div>
                <div class="text-sm font-extrabold">THE TH UNIVERSITY LIBRARY</div>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-md text-[11px] font-bold ${isExpired ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-slate-950'}">
              ${isExpired ? 'Hết hạn thẻ' : 'Thẻ hợp lệ'}
            </span>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-3.5 text-xs">
            <div>
              <span class="text-slate-400 block">Mã số thẻ độc giả:</span>
              <span class="text-lg font-mono font-black text-amber-300">${currentReader.maDocGia}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Phân loại (QĐ2):</span>
              <span class="text-sm font-bold">${currentReader.loaiDocGia === 'X' ? 'Loại X (Sinh viên)' : 'Loại Y (Giảng viên/CB)'}</span>
            </div>
            <div class="col-span-2">
              <span class="text-slate-400 block">Họ và tên chủ thẻ:</span>
              <span class="text-base font-extrabold uppercase tracking-wide">${currentReader.hoTen}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Ngày sinh:</span>
              <span class="font-semibold">${currentReader.ngaySinh} (${calculateAge(currentReader.ngaySinh)} tuổi)</span>
            </div>
            <div>
              <span class="text-slate-400 block">Email đăng ký:</span>
              <span class="font-semibold truncate block">${currentReader.email}</span>
            </div>
            <div class="col-span-2">
              <span class="text-slate-400 block">Địa chỉ liên hệ:</span>
              <span class="font-semibold">${currentReader.diaChi}</span>
            </div>
          </div>

          <div class="mt-5 pt-4 border-t border-white/15 flex items-center justify-between text-xs">
            <div>
              <span class="text-slate-400 block">Gói thời hạn:</span>
              <span class="font-bold text-amber-300">${currentReader.tenGoi || 'Chuẩn QĐ2 (6 Tháng)'}</span>
            </div>
            <div class="text-right">
              <span class="text-slate-400 block">Giá trị sử dụng:</span>
              <span class="font-mono font-bold">${currentReader.ngayLapThe} → ${currentReader.ngayHetHan}</span>
            </div>
          </div>
          <div class="mt-2 text-[11px] text-slate-400">
            Cán bộ Thủ Thư cấp thẻ: <strong class="text-slate-200">${thuThu ? thuThu.hoTen : currentReader.nguoiLapThe}</strong>
          </div>
        </div>
      </div>

      <!-- Tài liệu đang mượn & lịch sử lưu thông -->
      <div class="lg:col-span-7 space-y-6">
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Tài Liệu Đang Mượn (${st.activeCount}/${db.thamSo.SoSachMuonToiDa} quyển)</h3>
              <p class="text-xs text-slate-500">Theo dõi hạn trả đã đăng ký hoặc hoàn trả tài liệu trực tuyến.</p>
            </div>
            <button onclick="navigatePublicPage('catalog')" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-950 text-white hover:bg-indigo-900">
              <i class="fa-solid fa-plus mr-1"></i>Tra cứu & Mượn thêm
            </button>
          </div>

          ${st.activeLoans.length === 0 ? `
            <div class="text-center py-8 text-slate-400">
              <i class="fa-solid fa-book-bookmark text-3xl mb-2"></i>
              <p class="text-xs font-semibold text-slate-600">Bạn không có tài liệu nào đang mượn.</p>
            </div>
          ` : `
            <div class="space-y-3 mt-4">
              ${st.activeLoans.map(item => `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border ${item.daysLate > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'}">
                  <div class="flex items-center gap-3">
                    <img src="${item.hinhAnh}" class="w-11 h-15 object-cover rounded border bg-white" />
                    <div>
                      <div class="text-[11px] font-mono font-bold text-indigo-800">Phiếu ${item.maPhieuMuon} • Mã sách: ${item.maSach}</div>
                      <h4 class="font-bold text-slate-900 text-sm">${item.tenSach}</h4>
                      <div class="text-xs text-slate-600 mt-0.5">
                        Ngày mượn: <b>${item.ngayMuon}</b> • Hạn trả đăng ký: <b class="${item.daysLate > 0 ? 'text-rose-700' : 'text-emerald-700'}">${item.hanTra}</b>
                      </div>
                      ${item.daysLate > 0 ? `<span class="inline-block mt-1 px-2 py-0.5 rounded bg-rose-700 text-white text-[10px] font-bold">Trễ hạn ${item.daysLate} ngày</span>` : ''}
                    </div>
                  </div>
                  <button onclick="returnBookItem('${item.maPhieuMuon}', '${item.maSach}')"
                    class="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition shrink-0">
                    <i class="fa-solid fa-rotate-left mr-1"></i>Hoàn trả sách
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

// =========================================================================
// PHẦN 3: KHÔNG GIAN QUẢN TRỊ NỘI BỘ (ADMIN WORKSPACE - BM1..BM6, QĐ1..QĐ5)
// =========================================================================

function switchAdminTab(tab) {
  currentAdminTab = tab;
  const tabs = ['dashboard', 'bm4', 'return', 'bm3', 'bm2', 'bm1', 'bm5-bm6', 'qd5'];
  tabs.forEach(t => {
    const sec = document.getElementById(`admin-sec-${t}`);
    const btn = document.getElementById(`admin-nav-${t}`);
    if (sec) sec.classList.toggle('hidden', t !== tab);
    if (btn) {
      if (t === tab) {
        btn.className = 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-amber-400 text-slate-950 shadow-xs transition';
      } else {
        btn.className = 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition';
      }
    }
  });
  renderAdminWorkspace();
}

function renderAdminWorkspace() {
  if (!currentAdmin) return;
  const staffBadge = document.getElementById('admin-active-staff-info');
  if (staffBadge) {
    staffBadge.textContent = `${currentAdmin.maNV} — ${currentAdmin.hoTen} (${currentAdmin.boPhan})`;
  }

  renderAdminDashboard();
  renderAdminBM1();
  renderAdminBM2();
  renderAdminBM3();
  renderAdminBM4();
  renderAdminReturnList();
  renderAdminReports();
  renderAdminQD5();
}

function renderAdminDashboard() {
  const totalBooks = db.sach.length;
  const availBooks = db.sach.filter(s => s.tinhTrang === 'Con').length;
  const borrowedBooks = totalBooks - availBooks;
  const totalRevenue = db.docGia.reduce((s, d) => s + Number(d.phiDangKy || 0), 0);

  const setTxt = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  setTxt('adm-kpi-books', totalBooks);
  setTxt('adm-kpi-avail', `${availBooks} trong kho / ${borrowedBooks} đang cho mượn`);
  setTxt('adm-kpi-readers', db.docGia.length);
  setTxt('adm-kpi-revenue', formatVND(totalRevenue));
  setTxt('adm-kpi-staff', db.nhanVien.length);
  setTxt('adm-kpi-loans', db.phieuMuon.length);
}

// --- BM1: NHÂN SỰ (QĐ1) ---
function renderAdminBM1() {
  const tbody = document.getElementById('bm1-table-body');
  if (!tbody) return;
  tbody.innerHTML = db.nhanVien.map(nv => `
    <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
      <td class="p-3 font-mono font-bold text-indigo-900">${nv.maNV}</td>
      <td class="p-3">
        <div class="font-bold text-slate-900">${nv.hoTen}</div>
        <div class="text-slate-500 text-[11px]">${nv.diaChi || 'TP.HCM'}</div>
      </td>
      <td class="p-3 text-slate-600">
        <div>${nv.ngaySinh}</div>
        <div class="font-mono text-[11px] text-indigo-700">${nv.dienThoai || '0901234567'}</div>
      </td>
      <td class="p-3"><span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold">${nv.bangCap}</span></td>
      <td class="p-3"><span class="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-900 font-bold">${nv.boPhan}</span></td>
      <td class="p-3 font-semibold text-slate-700">${nv.chucVu}</td>
      <td class="p-3 text-right">
        <button onclick="deleteStaff('${nv.maNV}')" class="text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function handleBM1Submit(e) {
  e.preventDefault();
  const hoTen = document.getElementById('bm1-name').value.trim();
  const diaChi = document.getElementById('bm1-address').value.trim();
  const ngaySinh = document.getElementById('bm1-dob').value;
  const dienThoai = document.getElementById('bm1-phone').value.trim();
  const bangCap = document.getElementById('bm1-degree').value;
  const boPhan = document.getElementById('bm1-dept').value;
  const chucVu = document.getElementById('bm1-role').value;

  const age = calculateAge(ngaySinh);
  if (age < 18 || age > 65) {
    showToast(`Ngày sinh nhân viên không hợp lệ (Tuổi hiện tại: ${age} tuổi, yêu cầu từ 18 đến 65 tuổi)!`, 'error');
    return;
  }
  if (!/^[0-9]{9,11}$/.test(dienThoai)) {
    showToast('Số điện thoại nhân viên phải gồm từ 9 đến 11 chữ số!', 'error');
    return;
  }

  const newCode = generateNextId(db.nhanVien, 'maNV', 'NV');
  db.nhanVien.push({
    maNV: newCode,
    taiKhoan: newCode.toLowerCase(),
    matKhau: '123456',
    hoTen,
    diaChi,
    ngaySinh,
    dienThoai,
    bangCap,
    boPhan,
    chucVu
  });
  saveDatabase();
  e.target.reset();
  showToast(`Đã lưu hồ sơ nhân viên ${newCode} — ${hoTen} (BM1 / QĐ1).`, 'success');
}

function deleteStaff(maNV) {
  if (db.nhanVien.length <= 1) {
    showToast('Không thể xóa toàn bộ nhân sự.', 'error');
    return;
  }
  db.nhanVien = db.nhanVien.filter(n => n.maNV !== maNV);
  saveDatabase();
  showToast(`Đã xóa nhân sự ${maNV}.`, 'info');
}

// --- BM2: THẺ ĐỘC GIẢ (QĐ2) ---
function renderAdminBM2() {
  const staffSelect = document.getElementById('bm2-staff');
  if (staffSelect) {
    const thuThuList = db.nhanVien.filter(n => n.boPhan === 'Thủ Thư');
    staffSelect.innerHTML = thuThuList.map(n => `<option value="${n.maNV}">${n.maNV} — ${n.hoTen}</option>`).join('');
  }

  const tbody = document.getElementById('bm2-table-body');
  if (!tbody) return;
  const today = new Date().toISOString().split('T')[0];

  tbody.innerHTML = db.docGia.map(dg => {
    const expired = dg.ngayHetHan < today;
    const thuThu = getStaffById(dg.nguoiLapThe);
    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
        <td class="p-3 font-mono font-bold text-indigo-900">${dg.maDocGia}</td>
        <td class="p-3">
          <div class="font-bold text-slate-900">${dg.hoTen}</div>
          <div class="text-slate-500">${dg.email}</div>
          <div class="text-[11px] text-slate-400">${dg.diaChi}</div>
        </td>
        <td class="p-3"><span class="px-2 py-1 rounded bg-slate-100 text-slate-800 font-bold">Loại ${dg.loaiDocGia}</span></td>
        <td class="p-3">${dg.ngaySinh} (${calculateAge(dg.ngaySinh)}t)</td>
        <td class="p-3">
          <div class="font-semibold text-slate-800">${dg.tenGoi || 'Chuẩn 6 Tháng'}</div>
          <div class="text-emerald-700 font-bold">${formatVND(dg.phiDangKy || 50000)}</div>
          <div class="text-[11px] text-indigo-700 font-medium">Người lập: ${thuThu ? thuThu.hoTen : dg.nguoiLapThe}</div>
        </td>
        <td class="p-3">
          <div class="font-mono">${dg.ngayLapThe} → <b>${dg.ngayHetHan}</b></div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${expired ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
            ${expired ? 'Hết hạn' : 'Còn hiệu lực'}
          </span>
        </td>
        <td class="p-3 text-right">
          <button onclick="deleteReader('${dg.maDocGia}')" class="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function handleBM2Submit(e) {
  e.preventDefault();
  const hoTen = document.getElementById('bm2-name').value.trim();
  const loaiDocGia = document.getElementById('bm2-type').value;
  const ngaySinh = document.getElementById('bm2-dob').value;
  const email = document.getElementById('bm2-email').value.trim();
  const diaChi = document.getElementById('bm2-address').value.trim();
  const ngayLapThe = document.getElementById('bm2-issue').value;
  const planId = document.getElementById('bm2-plan').value;
  const nguoiLapThe = document.getElementById('bm2-staff').value;

  if (!isValidGmail(email)) {
    showToast('Lỗi định dạng: Email bắt buộc phải có cấu trúc @gmail.com!', 'error');
    return;
  }

  const age = calculateAge(ngaySinh);
  if (age < db.thamSo.TuoiToiThieu || age > db.thamSo.TuoiToiDa) {
    showToast(`Vi phạm QĐ2: Độ tuổi độc giả (${age} tuổi) nằm ngoài khoảng ${db.thamSo.TuoiToiThieu}–${db.thamSo.TuoiToiDa} tuổi.`, 'error');
    return;
  }

  const plan = window.MEMBERSHIP_PLANS.find(p => p.id === planId) || window.MEMBERSHIP_PLANS[1];
  const ngayHetHan = addMonths(ngayLapThe, plan.months);
  const newCode = generateNextId(db.docGia, 'maDocGia', 'DG');

  db.docGia.push({
    maDocGia: newCode,
    hoTen,
    loaiDocGia,
    ngaySinh,
    diaChi,
    email,
    matKhau: '123456',
    ngayLapThe,
    ngayHetHan,
    goiDangKy: plan.id,
    tenGoi: plan.name,
    phiDangKy: plan.price,
    nguoiLapThe
  });

  saveDatabase();
  e.target.reset();
  initDefaultDates();
  showToast(`Đã cấp thẻ độc giả ${newCode} — ${hoTen} (BM2 / QĐ2).`, 'success');
}

function deleteReader(maDocGia) {
  const st = getReaderBorrowStatus(maDocGia);
  if (st.activeCount > 0) {
    showToast(`Độc giả ${maDocGia} đang mượn ${st.activeCount} quyển sách, không thể xóa hồ sơ.`, 'error');
    return;
  }
  db.docGia = db.docGia.filter(d => d.maDocGia !== maDocGia);
  saveDatabase();
  showToast(`Đã xóa thẻ độc giả ${maDocGia}.`, 'info');
}

// --- BM3: TIẾP NHẬN SÁCH MỚI (QĐ3) ---
function renderAdminBM3() {
  const staffSelect = document.getElementById('bm3-staff');
  if (staffSelect) {
    const thuKhoList = db.nhanVien.filter(n => n.boPhan === 'Thủ Kho');
    staffSelect.innerHTML = thuKhoList.map(n => `<option value="${n.maNV}">${n.maNV} — ${n.hoTen}</option>`).join('');
  }

  const tbody = document.getElementById('bm3-table-body');
  if (!tbody) return;
  tbody.innerHTML = db.sach.map(s => {
    const thuKho = getStaffById(s.nguoiTiepNhan);
    return `
    <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
      <td class="p-2.5 font-mono font-bold text-indigo-900">${s.maSach}</td>
      <td class="p-2.5">
        <div class="flex items-center gap-2.5">
          <img src="${s.hinhAnh}" class="w-9 h-12 object-cover rounded border" />
          <div>
            <div class="font-bold text-slate-900">${s.tenSach}</div>
            <div class="text-slate-500">${s.tacGia}</div>
          </div>
        </div>
      </td>
      <td class="p-2.5"><span class="px-2 py-1 rounded font-bold ${getCategoryBadgeClass(s.theLoai)}">Nhóm ${s.theLoai}</span></td>
      <td class="p-2.5">
        <div>${s.nhaXuatBan} (${s.namXuatBan})</div>
        <div class="text-[11px] text-slate-400">Nhập: ${s.ngayNhap} • Thủ kho: ${thuKho ? thuKho.hoTen : s.nguoiTiepNhan}</div>
      </td>
      <td class="p-2.5 font-bold text-slate-900">${formatVND(s.triGia)}</td>
      <td class="p-2.5">
        <span class="px-2 py-1 rounded text-[11px] font-bold ${s.tinhTrang === 'Con' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
          ${s.tinhTrang === 'Con' ? 'Còn sẵn' : 'Đang mượn'}
        </span>
      </td>
      <td class="p-2.5 text-right">
        <button onclick="deleteBook('${s.maSach}')" class="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `}).join('');
}

function handleBM3Submit(e) {
  e.preventDefault();
  const tenSach = document.getElementById('bm3-title').value.trim();
  const theLoai = document.getElementById('bm3-cat').value;
  const tacGia = document.getElementById('bm3-author').value.trim();
  const namXuatBan = Number(document.getElementById('bm3-year').value);
  const nhaXuatBan = document.getElementById('bm3-pub').value.trim();
  const triGia = Number(document.getElementById('bm3-price').value);
  const ngayNhap = document.getElementById('bm3-date').value;
  const nguoiTiepNhan = document.getElementById('bm3-staff').value;
  const hinhAnh = document.getElementById('bm3-image').value.trim() || 'images/nhom A/1794538676885_112601018615683622_3100374492545443504_b491343d78e50d1b905aada8e28e5f39.jpg';

  const currentYear = new Date().getFullYear();
  if (namXuatBan > currentYear) {
    showToast(`Vi phạm QĐ3: Năm xuất bản (${namXuatBan}) không được lớn hơn năm hiện tại (${currentYear}).`, 'error');
    return;
  }
  if (currentYear - namXuatBan > db.thamSo.KhoangCachNamXB) {
    showToast(`Vi phạm QĐ3: Năm xuất bản (${namXuatBan}) vượt quá giới hạn ${db.thamSo.KhoangCachNamXB} năm.`, 'error');
    return;
  }

  const newCode = generateNextId(db.sach, 'maSach', 'MS');
  db.sach.unshift({
    maSach: newCode,
    tenSach,
    theLoai,
    chuyenMuc: getCategoryLabel(theLoai),
    tacGia,
    namXuatBan,
    nhaXuatBan,
    ngayNhap,
    triGia,
    nguoiTiepNhan,
    tinhTrang: 'Con',
    hinhAnh
  });

  saveDatabase();
  e.target.reset();
  initDefaultDates();
  showToast(`Đã biên mục sách mới ${newCode} — "${tenSach}" (BM3 / QĐ3).`, 'success');
}

function deleteBook(maSach) {
  const b = getBookById(maSach);
  if (b && b.tinhTrang === 'DangMuon') {
    showToast('Tài liệu đang lưu thông, không thể xóa.', 'error');
    return;
  }
  db.sach = db.sach.filter(s => s.maSach !== maSach);
  saveDatabase();
  showToast(`Đã xóa sách ${maSach}.`, 'info');
}

// --- BM4: LẬP PHIẾU CHO MƯỢN SÁCH (QĐ4) & NHẬN TRẢ SÁCH ---
function renderAdminBM4() {
  const readerSel = document.getElementById('bm4-reader');
  const bookSel = document.getElementById('bm4-books');
  const staffSel = document.getElementById('bm4-staff');

  if (readerSel) {
    readerSel.innerHTML = db.docGia.map(d => `<option value="${d.maDocGia}">${d.maDocGia} — ${d.hoTen} (Hạn thẻ: ${d.ngayHetHan})</option>`).join('');
  }
  if (bookSel) {
    const avail = db.sach.filter(s => s.tinhTrang === 'Con');
    bookSel.innerHTML = avail.map(s => `<option value="${s.maSach}">${s.maSach} — [Nhóm ${s.theLoai}] ${s.tenSach} (${s.tacGia})</option>`).join('');
  }
  if (staffSel) {
    const thuThu = db.nhanVien.filter(n => n.boPhan === 'Thủ Thư');
    staffSel.innerHTML = thuThu.map(n => `<option value="${n.maNV}">${n.maNV} — ${n.hoTen}</option>`).join('');
  }
  renderBM4PreviewTable();
}

function renderBM4PreviewTable() {
  const bookSel = document.getElementById('bm4-books');
  const tbody = document.getElementById('bm4-preview-tbody');
  if (!bookSel || !tbody) return;
  const selectedIds = Array.from(bookSel.selectedOptions).map(o => o.value);
  if (selectedIds.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-400">Chọn sách ở danh sách trên để hiển thị vào biểu mẫu BM4</td></tr>`;
    return;
  }
  tbody.innerHTML = selectedIds.map((id, idx) => {
    const b = getBookById(id);
    if (!b) return '';
    return `
      <tr class="border-b border-slate-100">
        <td class="p-2.5 font-bold">${idx + 1}</td>
        <td class="p-2.5 font-mono font-bold text-indigo-900">${b.maSach}</td>
        <td class="p-2.5 font-semibold text-slate-900">${b.tenSach}</td>
        <td class="p-2.5 font-bold">Loại ${b.theLoai}</td>
        <td class="p-2.5 text-slate-600">${b.tacGia}</td>
      </tr>
    `;
  }).join('');
}

function handleBM4Submit(e) {
  e.preventDefault();
  const maDocGia = document.getElementById('bm4-reader').value;
  const ngayMuon = document.getElementById('bm4-borrow-date').value;
  const hanTra = document.getElementById('bm4-return-date').value;
  const nguoiChoMuon = document.getElementById('bm4-staff').value;
  const selectedOptions = Array.from(document.getElementById('bm4-books').selectedOptions).map(o => o.value);

  if (selectedOptions.length === 0) {
    showToast('Vui lòng chọn ít nhất 1 đầu sách để lập phiếu cho mượn.', 'error');
    return;
  }

  const reader = getReaderById(maDocGia);
  const st = getReaderBorrowStatus(maDocGia);

  if (reader.ngayHetHan < ngayMuon) {
    showToast(`Vi phạm QĐ4: Thẻ độc giả ${maDocGia} đã hết hạn ngày ${reader.ngayHetHan}.`, 'error');
    return;
  }
  if (st.overdueBooks.length > 0) {
    showToast(`Vi phạm QĐ4: Độc giả đang có ${st.overdueBooks.length} cuốn sách quá hạn chưa trả.`, 'error');
    return;
  }
  if (st.activeCount + selectedOptions.length > db.thamSo.SoSachMuonToiDa) {
    showToast(`Vi phạm QĐ4: Tổng số sách mượn vượt quá tối đa ${db.thamSo.SoSachMuonToiDa} quyển.`, 'error');
    return;
  }
  const daysRequested = diffDays(ngayMuon, hanTra);
  if (daysRequested <= 0 || daysRequested > db.thamSo.SoNgayMuonToiDa) {
    showToast(`Vi phạm QĐ4: Thời gian mượn (${daysRequested} ngày) không hợp lệ! Quy định từ 1 đến tối đa ${db.thamSo.SoNgayMuonToiDa} ngày.`, 'error');
    return;
  }

  const newId = generateNextId(db.phieuMuon, 'maPhieuMuon', 'PM');
  db.phieuMuon.unshift({
    maPhieuMuon: newId,
    maDocGia,
    ngayMuon,
    hanTra,
    nguoiChoMuon,
    ghiChu: 'Lập phiếu trực tiếp tại quầy Lưu thông (BM4)',
    chiTiet: selectedOptions.map(ms => ({ maSach: ms, tinhTrangMuon: 'DangMuon', ngayTra: null }))
  });

  selectedOptions.forEach(ms => {
    const b = getBookById(ms);
    if (b) b.tinhTrang = 'DangMuon';
  });

  saveDatabase();
  showToast(`Đã lập Phiếu cho mượn ${newId} cho độc giả ${reader.hoTen}.`, 'success');
}

function renderAdminReturnList() {
  const tbody = document.getElementById('admin-return-tbody');
  if (!tbody) return;
  const today = new Date().toISOString().split('T')[0];

  let rows = [];
  db.phieuMuon.forEach(pm => {
    const reader = getReaderById(pm.maDocGia);
    pm.chiTiet.forEach(ct => {
      const book = getBookById(ct.maSach);
      const daysLate = ct.tinhTrangMuon === 'DangMuon' ? Math.max(0, diffDays(pm.hanTra, today)) : 0;
      rows.push(`
        <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
          <td class="p-3 font-mono font-bold text-indigo-900">${pm.maPhieuMuon}</td>
          <td class="p-3">
            <div class="font-bold text-slate-900">${reader ? reader.hoTen : pm.maDocGia}</div>
            <div class="text-slate-500">Mã thẻ: ${pm.maDocGia}</div>
          </td>
          <td class="p-3">
            <div class="font-bold text-slate-900">${book ? book.tenSach : ct.maSach}</div>
            <div class="text-slate-500">Ký hiệu: ${ct.maSach}</div>
          </td>
          <td class="p-3 font-mono">${pm.ngayMuon}</td>
          <td class="p-3 font-mono font-bold ${daysLate > 0 ? 'text-rose-700' : 'text-emerald-700'}">${pm.hanTra}</td>
          <td class="p-3">
            ${ct.tinhTrangMuon === 'DaTra'
              ? `<span class="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">Đã trả (${ct.ngayTra})</span>`
              : daysLate > 0
                ? `<span class="px-2.5 py-1 rounded bg-rose-100 text-rose-800 font-bold">Quá hạn ${daysLate} ngày</span>`
                : `<span class="px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-bold">Đang lưu thông</span>`
            }
          </td>
          <td class="p-3 text-right">
            ${ct.tinhTrangMuon === 'DangMuon' ? `
              <button onclick="returnBookItem('${pm.maPhieuMuon}', '${ct.maSach}')" class="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                Nhận trả sách
              </button>
            ` : `<span class="text-slate-400">Hoàn tất</span>`}
          </td>
        </tr>
      `);
    });
  });

  tbody.innerHTML = rows.join('');
}

function returnBookItem(maPhieuMuon, maSach) {
  const pm = db.phieuMuon.find(p => p.maPhieuMuon === maPhieuMuon);
  if (!pm) return;
  const ct = pm.chiTiet.find(c => c.maSach === maSach && c.tinhTrangMuon === 'DangMuon');
  if (!ct) return;

  ct.tinhTrangMuon = 'DaTra';
  ct.ngayTra = new Date().toISOString().split('T')[0];

  const book = getBookById(maSach);
  if (book) book.tinhTrang = 'Con';

  saveDatabase();
  showToast(`Đã ghi nhận hoàn trả tài liệu "${book ? book.tenSach : maSach}".`, 'success');
}

// --- BM5 & BM6: BÁO CÁO THỐNG KÊ ---
function renderAdminReports() {
  const bm5Body = document.getElementById('bm5-tbody');
  const bm6Body = document.getElementById('bm6-tbody');
  if (!bm5Body || !bm6Body) return;

  const stats = { A: 0, B: 0, C: 0 };
  let totalBorrows = 0;

  db.phieuMuon.forEach(pm => {
    pm.chiTiet.forEach(ct => {
      const b = getBookById(ct.maSach);
      if (b && stats[b.theLoai] !== undefined) {
        stats[b.theLoai]++;
        totalBorrows++;
      }
    });
  });

  bm5Body.innerHTML = ['A', 'B', 'C'].map((cat, idx) => {
    const count = stats[cat];
    const ratio = totalBorrows > 0 ? ((count / totalBorrows) * 100).toFixed(1) : '0.0';
    const totalInStock = db.sach.filter(s => s.theLoai === cat).length;
    return `
      <tr class="border-b border-slate-100 text-xs">
        <td class="p-3 font-bold">${idx + 1}</td>
        <td class="p-3 font-bold text-slate-900">${getCategoryLabel(cat)} (${totalInStock} đầu sách)</td>
        <td class="p-3 text-center font-extrabold text-indigo-900">${count} lượt</td>
        <td class="p-3 text-right font-bold text-emerald-700">${ratio}%</td>
      </tr>
    `;
  }).join('');

  const today = new Date().toISOString().split('T')[0];
  let overdueRows = [];
  let stt = 1;
  db.phieuMuon.forEach(pm => {
    pm.chiTiet.forEach(ct => {
      if (ct.tinhTrangMuon === 'DangMuon') {
        const late = diffDays(pm.hanTra, today);
        if (late > 0) {
          const b = getBookById(ct.maSach);
          const dg = getReaderById(pm.maDocGia);
          overdueRows.push(`
            <tr class="border-b border-slate-100 text-xs">
              <td class="p-3 font-bold">${stt++}</td>
              <td class="p-3 font-bold text-slate-900">${b ? b.tenSach : ct.maSach} (${ct.maSach})</td>
              <td class="p-3">${dg ? dg.hoTen : pm.maDocGia} (${pm.maDocGia})</td>
              <td class="p-3 font-mono">${pm.ngayMuon} (Hạn: ${pm.hanTra})</td>
              <td class="p-3 text-right font-extrabold text-rose-700">${late} ngày</td>
            </tr>
          `);
        }
      }
    });
  });

  bm6Body.innerHTML = overdueRows.length > 0
    ? overdueRows.join('')
    : `<tr><td colspan="5" class="p-6 text-center text-emerald-700 font-semibold text-xs">Hiện không có tài liệu nào quá hạn trả.</td></tr>`;
}

// --- QĐ5: THAY ĐỔI QUY ĐỊNH ---
function renderAdminQD5() {
  const t = db.thamSo;
  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v;
  };
  setVal('qd5-min-age', t.TuoiToiThieu);
  setVal('qd5-max-age', t.TuoiToiDa);
  setVal('qd5-card-months', t.ThoiHanTheThang);
  setVal('qd5-pub-years', t.KhoangCachNamXB);
  setVal('qd5-max-books', t.SoSachMuonToiDa);
  setVal('qd5-max-days', t.SoNgayMuonToiDa);
}

function handleQD5Submit(e) {
  e.preventDefault();
  db.thamSo.TuoiToiThieu = Number(document.getElementById('qd5-min-age').value);
  db.thamSo.TuoiToiDa = Number(document.getElementById('qd5-max-age').value);
  db.thamSo.ThoiHanTheThang = Number(document.getElementById('qd5-card-months').value);
  db.thamSo.KhoangCachNamXB = Number(document.getElementById('qd5-pub-years').value);
  db.thamSo.SoSachMuonToiDa = Number(document.getElementById('qd5-max-books').value);
  db.thamSo.SoNgayMuonToiDa = Number(document.getElementById('qd5-max-days').value);
  saveDatabase();
  showToast('Đã lưu thiết lập Tham số Quy định thư viện (QĐ5).', 'success');
}

function initDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  const setDate = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  setDate('reg-issue-date', today);
  setDate('reg-expire-date', addMonths(today, 6));
  setDate('bm2-issue', today);
  setDate('bm3-date', today);
  setDate('bm4-borrow-date', today);
  setDate('bm4-return-date', addDays(today, db.thamSo.SoNgayMuonToiDa));
  setDate('drawer-borrow-date', today);
  setDate('drawer-return-date', addDays(today, db.thamSo.SoNgayMuonToiDa));
}

window.addEventListener('DOMContentLoaded', () => {
  initDefaultDates();
  refreshUI();
});
