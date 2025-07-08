let currentOrders = [];
let statusOrders = [];
let historyOrders = [];

const currentTable = document.getElementById("current-orders-body");
const statusTable = document.getElementById("status-orders-body");
const historyTable = document.getElementById("history-orders-body");

function renderTables() {
  // CURRENT ORDERS
  currentTable.innerHTML = "";
  currentOrders.forEach((order, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.total}</td>
      <td class="actions">
        <button class="accept">Accept</button>
        <button class="cancel">Cancel</button>
        <button class="delete">Delete</button>
      </td>
    `;

    row.querySelector(".accept").onclick = () => {
      statusOrders.push({ id: order.id, customer: order.customer, status: "Processing" });
      currentOrders.splice(index, 1);
      renderTables();
    };

    row.querySelector(".cancel").onclick = () => {
      historyOrders.push({
        id: order.id,
        customer: order.customer,
        status: "Cancelled",
        date: new Date().toLocaleDateString()
      });
      currentOrders.splice(index, 1);
      renderTables();
    };

    row.querySelector(".delete").onclick = () => {
      currentOrders.splice(index, 1);
      renderTables();
    };

    currentTable.appendChild(row);
  });

  // STATUS ORDERS
  statusTable.innerHTML = "";
  statusOrders.forEach((order, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>
        <select class="status-select">
          <option value="Processing" ${order.status === "Processing" ? "selected" : ""}>Processing</option>
          <option value="Out for Delivery" ${order.status === "Out for Delivery" ? "selected" : ""}>Out for Delivery</option>
          <option value="Completed" ${order.status === "Completed" ? "selected" : ""}>Completed</option>
          <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
      <td class="actions">
        <button class="update">Update</button>
        <button class="delete">Delete</button>
      </td>
    `;

    const statusSelect = row.querySelector(".status-select");

    row.querySelector(".update").onclick = () => {
      const selectedStatus = statusSelect.value;
      if (selectedStatus === "Completed" || selectedStatus === "Cancelled") {
        historyOrders.push({
          id: order.id,
          customer: order.customer,
          status: selectedStatus,
          date: new Date().toLocaleDateString()
        });
        statusOrders.splice(index, 1);
      } else {
        order.status = selectedStatus;
      }
      renderTables();
    };

    row.querySelector(".delete").onclick = () => {
      statusOrders.splice(index, 1);
      renderTables();
    };

    statusTable.appendChild(row);
  });

  // HISTORY ORDERS
  historyTable.innerHTML = "";
  historyOrders.forEach(order => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.status}</td>
      <td>${order.date}</td>
    `;
    historyTable.appendChild(row);
  });
}

renderTables();
