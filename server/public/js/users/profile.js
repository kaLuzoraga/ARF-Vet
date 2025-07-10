document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const form = document.getElementById("profileForm");

  if (editBtn && saveBtn && form) {
    editBtn.addEventListener("click", () => {
      // Enable all input fields inside the form
      form.querySelectorAll("input").forEach(input => {
        if (input.name !== "_csrf") input.disabled = false;
      });

      editBtn.style.display = "none";
      saveBtn.style.display = "inline-block";
    });

    form.addEventListener("submit", (e) => {
      const confirmed = confirm("Save changes to your profile?");
      if (!confirmed) {
        e.preventDefault();
      }
    });
  } else {
    console.warn("Edit or Save button not found.");
  }
});
