document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const message = document.getElementById("message");

  message.textContent = "";
  message.style.color = "black";

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
      message.style.color = "green";
      message.textContent = "Login successful!";

      setTimeout(() => {
        const userType = result.user?.userType;

        if (userType === "user") {
          window.location.href = "/home"; 
        } else if (userType === "admin") {
          window.location.href = "/admin/users"; 
        } else {
          window.location.href = "/";
        }
      }, 1000);
    } else {
      message.style.color = "red";
      message.textContent = result.message || "Login failed.";
    }
  } catch (error) {
    console.error("Login error:", error);
    message.style.color = "red";
    message.textContent = "Server error.";
  }
});
