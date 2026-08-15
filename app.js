const KEY_TX = "duitMasuk_transactions";
const KEY_ACCOUNTS = "duitMasuk_accounts";

let transactions = JSON.parse(localStorage.getItem(KEY_TX) || "[]");
let accounts = JSON.parse(localStorage.getItem(KEY_ACCOUNTS) || "[]");

let currentType = "income";
let currentAccountFilter = "all";

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


/* =========================
   NAVIGASI
========================= */

function show(id) {
  document.querySelectorAll(".screen").forEach(el => {
    el.classList.add("hidden");
  });

  const screen = document.getElementById(id);

  if (screen) {
    screen.classList.remove("hidden");
  }

  render();
}


/* =========================
   TRANSAKSI
========================= */

function openAdd() {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.remove("hidden");
  }

  setType("income");
}

function closeModal() {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.add("hidden");
  }
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

  if (!nameEl || !amountEl || !categoryEl) {
    return;
  }

  const name = nameEl.value.trim();
  const amount = Number(amountEl.value);
  const category = categoryEl.value.trim();

  if (!name || !amount || amount <= 0) {
    alert("Sila masukkan nama dan jumlah.");
    return;
  }

  transactions.unshift({
    id: Date.now(),
    name: name,
    amount: amount,
    category: category || "Umum",
    type: currentType,
    date: new Date().toISOString()
  });

  localStorage.setItem(
    KEY_TX,
    JSON.stringify(transactions)
  );

  nameEl.value = "";
  amountEl.value = "";
  categoryEl.value = "";

  closeModal();

  render();
  show("home");
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
  const nameEl = document.getElementById("accName");
  const amountEl = document.getElementById("accAmount");
  const typeEl = document.getElementById("accType");

  if (!nameEl || !amountEl) {
    return;
  }

  const name = nameEl.value.trim();
  const amount = Number(amountEl.value);
  const type = typeEl ? typeEl.value : "bank";

  if (!name || amount < 0) {
    alert("Sila masukkan nama akaun dan baki.");
    return;
  }

  accounts.push({
    id: Date.now(),
    name: name,
    amount: amount,
    type: type
  });

  localStorage.setItem(
    KEY_ACCOUNTS,
    JSON.stringify(accounts)
  );

  nameEl.value = "";
  amountEl.value = "";

  closeAccount();

  renderAccounts();
}


/* =========================
   AKAUN - FILTER
========================= */

function filterAccounts(type) {
  currentAccountFilter = type;

  renderAccounts();
}

function getAccountTypeName(type) {
  if (type === "bank") {
    return "Bank";
  }

  if (type === "ewallet") {
    return "E-Wallet";
  }

  if (type === "tunai") {
    return "Tunai";
  }

  return "Bank";
}


/* =========================
   RENDER UTAMA
========================= */

function render() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

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

  renderRecent();
  renderAccounts();
  renderItems();
}


/* =========================
   TRANSAKSI TERBARU
========================= */

function renderRecent() {
  const recent = document.getElementById("recent");

  if (!recent) {
    return;
  }

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
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="dot ${t.type === "income" ? "green" : "pink"}">
            ${t.type === "income" ? "↓" : "↑"}
          </span>

          <div>
            <b>${escapeHtml(t.name)}</b>
            <small style="display:block;color:#777;">
              ${escapeHtml(t.category || "Umum")}
            </small>
          </div>
        </div>

        <span style="font-weight:600;">
          ${t.type === "income" ? "+" : "-"} ${money(t.amount)}
        </span>
      </div>
    `)
    .join("");
}


/* =========================
   SENARAI AKAUN
========================= */

function renderAccounts() {
  const list = document.getElementById("accountList");
  const total = document.getElementById("accountTotal");

  if (!list || !total) {
    return;
  }

  const totalAll = accounts.reduce(
    (sum, a) => sum + Number(a.amount || 0),
    0
  );

  total.textContent = money(totalAll);

  let filteredAccounts = accounts;

  if (currentAccountFilter !== "all") {
    filteredAccounts = accounts.filter(a => {
      const accountType = a.type || "bank";
      return accountType === currentAccountFilter;
    });
  }

  if (filteredAccounts.length === 0) {
    list.innerHTML = `
      <div class="row">
        <span>Belum ada akaun</span>
      </div>
    `;
    return;
  }

  list.innerHTML = filteredAccounts
    .map(a => `
      <div
        class="row"
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:16px;
        "
      >
        <div>
          <b>${escapeHtml(a.name)}</b>

          <small style="display:block;color:#777;">
            ${getAccountTypeName(a.type || "bank")}
          </small>
        </div>

        <span>${money(a.amount)}</span>
      </div>
    `)
    .join("");
}


/* =========================
   ITEM BELI
========================= */

function renderItems() {
  const list = document.getElementById("itemList");

  if (!list) {
    return;
  }

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

  list.innerHTML = expenses
    .map(t => `
      <div class="row">
        <div>
          <b>${escapeHtml(t.name)}</b>

          <small style="display:block;color:#777;">
            ${escapeHtml(t.category || "Umum")}
          </small>
        </div>

        <span>
          ${money(t.amount)}
        </span>
      </div>
    `)
    .join("");
}


/* =========================
   TAB AKAUN
========================= */

function setupAccountTabs() {
  const accountScreen = document.getElementById("accounts");

  if (!accountScreen) {
    return;
  }

  const buttons = accountScreen.querySelectorAll("button");

  buttons.forEach(button => {
    const text = button.textContent.trim();

    if (text === "Semua") {
      button.onclick = () => filterAccounts("all");
    }

    if (text === "Bank") {
      button.onclick = () => filterAccounts("bank");
    }

    if (text === "E-Wallet") {
      button.onclick = () => filterAccounts("ewallet");
    }

    if (text === "Tunai") {
      button.onclick = () => filterAccounts("tunai");
    }
  });
}


/* =========================
   MULA APP
========================= */

setupAccountTabs();
render();
