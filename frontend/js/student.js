// ✅ CHECK-IN
async function checkIn() {
  const code = document.getElementById("attendanceCode").value;
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Chưa đăng nhập!");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/attendances/checkin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token   
      },
      body: JSON.stringify({
        code  
      })
    });

    const data = await res.json();

    alert(data.message);

  } catch (err) {
    console.error(err);
  }
}

// history attendance
async function loadHistory() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Chưa đăng nhập");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/attendances/my", {
      headers: {
        "Authorization": "Bearer " + token   // 🔥 QUAN TRỌNG
      }
    });

    const data = await res.json();

    const tbody = document.getElementById("history");
    tbody.innerHTML = "";

    data.forEach(item => {
      const row = `
        <tr>
          <td>${new Date(item.date).toLocaleDateString()}</td>
          <td>${item.status}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    });

  } catch (err) {
    console.error(err);
  }
}

window.onload = () => {
  const token = localStorage.getItem("token");

  console.log("token:", token);

  if (!token) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "../login.html";
    return;
  }
  loadStudentInfo();
  loadHistory();
};
// logout
function logout() {
    localStorage.clear(); // xóa token, role, studentId...
    window.location.href = '../login.html';
}

// Lấy thông tin sinh viên để hiển thị tên
async function loadStudentInfo() {
  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("studentId");
  if (!studentId) {
    console.warn("Không tìm thấy studentId");
    document.getElementById("studentInfo").textContent = "Sinh viên";
    return;
  }
  try {
    const res = await fetch(`http://localhost:3000/api/students/${studentId}`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) throw new Error("Không thể lấy thông tin sinh viên");
    const student = await res.json();
    localStorage.setItem('classId', student.classId);
    // Hiển thị mã số và tên
    const displayText = `${student.studentCode} | ${student.fullName || student.studentCode}`;
    document.getElementById("studentInfo").textContent = displayText;
  } catch (err) {
    console.error("Lỗi lấy thông tin sinh viên", err);
    document.getElementById("studentInfo").textContent = "Sinh viên";
  }
}
