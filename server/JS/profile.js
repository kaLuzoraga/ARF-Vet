const form = document.getElementById("profileForm");
const inputs = form.querySelectorAll("input");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");

editBtn.addEventListener("click", () => {
  inputs.forEach(input => input.disabled = false);
  editBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let valid = true;
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.border = "1px solid red";
      valid = false;
    } else {
      input.style.border = "1px solid #ccc";
    }
  });

  if (!valid) return;

  inputs.forEach(input => input.disabled = true);
  editBtn.style.display = "inline-block";
  saveBtn.style.display = "none";

  alert("Profile updated successfully!");
});