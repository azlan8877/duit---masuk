const KEY_TX = "duitMasuk_transactions";
const KEY_ACCOUNTS = "duitMasuk_accounts";

let transactions = JSON.parse(localStorage.getItem(KEY_TX) || "[]");
let accounts = JSON.parse(localStorage.getItem(KEY_ACCOUNTS) || "[]");

let currentType = "income";
let editingId = null;

/* =========================
   ASAS
========================= */

function money(value) {
  return "RM " + Number(value || 0).toFixed(2);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveData() {
  localStorage.setItem(KEY_TX, JSON.stringify(transactions));
  localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts));
}

/* =========================
   TUKAR HALAMAN
========================= */

function show(id) {
  document.querySelectorAll(".screen").forEach(el => {
    el.classList.add("hidden");
  });

  let screen = document.getElementById(id);

  if (!screen) {
    createExtraScreens();
    screen = document.getElementById(id);
  }

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
  let menu = document.getElementById("appMenu");

  if (!menu) {
    createMenu();
    menu = document.getElementById("appMenu");
  }

  menu.style.display = "block";
}

function closeMenu() {
  const menu = document.getElementById("appMenu");

  if (menu) {
    menu.style.display = "none";
  }
}

function createMenu() {

  if (document.getElementById("appMenu")) return;

  const menu = document.createElement("div");

  menu.id = "appMenu";

  menu.innerHTML = `
    <div style="
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.35);
      z-index:9998;
    " onclick="closeMenu()"></div>

    <div style="
      position:fixed;
      top:0;
      left:0;
      width:310px;
      max-width:82%;
      height:100vh;
      background:#fffdf8;
      z-index:9999;
      padding:28px 20px;
      box-sizing:border-box;
      box-shadow:4px 0 20px rgba(0,0,0,.15);
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:28px;
      ">
        <strong style="font-size:25px;">Menu</strong>

        <button
          onclick="closeMenu()"
          style="
            border:0;
            background:none;
            font-size:28px;
            cursor:pointer;
          "
        >×</button>
      </div>

      <button onclick="show('home')" style="${menuButton()}">
        🏠 &nbsp; Utama
      </button>

      <button onclick="show('transactions')" style="${menuButton()}">
        💰 &nbsp; Transaksi
      </button>

      <button onclick="show('items')" style="${menuButton()}">
        🛒 &nbsp; Item Beli
      </button>

      <button onclick="show('accounts')" style="${menuButton()}">
        🧮 &nbsp; Akaun
      </button>

      <button onclick="show('report')" style="${menuButton()}">
        📊 &nbsp; Laporan
      </button>

      <button onclick="openAdd();closeMenu()" style="${menuButton()}">
        ＋ &nbsp; Tambah Transaksi
      </button>

    </div>
  `;

  document.body.appendChild(menu);
}

function menuButton() {
  return `
    width:100%;
    display:block;
    text-align:left;
    padding:15px 8px;
    margin:2px 0;
    border:0;
    background:transparent;
    font-size:18px;
    font-weight:600;
    color:#1d3027;
    cursor:pointer;
  `;
}

/* =========================
   TAMBAH / EDIT TRANSAKSI
========================= */

function openAdd() {

  editingId = null;

  const modal = document.getElementById("modal");

  if (!modal) return;

  modal.classList.remove("hidden");

  const title = document.getElementById("modalTitle");

  if (title) {
    title.textContent = "Tambah Transaksi";
  }

  document.getElementById("name").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";

  setType("income");
}

function closeModal() {

  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.add("hidden");
  }

  editingId = null;
}

function setType(type) {

  currentType = type;

  const incomeTab = document.getElementById("incomeTab");
  const expenseTab = document.getElementById("expenseTab");

  if (incomeTab) {
    incomeTab.classList.toggle("sel", type === "income");
  }

  if (expenseTab) {
    expenseTab.classList.toggle("sel", type === "expense");
  }
}

function saveTx() {

  const nameEl = document.getElementById("name");
  const amountEl = document.getElementById("amount");
  const categoryEl = document.getElementById("category");

  const name = nameEl.value.trim();
  const amount = Number(amountEl.value);
  const category = categoryEl.value.trim() || "Umum";

  if (!name || !amount || amount <= 0) {
    alert("Sila masukkan nama dan jumlah.");
    return;
  }

  if (editingId !== null) {

    const tx = transactions.find(t => t.id === editingId);

    if (tx) {
      tx.name = name;
      tx.amount = amount;
      tx.category = category;
      tx.type = currentType;
    }

  } else {

    transactions.unshift({
      id: Date.now(),
      name: name,
      amount: amount,
      category: category,
      type: currentType,
      date: new Date().toISOString()
    });

  }

  saveData();

  closeModal();

  render();

  show("transactions");
}

