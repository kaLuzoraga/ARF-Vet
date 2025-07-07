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

// 🔁 Dummy users removed; starts empty
let users = [];

let editIndex = null;

function renderUsers() {
  adminTable.innerHTML = "";
  customerTable.innerHTML = "";

  users.forEach((user, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td class="actions">
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </td>
    `;

    row.querySelector(".edit").onclick = () => {
      editIndex = index;
      modalTitle.textContent = "Edit User";
      nameInput.value = user.name;
      emailInput.value = user.email;
      passwordInput.value = user.password;
      confirmPasswordInput.value = user.password;
      addressInput.value = user.address;
      phoneInput.value = user.phone;
      roleInput.value = user.role;
      modal.style.display = "flex";
    };

    row.querySelector(".delete").onclick = () => {
      if (confirm("Are you sure you want to delete this user?")) {
        users.splice(index, 1);
        renderUsers();
      }
    };

    if (user.role === "Admin") {
      adminTable.appendChild(row);
    } else {
      customerTable.appendChild(row);
    }
  });
}

userForm.onsubmit = (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const address = addressInput.value.trim();
  const phone = phoneInput.value.trim();
  const role = roleInput.value;

  if (!name || !email || !password || !confirmPassword || !address || !phone || !role) {
    alert("Please fill out all fields.");
    return;
  }

  if (!email.includes("@")) {
    alert("Invalid email address.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  if (!/^09\d{9}$/.test(phone)) {
    alert("Phone number must start with 09 and be 11 digits.");
    return;
  }

  const userData = { name, email, password, address, phone, role };

  if (editIndex !== null) {
    users[editIndex] = userData;
    editIndex = null;
  } else {
    users.push(userData);
  }

  userForm.reset();
  modal.style.display = "none";
  renderUsers();
};

addUserBtn.onclick = () => {
  editIndex = null;
  modalTitle.textContent = "Add User";
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

renderUsers();
