function changeQuantity(change) {
  const qtyInput = document.getElementById('quantity');
  let currentQty = parseInt(qtyInput.value);
  if (!isNaN(currentQty)) {
    currentQty += change;
    if (currentQty < 1) currentQty = 1;
    qtyInput.value = currentQty;
  }
}

async function addToCart(productId) {
  const quantity = parseInt(document.getElementById('quantity').value);

  try {
    const res = await fetch('/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity })
    });

    if (res.ok) {
      alert("Item added to cart!");
      window.location.href = "/cart"; 
    } else {
      const err = await res.json();
      alert("Failed to add to cart: " + err.message);
    }
  } catch (err) {
    console.error("Add to cart failed:", err);
    alert("Something went wrong.");
  }
}
