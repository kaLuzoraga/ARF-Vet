document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.querySelector(".checkout-btn");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function (e) {
      e.preventDefault();

      const confirmOrder = confirm("Are you sure you want to proceed to checkout?");
      if (confirmOrder) {
        window.location.href = "/checkout";
      }
    });
  }

  const removeForms = document.querySelectorAll("form[action='/cart/remove']");
  removeForms.forEach(form => {
    form.addEventListener("submit", function (e) {
      const confirmRemove = confirm("Are you sure you want to remove this item?");
      if (!confirmRemove) e.preventDefault();
    });
  });
});