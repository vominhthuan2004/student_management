const API = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", loadDashboard);

async function loadDashboard() {

    checkAdmin();

    const students = await axios.get(API + "/students");

    const classes = await axios.get(API + "/classes");

    const attendance = await axios.get(API + "/attendance");

    document.getElementById("totalStudents").innerText =
        students.data.length;

    document.getElementById("totalClasses").innerText =
        classes.data.length;

    document.getElementById("totalAttendance").innerText =
        attendance.data.length;

}


function checkAdmin() {

    const role = localStorage.getItem("role");

    if (role !== "admin") {

        alert("Access denied");

        window.location.href = "../login.html";

    }

}