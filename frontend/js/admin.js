// frontend/js/admin.js
const API = 'http://localhost:3000/api';

// Lấy token và kiểm tra role
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
if (!token || role !== 'admin') {
  window.location.href = '../login.html';
}

// Cấu hình axios mặc định gửi token
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// ========== Xử lý menu ==========
document.querySelectorAll('.sidebar .nav-link[data-page]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    const page = this.getAttribute('data-page');
    loadPage(page);
  });
});

async function loadPage(page) {
  const container = document.getElementById('mainContent');
  if (page === 'students') await renderStudentsPage(container);
  else if (page === 'classes') await renderClassesPage(container);
  else if (page === 'teachers') await renderTeachersPage(container);
  else if (page === 'schedule') await renderSchedulePage(container);
  else if (page === 'exams') await renderExamsPage(container);
}

// ========== 1. Quản lý sinh viên ==========
async function renderStudentsPage(container) {
  container.innerHTML = `
    <div class="card shadow-sm p-4">
      <h4><i class="bi bi-people"></i> Quản lý sinh viên</h4>
      <form id="studentForm" class="mb-3">
        <div class="row g-2">
          <div class="col-md-2"><input type="text" id="studentCode" class="form-control" placeholder="Mã SV" required></div>
          <div class="col-md-3"><input type="text" id="fullName" class="form-control" placeholder="Họ tên" required></div>
          <div class="col-md-2"><input type="email" id="email" class="form-control" placeholder="Email"></div>
          <div class="col-md-2"><input type="text" id="phone" class="form-control" placeholder="SĐT"></div>
          <div class="col-md-2">
            <select id="classId" class="form-select" required><option value="">Chọn lớp</option></select>
          </div>
          <div class="col-md-1"><button type="button" class="btn btn-primary" onclick="createStudent()">Thêm</button></div>
        </div>
      </form>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead class="table-light">
            <tr><th>Mã SV</th><th>Họ tên</th><th>Email</th><th>Lớp</th><th>Hành động</th> </tr>
          </thead>
          <tbody id="studentTable"></tbody>
        </table>
      </div>
    </div>
  `;
  await loadClassSelectForStudent();
  await loadStudents();
}

async function loadClassSelectForStudent() {
  try {
    const res = await axios.get(`${API}/classes`);
    const select = document.getElementById('classId');
    select.innerHTML = '<option value="">Chọn lớp</option>';
    res.data.forEach(c => {
      select.innerHTML += `<option value="${c._id}">${c.className} (${c.classCode})</option>`;
    });
  } catch (err) { console.error(err); }
}

async function loadStudents() {
  try {
    const res = await axios.get(`${API}/students`);
    const tbody = document.getElementById('studentTable');
    tbody.innerHTML = '';
    res.data.forEach(s => {
      tbody.innerHTML += `
        <tr>
          <td>${s.studentCode} </td>
          <td>${s.fullName} </td>
          <td>${s.email || ''} </td>
          <td>${s.classId?.className || ''} </td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteStudent('${s._id}')">Xóa</button> </td>
         </tr>
      `;
    });
  } catch (err) { console.error(err); }
}

window.createStudent = async function() {
  const studentCode = document.getElementById('studentCode').value;
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const classId = document.getElementById('classId').value;
  if (!studentCode || !fullName || !classId) {
    alert('Vui lòng nhập đủ Mã SV, Họ tên và Lớp');
    return;
  }
  try {
    await axios.post(`${API}/students`, { studentCode, fullName, email, phone, classId });
    await loadStudents();
    document.getElementById('studentForm').reset();
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi tạo sinh viên');
  }
};

window.deleteStudent = async function(id) {
  if (!confirm('Xóa sinh viên này?')) return;
  try {
    await axios.delete(`${API}/students/${id}`);
    await loadStudents();
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi xóa');
  }
};

// ========== 2. Quản lý lớp học ==========
async function renderClassesPage(container) {
  container.innerHTML = `
    <div class="card shadow-sm p-4">
      <h4><i class="bi bi-building"></i> Quản lý lớp học</h4>
      <form id="classForm" class="mb-3">
        <div class="row g-2">
          <div class="col-md-3"><input type="text" id="classCode" class="form-control" placeholder="Mã lớp" required></div>
          <div class="col-md-4"><input type="text" id="className" class="form-control" placeholder="Tên lớp" required></div>
          <div class="col-md-2"><input type="text" id="major" class="form-control" placeholder="Ngành"></div>
          <div class="col-md-2"><input type="number" id="year" class="form-control" placeholder="Năm học"></div>
          <div class="col-md-1"><button type="button" class="btn btn-primary" onclick="createClass()">Thêm</button></div>
        </div>
      </form>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead class="table-light">
            <tr><th>Mã lớp</th><th>Tên lớp</th><th>Ngành</th><th>Năm</th><th>Hành động</th> </tr>
          </thead>
          <tbody id="classTable"></tbody>
        </table>
      </div>
    </div>
  `;
  await loadClasses();
}

