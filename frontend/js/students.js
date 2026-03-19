//file này của admin quản lý sinh viên, không liên quan đến phần điểm danh của sinh viên nên có thể bỏ qua khi review code điểm danh

const API = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", loadStudents);

async function loadStudents() {

    const res = await axios.get(API + "/students");

    const table = document.getElementById("studentTable");

    table.innerHTML = "";

    res.data.forEach(s => {

        table.innerHTML += `
<tr>
<td>${s.fullName}</td>
<td>${s.email || ""}</td>
<td>${s.classId?.className || ""}</td>
<td>
<button onclick="deleteStudent('${s._id}')" class="btn btn-danger">
Delete
</button>
</td>
</tr>
`;

    });

}


async function createStudent() {

    const studentCode = document.getElementById("studentCode").value;
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const classId = document.getElementById("classId").value;

    await axios.post(API + "/students", {
        studentCode,
        fullName,
        email,
        phone,
        classId
    });

    loadStudents();

}

async function deleteStudent(id) {

    await axios.delete(API + "/students/" + id);
    loadStudents();
}