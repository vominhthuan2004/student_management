const API = "http://localhost:3000/api";

async function login(event) {
    if (event) event.preventDefault(); // an toàn cho cả 2 cách gọi

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await axios.post(API + "/users/login", {
            username,
            password
        });

        console.log("DATA:", res.data); // kiểm tra response thật

        // Lưu token và thông tin user (đúng cấu trúc)
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("userId", res.data.user._id);
        if (res.data.user.studentId) {
            localStorage.setItem("studentId", res.data.user.studentId);
        }

        // Chuyển hướng theo role
        redirectByRole(res.data.user.role);

    } catch (err) {
        console.error("Lỗi chi tiết:", err);
        console.error("Response từ server:", err.response?.data);
        alert("Login failed: " + (err.response?.data?.message || err.message));
    }
}

// Hàm chuyển hướng (đảm bảo đã định nghĩa)
function redirectByRole(role) {
    switch (role) {
        case 'student':
            window.location.href = 'student/dashboard.html';
            break;
        case 'teacher':
            window.location.href = 'teacher/dashboard.html';
            break;
        case 'admin':
            window.location.href = 'admin/dashboard.html';
            break;
        default:
            console.error('Unknown role:', role);
            alert('Không xác định được quyền!');
    }
}