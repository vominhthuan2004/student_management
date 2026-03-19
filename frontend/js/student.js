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

  loadHistory();
};