```javascript
const KEY_TX = "duitMasuk_transactions";
const KEY_ACCOUNTS = "duitMasuk_accounts";

let transactions = JSON.parse(localStorage.getItem(KEY_TX) || "[]");
let accounts = JSON.parse(localStorage.getItem(KEY_ACCOUNTS) || "[]");

let currentType = "income";
let editingId = null;

/* =========================
   FORMAT DUIT
========================= */
function money(value) {
  return "RM " + Number(value || 0).toFixed(2);
}

/* =========================
   NAVIGATION
========================= */
function show(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  const screen = document.getElementById(id);

  if (screen) {
    screen.classList.remove("hidden");
  }

  closeMenu();
  render();
}

/* =========================
   MENU
========================= */
function openMenu() {
  const menu = document.getElementById("menu");

  if (menu) {
    menu.classList.remove("hidden");
  }
}

function closeMenu() {
  const menu = document.getElementById("menu");

  if (menu) {
    menu.classList.add("hidden");
  }
}

/* =========================
   MODAL
========================= */
function openAdd() {
  editingId = null;

  const title = document.getElementById("modalTitle");
  if (title) {
    title.textContent = "Tambah Transaksi";
  }

  clearForm();

  setType("income");

  const modal = document.getElementById("txModal");

  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeModal() {
  const modal = document.getElementById("txModal");

  if (modal) {
    modal.classList.add("hidden");
  }

  editingId = null;
  clearForm();
}

function clearForm() {
  const name = document.getElementById("name");
  const amount = document.getElementById("amount");
  const category = document.getElementById("category");

  if (name) name.value = "";
  if (amount) amount.value = "";
  if (category) category.value = "";
}

/* =========================
   JENIS TRANSAKSI
========================= */
function setType(type) {
  currentType = type;

  const incomeTab = document.getElementById("incomeTab");
  const expenseTab = document.getElementById("expenseTab");

  if (incomeTab) {
    incomeTab.classList.toggle("active", type === "income");
  }

  if (expenseTab) {
    expenseTab.classList.toggle("active", type === "expense");
  }
}

/* =========================
   SIMPAN TRANSAKSI
========================= */
function saveTx() {
  const nameEl = document.getElementById("name");
  const amountEl = document.getElementById("amount");
  const categoryEl = document.getElementById("category");

  if (!nameEl || !amountEl) {
    alert("Borang transaksi tidak dijumpai.");
    return;
  }

  const name = nameEl.value.trim();
  const amount = Number(amountEl.value);
  const category = categoryEl
    ? categoryEl.value.trim()
    : "";

  if (!name || !amount || amount <= 0) {
    alert("Sila masukkan nama dan jumlah yang betul.");
    return;
  }

  /* EDIT */
  if (editingId) {
    const index = transactions.findIndex(
      t => String(t.id) === String(editingId)
    );

    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        name,
        amount,
        category: category || "Umum",
        type: currentType
      };
    }
  }

  /* TAMBAH */
  else {
    transactions.unshift({
      id: Date.now().toString(),
      name,
      amount,
      category: category || "Umum",
      type: currentType,
      date: new Date().toISOString()
    });
  }

  localStorage.setItem(
    KEY_TX,
    JSON.stringify(transactions)
  );

  closeModal();
  render();
}

/* =========================
   EDIT TRANSAKSI
========================= */
function editTransaction(id) {
  const tx = transactions.find(
    t => String(t.id) === String(id)
  );

  if (!tx) {
    alert("Transaksi tidak dijumpai.");
    return;
  }

  editingId = tx.id;

  const title = document.getElementById("modalTitle");
  const name = document.getElementById("name");
  const amount = document.getElementById("amount");
  const category = document.getElementById("category");

  if (title) {
    title.textContent = "Edit Transaksi";
  }

  if (name) {
    name.value = tx.name || "";
  }

  if (amount) {
    amount.value = tx.amount || "";
  }

  if (category) {
    category.value = tx.category || "";
  }

  setType(tx.type || "income");

  const modal = document.getElementById("txModal");

  if (modal) {
    modal.classList.remove("hidden");
  }
}

/* =========================
   HAPUS TRANSAKSI
========================= */
function deleteTransaction(id) {
  const tx = transactions.find(
    t => String(t.id) === String(id)
  );

  if (!tx) return;

  const confirmDelete = confirm(
    'Hapus transaksi "' + tx.name + '"?'
  );

  if (!confirmDelete) {
    return;
  }

  transactions = transactions.filter(
    t => String(t.id) !== String(id)
  );

  localStorage.setItem(
    KEY_TX,
    JSON.stringify(transactions)
  );

  render();
}

/* =========================
   RENDER TRANSACTIONS
========================= */
function renderTransactions() {
  const list = document.getElementById("transactionList");

  if (!list) return;

  if (transactions.length === 0) {
    list.innerHTML = `
      <div class="row">
        <span>Belum ada transaksi</span>
      </div>
    `;
    return;
  }

  list.innerHTML = transactions.map(t => {
    const isIncome = t.type === "income";

    return `
      <div class="row transaction-row">
        <div style="display:flex;align-items:center;gap:12px;flex:1;">
          <span class="dot ${isIncome ? "green" : "pink"}">
            ${isIncome ? "↓" : "↑"}
          </span>

          <div>
            <b>${escapeHtml(t.name)}</b>
            <small style="display:block;color:#777;">
              ${escapeHtml(t.category || "Umum")}
            </small>

            <div style="margin-top:6px;">
              <button
                type="button"
                class="edit-btn"
                onclick="editTransaction('${t.id}')">
                Edit
              </button>

              <button
                type="button"
                class="delete-btn"
                onclick="deleteTransaction('${t.id}')">
                Hapus
              </button>
            </div>
          </div>
        </div>

        <strong>
          ${isIncome ? "+" : "-"} ${money(t.amount)}
        </strong>
      </div>
    `;
  }).join("");
}

/* =========================
   RENDER ITEM BELI
========================= */
function renderItems() {
  const list = document.getElementById("itemList");

  if (!list) return;

  const expenses = transactions.filter(
    t => t.type === "expense"
  );

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
      <div>
        <b>${escapeHtml(t.name)}</b>
        <small style="display:block;color:#777;">
          ${escapeHtml(t.category || "Umum")}
        </small>
      </div>

      <strong>${money(t.amount)}</strong>
    </div>
  `).join("");
}

