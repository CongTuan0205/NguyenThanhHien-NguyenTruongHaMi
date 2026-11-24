// validation.js - Hỗ trợ kiểm tra nhanh quy định ở Client-side

document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra BM2: Thẻ độc giả (QĐ2: Tuổi từ 18 đến 55, Bộ phận người lập, Cấu trúc Email @gmail.com)
    const formDocGia = document.getElementById('formDocGia');
    if (formDocGia) {
        formDocGia.addEventListener('submit', (e) => {
            const ngaySinhVal = document.getElementById('ngaySinh').value;
            const ngayLapVal = document.getElementById('ngayLapThe').value;
            const selectNV = document.getElementById('maNVLap');
            const emailInput = document.querySelector('input[name="email"]') || document.getElementById('email');

            if (emailInput && emailInput.value.trim()) {
                const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
                if (!gmailRegex.test(emailInput.value.trim())) {
                    e.preventDefault();
                    alert('[Lỗi Email] Email bắt buộc phải có cấu trúc đuôi @gmail.com (Ví dụ: nguyenvana@gmail.com)!');
                    emailInput.focus();
                    return;
                }
            }

            if (ngaySinhVal && ngayLapVal) {
                const birth = new Date(ngaySinhVal);
                const issue = new Date(ngayLapVal);
                let age = issue.getFullYear() - birth.getFullYear();
                const m = issue.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && issue.getDate() < birth.getDate())) {
                    age--;
                }

                if (age < 18 || age > 55) {
                    e.preventDefault();
                    alert(`[QĐ2 Cảnh báo] Tuổi độc giả phải từ 18 đến 55 tuổi! (Hiện tại: ${age} tuổi)`);
                    return;
                }
            }

            if (selectNV) {
                const selectedOption = selectNV.options[selectNV.selectedIndex];
                const boPhan = selectedOption.getAttribute('data-bophan');
                if (boPhan && boPhan !== 'Thủ Thư') {
                    e.preventDefault();
                    alert(`[QĐ2 Cảnh báo] Người lập thẻ độc giả phải là nhân viên thuộc bộ phận "Thủ Thư"! (Bạn vừa chọn bộ phận: "${boPhan}")`);
                    return;
                }
            }
        });
    }

    // 2. Kiểm tra BM3: Tiếp nhận sách (QĐ3: Năm xuất bản trong vòng 8 năm, Người nhận là Thủ Kho)
    const formSach = document.getElementById('formSach');
    if (formSach) {
        formSach.addEventListener('submit', (e) => {
            const namXB = parseInt(document.getElementById('namXuatBan').value, 10);
            const ngayNhapVal = document.getElementById('ngayNhap').value;
            const selectNV = document.getElementById('maNVTiepNhan');

            if (namXB && ngayNhapVal) {
                const namNhap = new Date(ngayNhapVal).getFullYear();
                if (namXB > namNhap) {
                    e.preventDefault();
                    alert(`[QĐ3 Cảnh báo] Năm xuất bản (${namXB}) không được lớn hơn năm tiếp nhận (${namNhap})!`);
                    return;
                }
                if (namNhap - namXB > 8) {
                    e.preventDefault();
                    alert(`[QĐ3 Cảnh báo] Chỉ nhận các sách xuất bản trong vòng 8 năm! (${namNhap} - ${namXB} = ${namNhap - namXB} năm > 8 năm)`);
                    return;
                }
            }

            if (selectNV) {
                const selectedOption = selectNV.options[selectNV.selectedIndex];
                const boPhan = selectedOption.getAttribute('data-bophan');
                if (boPhan && boPhan !== 'Thủ Kho') {
                    e.preventDefault();
                    alert(`[QĐ3 Cảnh báo] Người nhận sách phải là nhân viên thuộc bộ phận "Thủ Kho"! (Bạn vừa chọn bộ phận: "${boPhan}")`);
                    return;
                }
            }
        });
    }

    // 3. Kiểm tra BM4: Mượn sách (QĐ4: Tối đa 5 cuốn)
    const formMuonSach = document.getElementById('formMuonSach');
    if (formMuonSach) {
        formMuonSach.addEventListener('submit', (e) => {
            const checkboxes = document.querySelectorAll('input[name="maSach"]:checked');
            if (checkboxes.length === 0) {
                e.preventDefault();
                alert('Vui lòng tích chọn ít nhất 1 quyển sách để mượn!');
                return;
            }
            if (checkboxes.length > 5) {
                e.preventDefault();
                alert(`[QĐ4 Cảnh báo] Mỗi lần mượn tối đa 5 quyển sách! (Bạn đang chọn ${checkboxes.length} quyển)`);
                return;
            }
        });
    }
});