/* =========================
   EDIT
========================= */

function editTransaction(id) {
  const tx = transactions.find(t => String(t.id) === String(id));

  if (!tx) {
    alert("Transaksi tidak dijumpai.");
    return;
  }

  editingId = tx.id;

  const modal = document.getElementById("modal");

  if (!modal) {
    alert("Borang Edit tidak dijumpai.");
    return;
  }

  modal.classList.remove("hidden");

  const title = document.getElementById("modalTitle");
  const name = document.getElementById("name");
  const amount = document.getElementById("amount");
  const category = document.getElementById("category");

  if (title) title.textContent = "Edit Transaksi";
  if (name) name.value = tx.name || "";
  if (amount) amount.value = tx.amount || "";
  if (category) category.value = tx.category || "";

  setType(tx.type || "income");
}
/* =========================
   HAPUS
========================= */

function deleteTransaction(id) {

  const tx = transactions.find(t => t.id === id);

  if (!tx) return;

  const confirmDelete = confirm(
    "Hapus transaksi \"" + tx.name + "\"?"
  );

  if (!confirmDelete) return;

  transactions = transactions.filter(t => t.id !== id);

  saveData();

  render();
}

/* =========================
   AKAUN
========================= */

function openAccount() {

  const modal = document.getElementById("accountModal");

  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeAccount() {

  const modal = document.getElementById("accountModal");

  if (modal) {
    modal.classList.add("hidden");
  }
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
    name: name,
    amount: amount
  });

  saveData();

  document.getElementById("accName").value = "";
  document.getElementById("accAmount").value = "";

  closeAccount();

  render();
}

/* =========================
   RENDER UTAMA
========================= */

function render() {

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;

  const incomeTotal = document.getElementById("incomeTotal");
  const expenseTotal = document.getElementById("expenseTotal");
  const balanceEl = document.getElementById("balance");
  const incomeRow = document.getElementById("incomeRow");
  const expenseRow = document.getElementById("expenseRow");

  if (incomeTotal) {
    incomeTotal.textContent = money(income);
  }

  if (expenseTotal) {
    expenseTotal.textContent = money(expense);
  }

  if (balanceEl) {
    balanceEl.textContent = money(balance);
  }

  if (incomeRow) {
    incomeRow.textContent = money(income);
  }

  if (expenseRow) {
    expenseRow.textContent = money(expense);
  }

  const savingRow = document.getElementById("savingRow");

  if (savingRow) {
    savingRow.textContent = money(0);
  }

  renderRecent();
  renderAccounts();
  renderItems();
  renderTransactions();
  renderReport();
}

/* =========================
   TRANSAKSI TERBARU
========================= */

function renderRecent() {

  const recent = document.getElementById("recent");

  if (!recent) return;

  if (transactions.length === 0) {

    recent.innerHTML = `
      <div class="row">
        <span>Belum ada transaksi</span>
      </div>
    `;

    return;
  }

  recent.innerHTML = transactions
    .slice(0, 5)
    .map(t => `

      <div class="row">

        <span class="dot ${t.type === "income" ? "green" : "pink"}">
          ${t.type === "income" ? "↓" : "↑"}
        </span>

        <b>${escapeHtml(t.name)}</b>

        <span>
          ${t.type === "income" ? "+" : "-"} ${money(t.amount)}
        </span>

      </div>

    `)
    .join("");
}

/* =========================
   HALAMAN TRANSAKSI
========================= */

function renderTransactions() {

  const list = document.getElementById("transactionList");

  if (!list) return;

  if (transactions.length === 0) {

    list.innerHTML = `
      <div style="
        padding:30px;
        text-align:center;
        color:#777;
      ">
        Belum ada transaksi.
      </div>
    `;

    return;
  }

  list.innerHTML = transactions.map(t => `

    <div style="
      padding:18px;
      border-bottom:1px solid #eee;
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
      ">

        <div>

          <strong style="
            font-size:17px;
            display:block;
          ">
            ${escapeHtml(t.name)}
          </strong>

          <small style="
            color:#777;
            display:block;
            margin-top:4px;
          ">
            ${escapeHtml(t.category)}
          </small>

        </div>

        <strong style="
          white-space:nowrap;
          color:${t.type === "income" ? "#23734d" : "#555"};
        ">
          ${t.type === "income" ? "+" : "-"} ${money(t.amount)}
        </strong>

      </div>

      <div style="margin-top:10px;">

        <button
          onclick="editTransaction(${t.id})"
          style="
            border:0;
            background:#eee9d8;
            padding:7px 14px;
            border-radius:8px;
            margin-right:6px;
          "
        >
          Edit
        </button>

        <button
          onclick="deleteTransaction(${t.id})"
          style="
            border:0;
            background:#f9d9dc;
            color:#a44;
            padding:7px 14px;
            border-radius:8px;
          "
        >
          Hapus
        </button>

      </div>

    </div>

  `).join("");
}

