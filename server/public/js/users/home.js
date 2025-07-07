console.log("Dynamic Home Page Loaded");

document.addEventListener("DOMContentLoaded", () => {
  // Handle hover effect on hero CTA button
  const heroBtn = document.querySelector(".hero .btn");
  if (heroBtn) {
    heroBtn.addEventListener("mouseenter", () => heroBtn.style.backgroundColor = "#6cd8a8");
    heroBtn.addEventListener("mouseleave", () => heroBtn.style.backgroundColor = "#93e9be");
  }

  // Handle "Add to Cart" buttons
  const addToCartButtons = document.querySelectorAll(".product-card button");

  addToCartButtons.forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const productId = card?.dataset.id;
      const name = card?.dataset.name;
      const price = card?.dataset.price;

      if (productId && name && price) {
        console.log(`Adding to cart: ${name} (ID: ${productId}, ₱${price})`);

        // Example fetch POST to backend
        fetch("/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            productId,
            name,
            price: parseFloat(price),
            quantity: 1
          })
        })
        .then(res => res.json())
        .then(data => {
          alert(` ${name} added to cart!`);
        })
        .catch(err => {
          console.error("Error adding to cart:", err);
          alert(" Failed to add item. Please try again.");
        });
      }
    });
  });
});
