let inventory = [];
let editingIndex = null;

function addItem() {
  document.getElementById('modal-title').textContent = 'Add New Product';
  document.getElementById('item-form').reset();
  document.getElementById('item-id').value = '';
  editingIndex = null;
  openModal();
}

function openModal() {
  document.getElementById('item-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('item-modal').classList.add('hidden');
}

document.getElementById('item-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('product-name').value;
  const description = document.getElementById('product-description').value;
  const price = parseFloat(document.getElementById('product-price').value).toFixed(2);

  const fileInput = document.getElementById('product-image');
  const image = fileInput.files[0]
    ? URL.createObjectURL(fileInput.files[0])
    : (inventory[editingIndex]?.image || '');

  const newItem = { name, description, price, image };

  if (editingIndex !== null) {
    inventory[editingIndex] = newItem;
  } else {
    inventory.push(newItem);
  }

  renderInventory();
  closeModal();
});

function renderInventory() {
  const wrapper = document.getElementById('inventory-list');
  wrapper.innerHTML = '';
  inventory.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'item-card';

    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="price">₱${item.price}</div>
      <button class="btn-remove" onclick="deleteItem(${index})">Delete</button>
    `;

    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-remove')) {
        editItem(index);
      }
    });

    wrapper.appendChild(card);
  });
}

function editItem(index) {
  const item = inventory[index];
  editingIndex = index;
  document.getElementById('modal-title').textContent = 'Edit Product';
  document.getElementById('product-name').value = item.name;
  document.getElementById('product-description').value = item.description;
  document.getElementById('product-price').value = item.price;
  document.getElementById('product-image').value = '';
  openModal();
}

function deleteItem(index) {
  if (confirm('Are you sure you want to delete this item?')) {
    inventory.splice(index, 1);
    renderInventory();
  }
}

renderInventory();