async function loadClasses() {
  try {
    const res = await axios.get(`${API}/classes`);
    const tbody = document.getElementById('classTable');
    tbody.innerHTML = '';
    res.data.forEach(c => {
      tbody.innerHTML += `
        <tr>
          <td>${c.classCode} </td>
          <td>${c.className} </td>
          <td>${c.major || ''} </td>
          <td>${c.year || ''} </td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteClass('${c._id}')">Xóa</button> </td>
         </tr>
      `;
    });
  } catch (err) { console.error(err); }
}

window.createClass = async function() {
  const classCode = document.getElementById('classCode').value;
  const className = document.getElementById('className').value;
  const major = document.getElementById('major').value;
  const year = document.getElementById('year').value;
  if (!classCode || !className) {
    alert('Vui lòng nhập Mã lớp và Tên lớp');
    return;
  }
  try {
    await axios.post(`${API}/classes`, { classCode, className, major, year, teacherId: null });
    await loadClasses();
    document.getElementById('classForm').reset();
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi tạo lớp');
  }
};

window.deleteClass = async function(id) {
  if (!confirm('Xóa lớp này? Sinh viên trong lớp sẽ bị ảnh hưởng!')) return;
  try {
    await axios.delete(`${API}/classes/${id}`);
    await loadClasses();
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi xóa lớp');
  }
};

// ========== 3. Quản lý giáo viên ==========
async function renderTeachersPage(container) {
  container.innerHTML = `
    <div class="card shadow-sm p-4">
      <h4><i class="bi bi-person-badge"></i> Quản lý giáo viên</h4>
      <form id="teacherForm" class="mb-3">
        <div class="row g-2">
          <div class="col-md-4"><input type="text" id="username" class="form-control" placeholder="Tên đăng nhập" required></div>
          <div class="col-md-4"><input type="password" id="password" class="form-control" placeholder="Mật khẩu" required></div>
          <div class="col-md-2"><button type="button" class="btn btn-primary" onclick="createTeacher()">Tạo tài khoản</button></div>
        </div>
      </form>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead class="table-light">
            <tr><th>Tên đăng nhập</th><th>Vai trò</th><th>Ngày tạo</th><th>Hành động</th> </tr>
          </thead>
          <tbody id="teacherTable"></tbody>
        </table>
      </div>
    </div>
  `;
  await loadTeachers();
}

async function loadTeachers() {
  try {
    const res = await axios.get(`${API}/users`);
    const teachers = res.data.filter(u => u.role === 'teacher');
    const tbody = document.getElementById('teacherTable');
    tbody.innerHTML = '';
    teachers.forEach(t => {
      tbody.innerHTML += `
        <tr>
          <td>${t.username} </td>
          <td>${t.role} </td>
          <td>${new Date(t.createdAt).toLocaleDateString('vi-VN')} </td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteTeacher('${t._id}')">Xóa</button> </td>
         </tr>
      `;
    });
  } catch (err) { console.error(err); }
}

window.createTeacher = async function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (!username || !password) {
    alert('Vui lòng nhập tên đăng nhập và mật khẩu');
    return;
  }
  try {
    await axios.post(`${API}/users/register`, { username, password, role: 'teacher' });
    await loadTeachers();
    document.getElementById('teacherForm').reset();
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi tạo tài khoản');
  }
};

window.deleteTeacher = async function(id) {
  if (!confirm('Xóa tài khoản giáo viên này?')) return;
  try {
    await axios.delete(`${API}/users/${id}`);
    await loadTeachers();
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi xóa');
  }
};

// ========== 4. Quản lý thời khóa biểu ==========
let currentScheduleModal = null;

async function renderSchedulePage(container) {
  container.innerHTML = `
    <div class="card shadow-sm p-4">
      <h4><i class="bi bi-calendar-week"></i> Quản lý thời khóa biểu</h4>
      <button class="btn btn-primary mb-3 w-auto" onclick="showScheduleForm()">+ Thêm mới</button>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead class="table-light">
            <tr><th>Lớp</th><th>Môn</th><th>Thứ</th><th>Giờ bắt đầu</th><th>Giờ kết thúc</th><th>Phòng</th><th>GV</th><th>Hành động</th> </tr>
          </thead>
          <tbody id="scheduleList"></tbody>
        </table>
      </div>
    </div>
    <div id="scheduleModal" class="modal fade" tabindex="-1"></div>
  `;
  await loadSchedules();
}

