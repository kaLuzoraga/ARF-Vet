document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const form = document.getElementById("profileForm");

  if (editBtn && saveBtn && form) {
    editBtn.addEventListener("click", () => {
      form.querySelectorAll("input").forEach(input => {
        input.removeAttribute("disabled");
      });

      editBtn.style.display = "none";
      saveBtn.style.display = "inline-block";
    });

    form.addEventListener("submit", (e) => {
      form.querySelectorAll("input").forEach(input => {
        input.removeAttribute("disabled");
      });

      const confirmed = confirm("Save changes to your profile?");
      if (!confirmed) {
        e.preventDefault();
      }
    });
  } else {
    console.warn("Edit or Save button not found.");
  }
});