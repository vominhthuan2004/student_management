async function login(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await axios.post("http://localhost:3000/api/users/login", {
            username,
            password
        });

        console.log("SUCCESS:", res.data);

        // Kiểm tra cấu trúc response
        if (!res.data.token || !res.data.user || !res.data.user.role) {
            throw new Error("Invalid response structure");
        }
        localStorage.setItem("userId", res.data.user._id);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);

        redirectByRole(res.data.user.role);

    } catch (err) {
        console.error("ERROR:", err);
        console.error("SERVER RESPONSE:", err.response?.data);
        alert("Login failed: " + (err.response?.data?.message || err.message));
    }
}