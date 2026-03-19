async function loadAttendance() {

    const res = await axios.get("http://localhost:3000/api/attendances");

    const table = document.getElementById("attendanceTable");

    table.innerHTML = "";

    res.data.forEach(a => {

        table.innerHTML += `
<tr>
<td>${a.studentId?.studentName || ""}</td>
<td>${a.classId?.className || ""}</td>
<td>${a.date}</td>
<td>${a.status}</td>
</tr>
`;

    });

}

loadAttendance();

async function createAttendance() {

    const studentId = document.getElementById("studentId").value;
    const classId = document.getElementById("classId").value;
    const status = document.getElementById("status").value;

    await axios.post(API + "/attendances", {
        studentId,
        classId,
        status
    });

    loadAttendance();

}