function addItem() {
  document.getElementById('modal-title').textContent = 'Add New Product';
  document.getElementById('item-form').reset();
  document.getElementById('item-id').value = '';
  document.getElementById('product-image').required = true;
  openModal();
}

function openModal() {
  document.getElementById('item-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('item-modal').classList.add('hidden');
}

// Handle form submission (Add/Edit)
document.getElementById('item-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const id = document.getElementById('item-id').value;
  const name = document.getElementById('product-name').value.trim();
  const description = document.getElementById('product-description').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  const category = document.getElementById('product-category').value;
  const stock = parseInt(document.getElementById('product-stock').value) || 0;
  const imageFile = document.getElementById('product-image').files[0];

  if (!name || !description || !price || !category) {
    alert("Please fill in all required fields.");
    return;
  }

  const data = { name, description, price, category, stock };

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function () {
      data.image = reader.result;
      submitForm(id, data);  // ✅ Correct call
    };
    reader.readAsDataURL(imageFile);
  } else {
    submitForm(id, data);  // ✅ Submit without image
  }
});

async function submitForm(id, data) {
  const url = id ? `/admin/products/${id}` : `/admin/products/add`;
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (res.ok) {
      alert(`Product ${id ? "updated" : "added"} successfully!`);
      closeModal();
      loadInventory();
    } else {
      alert("Failed: " + (result.message || result.error));
    }
  } catch (err) {
    console.error("Submit error:", err);
    alert("Something went wrong.");
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`/admin/products/${id}`, {
      method: "DELETE"
    });

    const result = await res.json();
    if (res.ok) {
      alert("Product deleted.");
      loadInventory();
    } else {
      alert("Failed to delete: " + (result.message || result.error));
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Error deleting product.");
  }
}

async function loadInventory() {
  try {
    const res = await fetch("/admin/products/all");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

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
        <div class="buttons">
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </div>
      `;

      card.querySelector(".edit-btn").addEventListener("click", () => {
        document.getElementById("modal-title").textContent = "Edit Product";
        document.getElementById("item-id").value = item._id;
        document.getElementById("product-name").value = item.name;
        document.getElementById("product-description").value = item.description;
        document.getElementById("product-price").value = item.price;
        document.getElementById("product-category").value = item.category || "Other";
        document.getElementById("product-stock").value = item.stock || 0;
        document.getElementById("product-image").required = false;
        openModal();
      });

      card.querySelector(".delete-btn").addEventListener("click", () => {
        deleteProduct(item._id);
      });

      wrapper.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading inventory:", err);
    const wrapper = document.getElementById("inventory-list");
    wrapper.innerHTML = '<p style="text-align: center; color: #ff0000;">Error loading products.</p>';
  }
}

loadInventory();
