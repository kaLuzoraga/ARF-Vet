document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const message = document.getElementById("message");
  message.textContent = "";

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      message.style.color = "green";
      message.textContent = "Login successful. Redirecting...";
      setTimeout(() => {
        window.location.href = "/admin/inventory"; 
      }, 1000);
    } else {
      message.style.color = "red";
      message.textContent = result.message || "Invalid credentials.";
    }
  } catch (err) {
    message.style.color = "red";
    message.textContent = "Server error. Please try again.";
    console.error(err);
  }
});
