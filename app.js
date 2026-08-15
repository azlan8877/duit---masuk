const KEY_TX = "duitMasuk_transactions";
const KEY_ACCOUNTS = "duitMasuk_accounts";

let transactions = JSON.parse(localStorage.getItem(KEY_TX) || "[]");
let accounts = JSON.parse(localStorage.getItem(KEY_ACCOUNTS) || "[]");
let currentType = "income";
let editingTxId = null;
let editingAccountId = null;

function money(value) {
  return "RM " + Number(value || 0).toFixed(2);
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

function openAdd() {
  editingTxId = null;

  const modal = document.getElementById("modal");
  if (modal) {
    modal.classList.remove("hidden");
  }

  setType("income");

  const title = document.getElementById("modalTitle");
  if (title) title.textContent = "Tambah Transaksi";

  const name = document.getElementById("name");
  const amount = document.getElementById("amount");
  const category = document.getElementById("category");

  if (name) name.value = "";
  if (amount) amount.value = "";
  if (category) category.value = "";
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.add("hidden");

  editingTxId = null;
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

  if (!nameEl || !amountEl) return;

  const name = nameEl.value.trim();
  const amount = Number(amountEl.value);
  const category = categoryEl ? categoryEl.value.trim() : "";

  if (!name || !amount || amount <= 0) {
    alert("Sila masukkan nama dan jumlah.");
    return;
  }

  if (editingTxId !== null) {
    const index = transactions.findIndex(t => t.id === editingTxId);

    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        name,
        amount,
        category: category || "Umum",
        type: currentType
      };
    }
  } else {
    transactions.unshift({
      id: Date.now(),
      name,
      amount,
      category: category || "Umum",
      type: currentType,
      date: new Date().toISOString()
    });
  }

  localStorage.setItem(KEY_TX, JSON.stringify(transactions));

  if (nameEl) nameEl.value = "";
  if (amountEl) amountEl.value = "";
  if (categoryEl) categoryEl.value = "";

  closeModal();
  render();
  show("home");
}

function editTx(id) {
  const tx = transactions.find(t => String(t.id) === String(id));

  if (!tx) return;

  editingTxId = tx.id;

  const modal = document.getElementById("modal");
  if (modal) modal.classList.remove("hidden");

  const title = document.getElementById("modalTitle");
  if (title) title.textContent = "Edit Transaksi";

  const name = document.getElementById("name");
  const amount = document.getElementById("amount");
  const category = document.getElementById("category");

  if (name) name.value = tx.name;
  if (amount) amount.value = tx.amount;
  if (category) category.value = tx.category || "";

  setType(tx.type);
}

function deleteTx(id) {
  const tx = transactions.find(t => String(t.id) === String(id));

  if (!tx) return;

  const confirmDelete = confirm(
    `Padam transaksi "${tx.name}"?`
  );

  if (!confirmDelete) return;

  transactions = transactions.filter(
    t => String(t.id) !== String(id)
  );

  localStorage.setItem(KEY_TX, JSON.stringify(transactions));

  render();
}

function openAccount() {
  editingAccountId = null;

  const modal = document.getElementById("accountModal");

  if (modal) {
    modal.classList.remove("hidden");
  }

  const title = document.getElementById("accountModalTitle");
  if (title) title.textContent = "Tambah Akaun";

  const name = document.getElementById("accName");
  const amount = document.getElementById("accAmount");

  if (name) name.value = "";
  if (amount) amount.value = "";
}

function closeAccount() {
  const modal = document.getElementById("accountModal");

  if (modal) {
    modal.classList.add("hidden");
  }

  editingAccountId = null;
}

function saveAccount() {
  const nameEl = document.getElementById("accName");
  const amountEl = document.getElementById("accAmount");

  if (!nameEl || !amountEl) return;

  const name = nameEl.value.trim();
  const amount = Number(amountEl.value);

  if (!name || amount < 0) {
    alert("Sila masukkan nama akaun dan baki.");
    return;
  }

  if (editingAccountId !== null) {
    const index = accounts.findIndex(
      a => String(a.id) === String(editingAccountId)
    );

    if (index !== -1) {
      accounts[index] = {
        ...accounts[index],
        name,
        amount
      };
    }
  } else {
    accounts.push({
      id: Date.now(),
      name,
      amount
    });
  }

  localStorage.setItem(
    KEY_ACCOUNTS,
    JSON.stringify(accounts)
  );

  if (nameEl) nameEl.value = "";
  if (amountEl) amountEl.value = "";

  closeAccount();
  render();
}

