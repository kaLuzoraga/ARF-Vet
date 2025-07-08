document.getElementById("signup-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Form fields
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const name = document.getElementById("signup-name").value.trim();
  const address = document.getElementById("signup-address").value.trim();
  const phone = document.getElementById("signup-phone").value.trim();

  // Error elements
  const errorEmail = document.getElementById("error-email");
  const errorPassword = document.getElementById("error-password");
  const errorConfirm = document.getElementById("error-confirm");
  const errorName = document.getElementById("error-name");
  const errorAddress = document.getElementById("error-address");
  const errorPhone = document.getElementById("error-phone");

  // Reset errors
  [errorEmail, errorPassword, errorConfirm, errorName, errorAddress, errorPhone].forEach(el => el.textContent = "");

  // Validation
  let hasError = false;

  if (!email.includes("@")) {
    errorEmail.textContent = "Invalid email address.";
    hasError = true;
  }

  if (password.length < 6) {
    errorPassword.textContent = "Password must be at least 6 characters.";
    hasError = true;
  }

  if (password !== confirmPassword) {
    errorConfirm.textContent = "Passwords do not match.";
    hasError = true;
  }

  if (name.length === 0) {
    errorName.textContent = "Name is required.";
    hasError = true;
  }

  if (address.length === 0) {
    errorAddress.textContent = "Address is required.";
    hasError = true;
  }

  if (!/^09\d{9}$/.test(phone)) {
    errorPhone.textContent = "Phone number must start with 09 and be 11 digits.";
    hasError = true;
  }

  if (hasError) return;

  try {
    const response = await fetch("/auth/registration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userType: "user", email, password, fullName: name, address, phone }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Registration successful! You may now log in.");
      window.location.href = "/auth/login";
    } else {
      alert(result.message || "Registration failed. Please try again.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Please try again.");
  }
});
