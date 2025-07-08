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

  const imageFile = document.getElementById('product-image').files[0];
  if (!imageFile) return alert("Please select an image.");

  const reader = new FileReader();
  reader.onload = async function () {
    const base64Image = reader.result;

    try {
      const res = await fetch("/admin/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, description, price, image: base64Image })
      });

      const data = await res.json();
      if (res.ok) {
        alert("Product added!");
        closeModal();
        loadInventory();
      } else {
        alert("Failed to add product: " + data.message);
      }
    } catch (err) {
      console.error("Error submitting product:", err);
    }
  };

  reader.readAsDataURL(imageFile);
});

async function loadInventory() {
  try {
    const res = await fetch("/admin/products/all");
    const products = await res.json();

    const wrapper = document.getElementById("inventory-list");
    wrapper.innerHTML = "";

    products.forEach((item) => {
      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="price">₱${item.price.toFixed(2)}</div>
      `;
      wrapper.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading inventory:", err);
  }
}

loadInventory();
