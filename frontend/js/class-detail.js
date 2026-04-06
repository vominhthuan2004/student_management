// frontend/js/class-detail.js
const API = 'http://localhost:3000/api';
const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('classId');

let students = []; // lưu danh sách sinh viên
let attendanceStatusMap = {}; // lưu trạng thái điểm danh theo studentId

// Kiểm tra classId
if (!classId) {
    alert('Thiếu thông tin lớp');
    window.location.href = 'classes.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadClassInfo();
    await loadStudents();
    await loadAttendanceHistory(); // lịch sử điểm danh (tab thứ 3)
    
    // Lắng nghe sự kiện thay đổi ngày
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        dateInput.addEventListener('change', async () => {
            await loadAttendanceStatusForCurrentDate();
            renderStudentList(students, attendanceStatusMap);
        });
    }
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
        // Sau khi có danh sách sinh viên, lấy trạng thái điểm danh cho ngày hiện tại
        await loadAttendanceStatusForCurrentDate();
        renderStudentList(students, attendanceStatusMap);
    } catch (error) {
        console.error('Lỗi tải danh sách sinh viên:', error);
        alert('Không thể tải danh sách sinh viên');
    }
}

// Lấy trạng thái điểm danh theo classId và ngày (date từ input)
async function loadAttendanceStatusForCurrentDate() {
    const dateInput = document.getElementById('attendanceDate');
    let date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    if (!date) {
        date = new Date().toISOString().split('T')[0];
    }
    try {
        const res = await axios.get(`${API}/attendances/class/${classId}?date=${date}`);
        // Tạo map: studentId -> status
        const newMap = {};
        res.data.forEach(att => {
            // att.studentId có thể là object hoặc string, lấy _id
            const studentId = att.studentId?._id || att.studentId;
            if (studentId) newMap[studentId] = att.status;
        });
        attendanceStatusMap = newMap;
    } catch (error) {
        console.error('Lỗi tải trạng thái điểm danh:', error);
        attendanceStatusMap = {};
    }
}

// Hiển thị danh sách sinh viên với trạng thái điểm danh
function renderStudentList(students, statusMap) {
    const tbody = document.getElementById('studentList');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Lớp chưa có sinh viên</td></tr>';
        return;
    }

    students.forEach((student, index) => {
        const status = statusMap[student._id] || 'absent'; // mặc định vắng
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.studentCode}</td>
            <td>${student.fullName}</td>
            <td>
                <select class="form-select attendance-status" data-student-id="${student._id}">
                    <option value="present" ${status === 'present' ? 'selected' : ''}>Có mặt</option>
                    <option value="absent" ${status === 'absent' ? 'selected' : ''}>Vắng</option>
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

    const dateInput = document.getElementById('attendanceDate');
    let date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    if (!date) {
        date = new Date().toISOString().split('T')[0];
    }
    // Chuyển đổi date thành ISO string để gửi lên backend
    const isoDate = new Date(date).toISOString();

    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API}/attendances/manual`, {
            classId,
            date: isoDate,
            attendanceList
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Điểm danh thành công!');
        // Cập nhật lại trạng thái điểm danh cho ngày hiện tại
        await loadAttendanceStatusForCurrentDate();
        renderStudentList(students, attendanceStatusMap);
        await loadAttendanceHistory(); // refresh lịch sử (tab thứ 3)
    } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || 'Lỗi khi lưu điểm danh');
    }
};

// Tạo mã điểm danh
window.generateCode = async function () {
    const expiry = document.getElementById('expiryMinutes').value;
    try {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API}/attendances/generate-code`, {
            classId,
            expiryMinutes: parseInt(expiry)
        }, {
            headers: { Authorization: `Bearer ${token}` }
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

// Load lịch sử điểm danh của lớp (tab thứ 3)
async function loadAttendanceHistory() {
    try {
        const res = await axios.get(`${API}/attendances/class/${classId}`);
        const tbody = document.getElementById('historyList');
        if (!tbody) return;
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