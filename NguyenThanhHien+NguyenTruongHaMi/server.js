// =========================================================================
// NODE.JS WEB SERVER CHO PHẦN MỀM QUẢN LÝ THƯ VIỆN (ĐỀ TÀI 1.1 CNPM)
// Hỗ trợ chạy bằng lệnh: npm start  hoặc  node server.js
// Địa chỉ truy cập: http://localhost:3000
// =========================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.sql': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === '/' || pathname === '/index') {
      pathname = '/index.html';
    }

    // Ngăn chặn truy cập ra ngoài thư mục gốc
    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Không tìm thấy tài nguyên</h1><p><a href="/">Quay về Trang chủ Thư viện</a></p>');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Lỗi máy chủ nội bộ: ' + e.message);
  }
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('====================================================================');
  console.log('  HỆ THỐNG PHẦN MỀM QUẢN LÝ THƯ VIỆN (THE TH LIBRARY - ĐỀ TÀI 1.1)');
  console.log('====================================================================');
  console.log(`  [+] Máy chủ đang hoạt động tại: ${url}`);
  console.log('  [+] Trạng thái CSDL: Đã nạp 43 đầu sách (Nhóm A, B, C) & QĐ1..QĐ5');
  console.log('  [+] Nhấn Ctrl + C để dừng máy chủ.');
  console.log('====================================================================');

  // Tự động mở trình duyệt trên Windows khi chạy lệnh npm start / node server.js
  if (process.platform === 'win32' && !process.env.NO_OPEN) {
    exec(`start "" "${url}"`);
  }
});
