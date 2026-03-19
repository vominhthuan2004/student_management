// frontend/js/classes.js
const API = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Gọi API lấy danh sách lớp của giáo viên
        const res = await axios.get(`${API}/classes/teacher/me`);
        renderClasses(res.data);
    } catch (error) {
        console.error('Lỗi tải danh sách lớp:', error);
        alert('Không thể tải danh sách lớp. Vui lòng thử lại.');
    }
});

function renderClasses(classes) {
    const container = document.getElementById('classList');
    container.innerHTML = '';

    if (classes.length === 0) {
        container.innerHTML = '<p class="text-muted">Chưa có lớp nào.</p>';
        return;
    }

    classes.forEach(cls => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        col.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${cls.className}</h5>
                    <p class="card-text">Mã lớp: ${cls.classCode}</p>
                    <p class="card-text">Niên khóa: ${cls.year || 'Chưa cập nhật'}</p>
                    <a href="class-detail.html?classId=${cls._id}" class="btn btn-primary">Xem chi tiết</a>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}