/* =========================
   ITEM BELI
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

    <div style="
      padding:18px;
      border-bottom:1px solid #eee;
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">

        <div>

          <b style="font-size:17px;">
            ${escapeHtml(t.name)}
          </b>

          <small style="
            display:block;
            color:#777;
            margin-top:4px;
          ">
            ${escapeHtml(t.category)}
          </small>

        </div>

        <strong>
          - ${money(t.amount)}
        </strong>

      </div>

      <div style="margin-top:10px;">

        <button
          type="button"
          class="edit-btn"
          data-id="${t.id}"
          style="
            border:0;
            background:#eee9d8;
            padding:7px 14px;
            border-radius:8px;
            margin-right:6px;
          "
        >
          Edit
        </button>

        <button
          onclick="deleteTransaction(${t.id})"
          style="
            border:0;
            background:#f9d9dc;
            color:#a44;
            padding:7px 14px;
            border-radius:8px;
          "
        >
          Hapus
        </button>

      </div>

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
    (s, a) => s + Number(a.amount),
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

    <div class="row">

      <b>${escapeHtml(a.name)}</b>

      <span>${money(a.amount)}</span>

    </div>

  `).join("");
}

/* =========================
   LAPORAN
========================= */

function renderReport() {

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const balance = income - expense;

  const incomeEl = document.getElementById("reportIncome");
  const expenseEl = document.getElementById("reportExpense");
  const balanceEl = document.getElementById("reportBalance");
  const countEl = document.getElementById("reportCount");
  const averageEl = document.getElementById("reportAverage");

  if (incomeEl) incomeEl.textContent = money(income);
  if (expenseEl) expenseEl.textContent = money(expense);
  if (balanceEl) balanceEl.textContent = money(balance);

  if (countEl) {
    countEl.textContent = transactions.length;
  }

  if (averageEl) {
    averageEl.textContent = money(
      transactions.length
        ? expense / transactions.filter(t => t.type === "expense").length || 0
        : 0
    );
  }
}

/* =========================
   CIPTA HALAMAN TAMBAHAN
========================= */

function createExtraScreens() {

  const app = document.getElementById("app");

  if (!app) return;

  /* TRANSACTIONS */

  if (!document.getElementById("transactions")) {

    const section = document.createElement("section");

    section.className = "screen hidden";
    section.id = "transactions";

    section.innerHTML = `

      <header class="pagehead">

        <button onclick="show('home')">‹</button>

        <h2>Transaksi</h2>

        <button onclick="openAdd()">＋</button>

      </header>

      <div id="transactionList"
        style="
          background:#fff;
          border-radius:22px;
          overflow:hidden;
          margin:20px;
        ">
      </div>

    `;

    app.appendChild(section);
  }

  /* REPORT */

  if (!document.getElementById("report")) {

    const section = document.createElement("section");

    section.className = "screen hidden";
    section.id = "report";

    section.innerHTML = `

      <header class="pagehead">

        <button onclick="show('home')">‹</button>

        <h2>Laporan</h2>

        <button onclick="show('home')">⌂</button>

      </header>

      <div style="padding:20px;">

        <div class="card">
          <small>Duit Masuk</small>
          <strong id="reportIncome">RM 0.00</strong>
        </div>

        <div class="card">
          <small>Duit Keluar</small>
          <strong id="reportExpense">RM 0.00</strong>
        </div>

        <div class="balance">
          <div>
            <small>Baki</small>
            <strong id="reportBalance">RM 0.00</strong>
          </div>
        </div>

        <h3 style="margin-top:25px;">
          Ringkasan
        </h3>

        <div class="list">

          <div class="row">
            <b>Jumlah transaksi</b>
            <span id="reportCount">0</span>
          </div>

          <div class="row">
            <b>Purata perbelanjaan</b>
            <span id="reportAverage">RM 0.00</span>
          </div>

        </div>

      </div>

    `;

    app.appendChild(section);
  }
}

/* =========================
   BUTANG MENU ☰
========================= */

function setupMenuButton() {

  const hamb = document.querySelector(".hamb");

  if (!hamb) return;

  hamb.style.cursor = "pointer";

  hamb.onclick = function() {
    openMenu();
  };
}

/* =========================
   MULA APP
========================= */

document.addEventListener("DOMContentLoaded", function() {

  createMenu();
  createExtraScreens();

  setupMenuButton();

  render();

});

/* Jika script dimuat selepas DOM */
createMenu();
createExtraScreens();
setupMenuButton();
render();
