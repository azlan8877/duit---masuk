const KEY_TX = "duitMasuk_transactions";
const KEY_ACCOUNTS = "duitMasuk_accounts";

let transactions = JSON.parse(localStorage.getItem(KEY_TX) || "[]");
let accounts = JSON.parse(localStorage.getItem(KEY_ACCOUNTS) || "[]");
let currentType = "income";

function money(value) {
  return "RM " + Number(value || 0).toFixed(2);
}

function show(id) {
  document.querySelectorAll(".screen").forEach(el => {
    el.classList.add("hidden");
  });

  const screen = document.getElementById(id);
  if (screen) screen.classList.remove("hidden");

  render();
}

function openAdd() {
  document.getElementById("modal").classList.remove("hidden");
  setType("income");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function setType(type) {
  currentType = type;

  document.getElementById("incomeTab").classList.toggle("sel", type === "income");
  document.getElementById("expenseTab").classList.toggle("sel", type === "expense");
}

function saveTx() {
  const name = document.getElementById("name").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value.trim();

  if (!name || !amount || amount <= 0) {
    alert("Sila masukkan nama dan jumlah.");
    return;
  }

  transactions.unshift({
    id: Date.now(),
    name,
    amount,
    category: category || "Umum",
    type: currentType,
    date: new Date().toISOString()
  });

  localStorage.setItem(KEY_TX, JSON.stringify(transactions));

  document.getElementById("name").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";

  closeModal();
  render();
  show("home");
}

function openAccount() {
  document.getElementById("accountModal").classList.remove("hidden");
}

function closeAccount() {
  document.getElementById("accountModal").classList.add("hidden");
}

function saveAccount() {
  const name = document.getElementById("accName").value.trim();
  const amount = Number(document.getElementById("accAmount").value);

  if (!name || amount < 0) {
    alert("Sila masukkan nama akaun dan baki.");
    return;
  }

  accounts.push({
    id: Date.now(),
    name,
    amount
  });

  localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts));

  document.getElementById("accName").value = "";
  document.getElementById("accAmount").value = "";

  closeAccount();
  render();
}

function render() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;

  document.getElementById("incomeTotal").textContent = money(income);
  document.getElementById("expenseTotal").textContent = money(expense);
  document.getElementById("balance").textContent = money(balance);
  document.getElementById("incomeRow").textContent = money(income);
  document.getElementById("expenseRow").textContent = money(expense);

  const recent = document.getElementById("recent");

  if (recent) {
    if (transactions.length === 0) {
      recent.innerHTML = `
        <div class="row">
          <span>Belum ada transaksi</span>
        </div>
      `;
    } else {
      recent.innerHTML = transactions.slice(0, 5).map(t => `
        <div class="row">
          <span class="dot ${t.type === "income" ? "green" : "pink"}">
            ${t.type === "income" ? "↓" : "↑"}
          </span>
          <b>${escapeHtml(t.name)}</b>
          <span>${t.type === "income" ? "+" : "-"} ${money(t.amount)}</span>
        </div>
      `).join("");
    }
  }

  renderAccounts();
  renderItems();
}

function renderAccounts() {
  const list = document.getElementById("accountList");
  const total = document.getElementById("accountTotal");

  if (!list || !total) return;

  const sum = accounts.reduce((s, a) => s + Number(a.amount), 0);
  total.textContent = money(sum);

  if (accounts.length === 0) {
    list.innerHTML = `
      <div class="row">
        <span>Belum ada akaun</span>
      </div>
    `;
    return;
  }

  list.innerHTML = accounts.map(a => `
    <div class="row" style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
      <b>${escapeHtml(a.name)}</b>
      <span>${money(a.amount)}</span>
    </div>
  `).join("");
}

function renderItems() {
  const list = document.getElementById("itemList");
  if (!list) return;

  const expenses = transactions.filter(t => t.type === "expense");

  if (expenses.length === 0) {
    list.innerHTML = `
      <div class="row">
        <span>Belum ada item beli</span>
      </div>
    `;
    return;
  }

  list.innerHTML = expenses.map(t => `
    <div class="row">
      <b>${escapeHtml(t.name)}</b>
      <span>${money(t.amount)}</span>
    </div>
  `).join("");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
