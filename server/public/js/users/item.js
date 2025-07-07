function changeQuantity(change) {
    const qtyInput = document.getElementById('quantity');
    let currentQty = parseInt(qtyInput.value);
    if (!isNaN(currentQty)) {
      currentQty += change;
      if (currentQty < 1) currentQty = 1;
      qtyInput.value = currentQty;
    }
  }

  function addToCart() {
    const qty = document.getElementById('quantity').value;
    alert(qty + ' item(s) added to cart!');
  }