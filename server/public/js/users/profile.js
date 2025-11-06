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

  // Profile Picture Upload Handler
  const profilePictureInput = document.getElementById("profilePictureInput");
  const profilePicturePreview = document.getElementById("profilePicturePreview");

  if (profilePictureInput && profilePicturePreview) {
    profilePictureInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      
      if (file) {
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
          alert("Please select a valid image file (JPEG, JPG, PNG, or GIF)");
          return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert("File size must be less than 5MB");
          return;
        }

        // Preview the image
        const reader = new FileReader();
        reader.onload = function(e) {
          profilePicturePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Upload the image
        const formData = new FormData();
        formData.append("profilePicture", file);

        try {
          const response = await fetch("/auth/profile/picture", {
            method: "POST",
            body: formData
          });

          const data = await response.json();

          if (response.ok) {
            alert("Profile picture updated successfully!");
          } else {
            alert(data.message || "Failed to upload profile picture");
            // Revert preview on error
            location.reload();
          }
        } catch (error) {
          console.error("Error uploading profile picture:", error);
          alert("An error occurred while uploading the profile picture");
          location.reload();
        }
      }
    });
  }
});