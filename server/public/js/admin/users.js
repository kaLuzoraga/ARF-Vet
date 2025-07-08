const adminTable = document.getElementById("admin-table");
const customerTable = document.getElementById("customer-table");
const addUserBtn = document.getElementById("addUserBtn");
const modal = document.getElementById("userModal");
const closeModal = document.getElementById("closeModal");
const userForm = document.getElementById("userForm");
const modalTitle = document.getElementById("modalTitle");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const addressInput = document.getElementById("address");
const phoneInput = document.getElementById("phone");
const roleInput = document.getElementById("role");
const userIdInput = document.getElementById("userId");

let users = [];

async function fetchUsers() {
  try {
    const res = await fetch("/admin/api/users");
    users = await res.json();
    renderUsers();
  } catch (err) {
    console.error("Failed to fetch users:", err);
  }
}

function renderUsers() {
  adminTable.innerHTML = "";
  customerTable.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.fullName}</td>
      <td>${user.email}</td>
      <td>${user.userType}</td>
      <td class="actions">
        <button class="edit" data-id="${user._id}">Edit</button>
        <button class="delete" data-id="${user._id}">Delete</button>
      </td>
    `;

    row.querySelector(".edit").onclick = () => {
      modalTitle.textContent = "Edit User";
      userIdInput.value = user._id;
      nameInput.value = user.fullName;
      emailInput.value = user.email;
      passwordInput.value = "";
      confirmPasswordInput.value = "";
      addressInput.value = user.address;
      phoneInput.value = user.phone;
      roleInput.value = user.userType;
      modal.style.display = "flex";
    };

    row.querySelector(".delete").onclick = async () => {
      if (confirm("Are you sure you want to delete this user?")) {
        try {
          const res = await fetch(`/admin/api/users/${user._id}`, {
            method: "DELETE"
          });

          if (!res.ok) {
            const data = await res.json();
            return alert(data.error || "Failed to delete user.");
          }

          fetchUsers();
        } catch (err) {
          console.error("Delete failed:", err);
          alert("Server error while deleting user.");
        }
      }
    };

    (user.userType === "admin" ? adminTable : customerTable).appendChild(row);
  });
}

userForm.onsubmit = async (e) => {
  e.preventDefault();

  const fullName = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const address = addressInput.value.trim();
  const phone = phoneInput.value.trim();
  const userType = roleInput.value;
  const userId = userIdInput.value;

  // Validation
  if (!fullName || !email || !address || !phone || !userType) {
    return alert("Please fill out all fields.");
  }

  if (!email.includes("@")) return alert("Invalid email.");
  if (!/^09\d{9}$/.test(phone)) return alert("Invalid phone number.");

  if (!userId) {
    // New user requires password
    if (!password || !confirmPassword) return alert("Please provide password and confirm it.");
    if (password.length < 6) return alert("Password must be at least 6 characters.");
    if (password !== confirmPassword) return alert("Passwords do not match.");
  } else if (password && password !== confirmPassword) {
    return alert("Passwords do not match.");
  }

  const userData = { fullName, email, address, phone, userType };
  if (password) userData.password = password;

  try {
    const method = userId ? "PUT" : "POST";
    const url = userId ? `/admin/api/users/${userId}` : "/admin/api/users";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok) {
      return alert(data.error || "Failed to save user.");
    }

    modal.style.display = "none";
    userForm.reset();
    fetchUsers();
  } catch (err) {
    console.error("Save failed:", err);
    alert("Server error while saving user.");
  }
};

addUserBtn.onclick = () => {
  modalTitle.textContent = "Add User";
  userIdInput.value = "";
  userForm.reset();
  modal.style.display = "flex";
};

closeModal.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};

fetchUsers();