async function loadSchedules() {
  try {
    const res = await axios.get(`${API}/schedules`);
    console.log('Schedule data:', res.data);
    const tbody = document.getElementById('scheduleList');
    tbody.innerHTML = '';
    const days = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    res.data.forEach(s => {
      if (!s._id) {
        console.warn('Missing _id', s);
        return;
      }
      tbody.innerHTML += `
        <tr>
          <td>${s.classId?.className || s.classId} </td>
          <td>${s.subject} </td>
          <td>${days[s.dayOfWeek]} </td>
          <td>${s.startTime} </td>
          <td>${s.endTime} </td>
          <td>${s.room || ''} </td>
          <td>${s.teacher || ''} </td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editSchedule('${s._id}')">Sửa</button>
            <button class="btn btn-sm btn-danger" onclick="deleteSchedule('${s._id}')">Xóa</button>
           </td>
         </tr>
      `;
    });
  } catch (err) { console.error(err); }
}

window.editSchedule = async (id) => {
  await showScheduleForm(id);
};

window.showScheduleForm = async (id = null) => {
  // Chuyển đổi id hợp lệ
  const validId = (id && id !== 'null' && id !== 'undefined') ? id : null;
  // Lấy danh sách lớp
  let classes = [];
  try {
    const res = await axios.get(`${API}/classes`);
    classes = res.data;
  } catch (err) { console.error(err); }

  const formHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header"><h5>${validId ? 'Sửa' : 'Thêm'} thời khóa biểu</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">
          <form id="scheduleForm">
            <div class="mb-2"><label>Lớp</label><select name="classId" class="form-select" required>${classes.map(c => `<option value="${c._id}">${c.className}</option>`).join('')}</select></div>
            <div class="mb-2"><label>Môn học</label><input name="subject" class="form-control" required></div>
            <div class="mb-2"><label>Thứ (2-8)</label><input name="dayOfWeek" type="number" min="2" max="8" class="form-control" required></div>
            <div class="mb-2"><label>Giờ bắt đầu (HH:MM)</label><input name="startTime" class="form-control" required></div>
            <div class="mb-2"><label>Giờ kết thúc</label><input name="endTime" class="form-control" required></div>
            <div class="mb-2"><label>Phòng</label><input name="room" class="form-control"></div>
            <div class="mb-2"><label>Giảng viên</label><input name="teacher" class="form-control"></div>
          </form>
        </div>
        <div class="modal-footer"><button class="btn btn-primary" onclick="saveSchedule('${validId}')">Lưu</button><button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button></div>
      </div>
    </div>
  `;
  const modalDiv = document.getElementById('scheduleModal');
  modalDiv.innerHTML = formHTML;
  currentScheduleModal = new bootstrap.Modal(modalDiv);
  currentScheduleModal.show();

  if (validId) {
    try {
      const res = await axios.get(`${API}/schedules/${validId}`);
      const data = res.data;
      const form = document.getElementById('scheduleForm');
      form.classId.value = data.classId._id;
      form.subject.value = data.subject;
      form.dayOfWeek.value = data.dayOfWeek;
      form.startTime.value = data.startTime;
      form.endTime.value = data.endTime;
      form.room.value = data.room || '';
      form.teacher.value = data.teacher || '';
    } catch (err) {
      console.error('Lỗi lấy dữ liệu schedule', err);
      alert('Không thể tải dữ liệu');
    }
  }
};

window.saveSchedule = async (id) => {
  const form = document.getElementById('scheduleForm');
  if (!form) return;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  // Kiểm tra dữ liệu bắt buộc
  if (!data.classId || !data.subject || !data.dayOfWeek || !data.startTime || !data.endTime) {
    alert('Vui lòng điền đầy đủ thông tin');
    return;
  }
  try {
    if (id && id !== 'null' && id !== 'undefined') {
      await axios.put(`${API}/schedules/${id}`, data);
    } else {
      await axios.post(`${API}/schedules`, data);
    }
    if (currentScheduleModal) currentScheduleModal.hide();
    await loadSchedules();
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi lưu');
  }
};

window.deleteSchedule = async (id) => {
  if (!confirm('Xóa thời khóa biểu này?')) return;
  try {
    await axios.delete(`${API}/schedules/${id}`);
    await loadSchedules();
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi xóa');
  }
};

// ========== 5. Quản lý lịch thi ==========
let currentExamModal = null;

async function renderExamsPage(container) {
  container.innerHTML = `
    <div class="card shadow-sm p-4">
      <h4><i class="bi bi-pencil-square"></i> Quản lý lịch thi</h4>
      <button class="btn btn-primary mb-3 w-auto" onclick="showExamForm()">+ Thêm mới</button>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead class="table-light">
            <tr><th>Lớp</th><th>Môn</th><th>Ngày thi</th><th>Giờ</th><th>Phòng</th><th>Ghi chú</th><th>Hành động</th> </tr>
          </thead>
          <tbody id="examList"></tbody>
        </table>
      </div>
    </div>
    <div id="examModal" class="modal fade" tabindex="-1"></div>
  `;
  await loadExams();
}

async function loadExams() {
  try {
    const res = await axios.get(`${API}/exams`);
    const tbody = document.getElementById('examList');
    tbody.innerHTML = '';
    res.data.forEach(e => {
      if (!e._id) return;
      const examDate = new Date(e.examDate).toLocaleDateString('vi-VN');
      tbody.innerHTML += `
        <tr>
          <td>${e.classId?.className || e.classId} </td>
          <td>${e.subject} </td>
          <td>${examDate} </td>
          <td>${e.startTime} - ${e.endTime} </td>
          <td>${e.room || ''} </td>
          <td>${e.note || ''} </td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editExam('${e._id}')">Sửa</button>
            <button class="btn btn-sm btn-danger" onclick="deleteExam('${e._id}')">Xóa</button>
           </td>
         </tr>
      `;
    });
  } catch (err) { console.error(err); }
}

window.editExam = async (id) => {
  await showExamForm(id);
};

window.showExamForm = async (id = null) => {
  const validId = (id && id !== 'null' && id !== 'undefined') ? id : null;
  let classes = [];
  try {
    const res = await axios.get(`${API}/classes`);
    classes = res.data;
  } catch (err) { console.error(err); }

  const formHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header"><h5>${validId ? 'Sửa' : 'Thêm'} lịch thi</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">
          <form id="examForm">
            <div class="mb-2"><label>Lớp</label><select name="classId" class="form-select" required>${classes.map(c => `<option value="${c._id}">${c.className}</option>`).join('')}</select></div>
            <div class="mb-2"><label>Môn học</label><input name="subject" class="form-control" required></div>
            <div class="mb-2"><label>Ngày thi</label><input name="examDate" type="date" class="form-control" required></div>
            <div class="mb-2"><label>Giờ bắt đầu (HH:MM)</label><input name="startTime" class="form-control" required></div>
            <div class="mb-2"><label>Giờ kết thúc</label><input name="endTime" class="form-control" required></div>
            <div class="mb-2"><label>Phòng</label><input name="room" class="form-control"></div>
            <div class="mb-2"><label>Ghi chú</label><input name="note" class="form-control"></div>
          </form>
        </div>
        <div class="modal-footer"><button class="btn btn-primary" onclick="saveExam('${validId}')">Lưu</button><button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button></div>
      </div>
    </div>
  `;
  const modalDiv = document.getElementById('examModal');
  modalDiv.innerHTML = formHTML;
  currentExamModal = new bootstrap.Modal(modalDiv);
  currentExamModal.show();

  if (validId) {
    try {
      const res = await axios.get(`${API}/exams/${validId}`);
      const data = res.data;
      const form = document.getElementById('examForm');
      form.classId.value = data.classId._id;
      form.subject.value = data.subject;
      form.examDate.value = data.examDate.split('T')[0];
      form.startTime.value = data.startTime;
      form.endTime.value = data.endTime;
      form.room.value = data.room || '';
      form.note.value = data.note || '';
    } catch (err) {
      console.error('Lỗi lấy dữ liệu exam', err);
      alert('Không thể tải dữ liệu');
    }
  }
};

window.saveExam = async (id) => {
  const form = document.getElementById('examForm');
  if (!form) return;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  if (!data.classId || !data.subject || !data.examDate || !data.startTime || !data.endTime) {
    alert('Vui lòng điền đầy đủ thông tin');
    return;
  }
  try {
    if (id && id !== 'null' && id !== 'undefined') {
      await axios.put(`${API}/exams/${id}`, data);
    } else {
      await axios.post(`${API}/exams`, data);
    }
    if (currentExamModal) currentExamModal.hide();
    await loadExams();
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi lưu');
  }
};

window.deleteExam = async (id) => {
  if (!confirm('Xóa lịch thi này?')) return;
  try {
    await axios.delete(`${API}/exams/${id}`);
    await loadExams();
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi xóa');
  }
};

// ========== Đăng xuất ==========
function logout() {
  localStorage.clear();
  window.location.href = '../login.html';
}

// ========== Khởi tạo ==========
window.onload = async () => {
  const username = localStorage.getItem('username') || 'Admin';
  document.getElementById('adminInfo').textContent = `Xin chào, ${username}`;
  loadPage('students');
};