function editAccount(id) {
  const account = accounts.find(
    a => String(a.id) === String(id)
  );

  if (!account) return;

  editingAccountId = account.id;

  const modal = document.getElementById("accountModal");
  if (modal) modal.classList.remove("hidden");

  const title = document.getElementById("accountModalTitle");
  if (title) title.textContent = "Edit Akaun";

  const name = document.getElementById("accName");
  const amount = document.getElementById("accAmount");

  if (name) name.value = account.name;
  if (amount) amount.value = account.amount;
}

function deleteAccount(id) {
  const account = accounts.find(
    a => String(a.id) === String(id)
  );

  if (!account) return;

  const confirmDelete = confirm(
    `Padam akaun "${account.name}"?`
  );

  if (!confirmDelete) return;

  accounts = accounts.filter(
    a => String(a.id) !== String(id)
  );

  localStorage.setItem(
    KEY_ACCOUNTS,
    JSON.stringify(accounts)
  );

  render();
}

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

  if (incomeTotal) incomeTotal.textContent = money(income);
  if (expenseTotal) expenseTotal.textContent = money(expense);
  if (balanceEl) balanceEl.textContent = money(balance);
  if (incomeRow) incomeRow.textContent = money(income);
  if (expenseRow) expenseRow.textContent = money(expense);

  renderRecent();
  renderAccounts();
  renderItems();
}

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
      <div class="row"
           style="display:flex;align-items:center;gap:12px;">

        <div style="
          width:40px;
          height:40px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:${t.type === "income" ? "#dff3e6" : "#fde1e3"};
          color:${t.type === "income" ? "#287052" : "#c85b68"};
          flex-shrink:0;
        ">
          ${t.type === "income" ? "↓" : "↑"}
        </div>

        <div style="flex:1;min-width:0;">
          <b>${escapeHtml(t.name)}</b>
          <small style="display:block;color:#777;">
            ${escapeHtml(t.category || "Umum")}
          </small>
        </div>

        <span style="font-weight:600;white-space:nowrap;">
          ${t.type === "income" ? "+" : "-"} ${money(t.amount)}
        </span>
      </div>
    `)
    .join("");
}

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

  list.innerHTML = accounts
    .map(a => `
      <div class="row"
           style="
             display:flex;
             align-items:center;
             justify-content:space-between;
             gap:12px;
           ">

        <div style="flex:1;min-width:0;">
          <b>${escapeHtml(a.name)}</b>
          <span style="margin-left:8px;">
            ${money(a.amount)}
          </span>
        </div>

        <div style="
          display:flex;
          gap:6px;
          flex-shrink:0;
        ">
          <button
            onclick="editAccount(${a.id})"
            style="
              border:0;
              background:#e8f2ed;
              border-radius:10px;
              padding:7px 9px;
              cursor:pointer;
            "
          >✏️</button>

          <button
            onclick="deleteAccount(${a.id})"
            style="
              border:0;
              background:#fde5e5;
              border-radius:10px;
              padding:7px 9px;
              cursor:pointer;
            "
          >🗑️</button>
        </div>

      </div>
    `)
    .join("");
}

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

  list.innerHTML = expenses
    .map(t => `
      <div class="row"
           style="
             display:flex;
             align-items:center;
             gap:12px;
           ">

        <div style="
          flex:1;
          min-width:0;
        ">

          <b style="
            display:block;
            font-size:16px;
          ">
            ${escapeHtml(t.name)}
          </b>

          <small style="
            display:block;
            color:#777;
            margin-top:3px;
          ">
            ${escapeHtml(t.category || "Umum")}
          </small>

        </div>

        <span style="
          font-weight:600;
          white-space:nowrap;
        ">
          ${money(t.amount)}
        </span>

        <div style="
          display:flex;
          gap:5px;
          flex-shrink:0;
        ">

          <button
            onclick="editTx(${t.id})"
            style="
              border:0;
              background:#e8f2ed;
              border-radius:10px;
              padding:7px 8px;
              cursor:pointer;
            "
            aria-label="Edit"
          >✏️</button>

          <button
            onclick="deleteTx(${t.id})"
            style="
              border:0;
              background:#fde5e5;
              border-radius:10px;
              padding:7px 8px;
              cursor:pointer;
            "
            aria-label="Padam"
          >🗑️</button>

        </div>

      </div>
    `)
    .join("");
}

render();
