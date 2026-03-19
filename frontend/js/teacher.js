// frontend/js/teacher.js
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'teacher') {
    window.location.href = '../login.html';
}

// Gửi token trong mọi request axios
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Hàm logout
window.logout = function() {
    localStorage.clear();
    window.location.href = '../login.html';
};