function addItem() {
  document.getElementById('modal-title').textContent = 'Add New Product';
  document.getElementById('item-form').reset();
  openModal();
}

function openModal() {
  document.getElementById('item-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('item-modal').classList.add('hidden');
}

document.getElementById('item-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('product-name').value.trim();
  const description = document.getElementById('product-description').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  const stock = parseInt(document.getElementById('product-stock').value) || 0;

  // Validate required fields
  if (!name || !description || !price) {
    alert("Please fill in all required fields.");
    return;
  }

  const imageFile = document.getElementById('product-image').files[0];
  if (!imageFile) {
    alert("Please select an image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function () {
    const base64Image = reader.result;

    try {
      const res = await fetch("/admin/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          name, 
          description, 
          price, 
          image: base64Image,
          stock 
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert("Product added successfully!");
        closeModal();
        loadInventory();
      } else {
        alert("Failed to add product: " + (data.message || data.error));
      }
    } catch (err) {
      console.error("Error submitting product:", err);
      alert("An error occurred while adding the product.");
    }
  };

  reader.readAsDataURL(imageFile);
});

async function loadInventory() {
  try {
    const res = await fetch("/admin/products/all");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const products = await res.json();
    const wrapper = document.getElementById("inventory-list");
    wrapper.innerHTML = "";

    if (products.length === 0) {
      wrapper.innerHTML = '<p style="text-align: center; color: #666;">No products available.</p>';
      return;
    }

    products.forEach((item) => {
      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <img src="${item.image || '/img/default.jpg'}" alt="${item.name}" onerror="this.src='/img/default.jpg'" />
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="price">₱${item.price.toFixed(2)}</div>
        <div class="stock">Stock: ${item.stock || 0}</div>
      `;
      wrapper.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading inventory:", err);
    const wrapper = document.getElementById("inventory-list");
    wrapper.innerHTML = '<p style="text-align: center; color: #ff0000;">Error loading products.</p>';
  }
}

// Load inventory when page loads
loadInventory();