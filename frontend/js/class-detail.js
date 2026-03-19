// frontend/js/class-detail.js
const API = 'http://localhost:3000/api';
const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('classId');

let students = []; // lưu danh sách sinh viên

// Kiểm tra classId
if (!classId) {
    alert('Thiếu thông tin lớp');
    window.location.href = 'classes.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    // Set ngày hiện tại cho input date
    document.getElementById('attendanceDate').valueAsDate = new Date();
    await loadClassInfo();
    await loadStudents();
    await loadAttendanceHistory(); // load lịch sử cho tab thứ 3
});

// Lấy thông tin lớp
async function loadClassInfo() {
    try {
        const res = await axios.get(`${API}/classes/${classId}`);
        document.getElementById('className').textContent = res.data.className;
        document.getElementById('classCode').textContent = res.data.classCode;
    } catch (error) {
        console.error('Lỗi tải thông tin lớp:', error);
    }
}

// Lấy danh sách sinh viên trong lớp
async function loadStudents() {
    try {
        const res = await axios.get(`${API}/classes/students/${classId}`);
        students = res.data;
        renderStudentList(students);
    } catch (error) {
        console.error('Lỗi tải danh sách sinh viên:', error);
        alert('Không thể tải danh sách sinh viên');
    }
}

// Hiển thị danh sách sinh viên trong tab điểm danh thủ công
function renderStudentList(students) {
    const tbody = document.getElementById('studentList');
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Lớp chưa có sinh viên</td></tr>';
        return;
    }

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.studentCode}</td>
            <td>${student.fullName}</td>
            <td>
                <select class="form-select attendance-status" data-student-id="${student._id}">
                    <option value="present">Có mặt</option>
                    <option value="absent" selected>Vắng</option>
                </select>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Gửi điểm danh thủ công
window.submitManualAttendance = async function () {
    const attendanceList = [];
    document.querySelectorAll('.attendance-status').forEach(select => {
        attendanceList.push({
            studentId: select.dataset.studentId,
            status: select.value
        });
    });

    const dateInput = document.getElementById('attendanceDate').value;
    const date = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();

    try {
        await axios.post(`${API}/attendances/manual`, {
            classId,
            date,
            attendanceList
        });
        alert('Điểm danh thành công!');
        await loadAttendanceHistory(); // refresh lịch sử
    } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || 'Lỗi khi lưu điểm danh');
    }
};

// Tạo mã điểm danh
window.generateCode = async function () {
    const expiry = document.getElementById('expiryMinutes').value;
    try {
        const res = await axios.post(`${API}/attendances/generate-code`, {
            classId,
            expiryMinutes: parseInt(expiry)
        });
        const code = res.data.code;
        document.getElementById('codeDisplay').textContent = code;
        document.getElementById('generatedCode').style.display = 'block';

        // Tạo QR code (link cho sinh viên quét)
        new QRCode(document.getElementById('qrCode'), {
            text: `${window.location.origin}/frontend/student/checkin.html?code=${code}`,
            width: 200,
            height: 200
        });
    } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || 'Lỗi tạo mã');
    }
};

// Load lịch sử điểm danh của lớp
async function loadAttendanceHistory() {
    try {
        const res = await axios.get(`${API}/attendances/class/${classId}`);
        const tbody = document.getElementById('historyList');
        tbody.innerHTML = '';

        if (res.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Chưa có lịch sử điểm danh</td></tr>';
            return;
        }

        res.data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(item.date).toLocaleDateString('vi-VN')}</td>
                <td>${item.studentId?.fullName || item.studentId || 'N/A'}</td>
                <td>${item.status === 'present' ? '✅ Có mặt' : '❌ Vắng'}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Lỗi tải lịch sử điểm danh:', error);
    }
}