/* =========================
   AKAUN
========================= */
function renderAccounts() {
  const list = document.getElementById("accountList");
  const total = document.getElementById("accountTotal");

  if (!list || !total) return;

  const sum = accounts.reduce(
    (s, a) => s + Number(a.amount || 0),
    0
  );

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
    <div
      class="row"
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:16px;
      "
    >
      <b>${escapeHtml(a.name)}</b>
      <span>${money(a.amount)}</span>
    </div>
  `).join("");
}

/* =========================
   DASHBOARD
========================= */
function renderDashboard() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = income - expense;

  setText("incomeTotal", money(income));
  setText("expenseTotal", money(expense));
  setText("balance", money(balance));

  setText("homeIncome", money(income));
  setText("homeExpense", money(expense));
  setText("homeBalance", money(balance));

  setText("incomeTotalHome", money(income));
  setText("expenseTotalHome", money(expense));
  setText("balanceHome", money(balance));

  const recent = document.getElementById("recentTransactions");

  if (recent) {
    const latest = transactions.slice(0, 5);

    if (latest.length === 0) {
      recent.innerHTML = `
        <div class="row">
          <span>Belum ada transaksi</span>
        </div>
      `;
    } else {
      recent.innerHTML = latest.map(t => `
        <div class="row">
          <div>
            <b>${escapeHtml(t.name)}</b>
            <small style="display:block;color:#777;">
              ${escapeHtml(t.category || "Umum")}
            </small>
          </div>

          <strong>
            ${t.type === "income" ? "+" : "-"}
            ${money(t.amount)}
          </strong>
        </div>
      `).join("");
    }
  }
}

/* =========================
   LAPORAN
========================= */
function renderReport() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const count = transactions.length;

  const average = count
    ? expense / transactions.filter(t => t.type === "expense").length || 0
    : 0;

  setText("reportIncome", money(income));
  setText("reportExpense", money(expense));
  setText("reportBalance", money(income - expense));
  setText("transactionCount", count);
  setText("averageExpense", money(average));
}

/* =========================
   RENDER SEMUA
========================= */
function render() {
  renderDashboard();
  renderTransactions();
  renderItems();
  renderAccounts();
  renderReport();
}

/* =========================
   HELPER
========================= */
function setText(id, value) {
  const el = document.getElementById(id);

  if (el) {
    el.textContent = value;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================
   TAMBAH CONTOH AKAUN
========================= */
function saveAccount() {
  const nameEl = document.getElementById("accountName");
  const amountEl = document.getElementById("accountAmount");

  if (!nameEl || !amountEl) return;

  const name = nameEl.value.trim();
  const amount = Number(amountEl.value);

  if (!name || !amount || amount < 0) {
    alert("Sila masukkan maklumat akaun.");
    return;
  }

  accounts.push({
    id: Date.now().toString(),
    name,
    amount
  });

  localStorage.setItem(
    KEY_ACCOUNTS,
    JSON.stringify(accounts)
  );

  nameEl.value = "";
  amountEl.value = "";

  renderAccounts();
}

/* =========================
   GLOBAL CLICK SAFETY
========================= */
document.addEventListener("click", function(event) {
  const target = event.target;

  if (!target) return;

  if (target.matches("[data-close-modal]")) {
    closeModal();
  }

  if (target.matches("[data-open-menu]")) {
    openMenu();
  }

  if (target.matches("[data-close-menu]")) {
    closeMenu();
  }
});

/* =========================
   MULA APP
========================= */
document.addEventListener("DOMContentLoaded", function() {
  render();
});

/* Pastikan render juga berjalan jika
   script dimuat selepas DOM */
render();
```
