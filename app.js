const KEY_TX = "duitMasuk_transactions";
const KEY_ACCOUNTS = "duitMasuk_accounts";

let transactions = JSON.parse(
  localStorage.getItem(KEY_TX) || "[]"
);

let accounts = JSON.parse(
  localStorage.getItem(KEY_ACCOUNTS) || "[]"
);

let currentType = "income";


// ==============================
// FORMAT DUIT
// ==============================

function money(value) {
  return "RM " + Number(value || 0).toFixed(2);
}


// ==============================
// PAPARAN SCREEN
// ==============================

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


// ==============================
// MODAL TRANSAKSI
// ==============================

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


// ==============================
// PILIH DUIT MASUK / KELUAR
// ==============================

function setType(type) {
  currentType = type;

  const incomeTab = document.getElementById("incomeTab");
  const expenseTab = document.getElementById("expenseTab");

  if (incomeTab) {
    incomeTab.classList.toggle(
      "sel",
      type === "income"
    );
  }

  if (expenseTab) {
    expenseTab.classList.toggle(
      "sel",
      type === "expense"
    );
  }
}


// ==============================
// SIMPAN TRANSAKSI
// ==============================

function saveTx() {
  const nameEl = document.getElementById("name");
  const amountEl = document.getElementById("amount");
  const categoryEl = document.getElementById("category");

  if (!nameEl || !amountEl) return;

  const name = nameEl.value.trim();
  const amount = Number(amountEl.value);
  const category = categoryEl
    ? categoryEl.value.trim()
    : "";

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

  if (categoryEl) {
    categoryEl.value = "";
  }

  closeModal();
  render();

  show("home");
}


// ==============================
// MODAL AKAUN
// ==============================

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


// ==============================
// SIMPAN AKAUN
// ==============================

function saveAccount() {
  const nameEl = document.getElementById("accName");
  const amountEl = document.getElementById("accAmount");

  if (!nameEl || !amountEl) return;

  const name = nameEl.value.trim();
  const amount = Number(amountEl.value);

  if (!name || amount < 0 || isNaN(amount)) {
    alert("Sila masukkan nama akaun dan baki.");
    return;
  }

  accounts.push({
    id: Date.now(),
    name: name,
    amount: amount
  });

  localStorage.setItem(
    KEY_ACCOUNTS,
    JSON.stringify(accounts)
  );

  nameEl.value = "";
  amountEl.value = "";

  closeAccount();
  render();
}


// ==============================
// RENDER UTAMA
// ==============================

function render() {

  const income = transactions
    .filter(t => t.type === "income")
    .reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

  const balance = income - expense;


  // Duit masuk
  const incomeTotal =
    document.getElementById("incomeTotal");

  if (incomeTotal) {
    incomeTotal.textContent = money(income);
  }


  // Duit keluar
  const expenseTotal =
    document.getElementById("expenseTotal");

  if (expenseTotal) {
    expenseTotal.textContent = money(expense);
  }


  // Baki
  const balanceEl =
    document.getElementById("balance");

  if (balanceEl) {
    balanceEl.textContent = money(balance);
  }


  // Ringkasan
  const incomeRow =
    document.getElementById("incomeRow");

  if (incomeRow) {
    incomeRow.textContent = money(income);
  }


  const expenseRow =
    document.getElementById("expenseRow");

  if (expenseRow) {
    expenseRow.textContent = money(expense);
  }


  // Simpanan
  const savingRow =
    document.getElementById("savingRow");

  if (savingRow) {
    savingRow.textContent = money(0);
  }


  // Transaksi terbaru
  const recent =
    document.getElementById("recent");

  if (recent) {

    if (transactions.length === 0) {

      recent.innerHTML = `
        <div class="row">
          <span>Belum ada transaksi</span>
        </div>
      `;

    } else {

      recent.innerHTML =
        transactions
          .slice(0, 5)
          .map(t => transactionHTML(t))
          .join("");
    }
  }


  renderAccounts();
  renderItems();
}


// ==============================
// HTML TRANSAKSI
// ==============================

function transactionHTML(t) {

  const isIncome = t.type === "income";

  const sign = isIncome ? "+" : "-";

  const dotClass = isIncome
    ? "green"
    : "pink";

  return `
    <div
      class="row transaction-row"
      style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        min-height:72px;
      "
    >

      <div
        style="
          display:flex;
          align-items:center;
          gap:12px;
          min-width:0;
          flex:1;
        "
      >

        <span
          class="dot ${dotClass}"
          style="
            flex:0 0 auto;
          "
        ></span>

        <div
          style="
            min-width:0;
            overflow:hidden;
          "
        >

          <b
            style="
              display:block;
              white-space:nowrap;
              overflow:hidden;
              text-overflow:ellipsis;
            "
          >
            ${escapeHtml(t.name)}
          </b>

          <small
            style="
              display:block;
              color:#777;
              margin-top:4px;
            "
          >
            ${escapeHtml(t.category || "Umum")}
          </small>

        </div>

      </div>


      <div
        style="
          text-align:right;
          white-space:nowrap;
          flex:0 0 auto;
        "
      >

        <strong>
          ${sign} ${money(t.amount)}
        </strong>

      </div>

    </div>
  `;
}


// ==============================
// SENARAI AKAUN
// ==============================

function renderAccounts() {

  const list =
    document.getElementById("accountList");

  const total =
    document.getElementById("accountTotal");

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


  list.innerHTML =
    accounts
      .map(accountHTML)
      .join("");
}


// ==============================
// HTML AKAUN
// ==============================

function accountHTML(a) {

  return `
    <div
      class="row account-row"
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:16px;
        padding:18px 4px;
      "
    >

      <div
        style="
          min-width:0;
          flex:1;
        "
      >

        <b
          style="
            display:block;
            font-size:17px;
          "
        >
          ${escapeHtml(a.name)}
        </b>

      </div>


      <div
        style="
          text-align:right;
          white-space:nowrap;
        "
      >

        <span
          style="
            display:block;
            font-weight:600;
          "
        >
          ${money(a.amount)}
        </span>


        <div
          style="
            margin-top:7px;
          "
        >

          <button
            onclick="editAccount('${a.id}')"
            style="
              border:0;
              background:#eef5f1;
              color:#214d3e;
              border-radius:8px;
              padding:5px 9px;
              margin-right:4px;
            "
          >
            ✏️
          </button>


          <button
            onclick="deleteAccount('${a.id}')"
            style="
              border:0;
              background:#fff0f0;
              color:#c75b5b;
              border-radius:8px;
              padding:5px 9px;
            "
          >
            🗑️
          </button>

        </div>

      </div>

    </div>
  `;
}


// ==============================
// SENARAI ITEM BELI
// ==============================

function renderItems() {

  const list =
    document.getElementById("itemList");

  if (!list) return;


  const expenses =
    transactions.filter(
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


  list.innerHTML =
    expenses
      .map(t => `

        <div
          class="row transaction-row"
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            min-height:76px;
          "
        >

          <div
            style="
              display:flex;
              align-items:center;
              gap:12px;
              min-width:0;
              flex:1;
            "
          >

            <span
              class="dot pink"
              style="
                flex:0 0 auto;
              "
            ></span>


            <div
              style="
                min-width:0;
              "
            >

              <b
                style="
                  display:block;
                  white-space:nowrap;
                  overflow:hidden;
                  text-overflow:ellipsis;
                "
              >
                ${escapeHtml(t.name)}
              </b>


              <small
                style="
                  display:block;
                  color:#777;
                  margin-top:4px;
                "
              >
                ${escapeHtml(t.category || "Umum")}
              </small>

            </div>

          </div>


          <div
            style="
              text-align:right;
              white-space:nowrap;
            "
          >

            <strong>
              - ${money(t.amount)}
            </strong>


            <div
              style="
                margin-top:6px;
              "
            >

              <button
                onclick="editTransaction('${t.id}')"
                style="
                  border:0;
                  background:#eef5f1;
                  color:#214d3e;
                  border-radius:8px;
                  padding:5px 9px;
                  margin-right:4px;
                "
              >
                ✏️
              </button>


              <button
                onclick="deleteTransaction('${t.id}')"
                style="
                  border:0;
                  background:#fff0f0;
                  color:#c75b5b;
                  border-radius:8px;
                  padding:5px 9px;
                "
              >
                🗑️
              </button>

            </div>

          </div>

        </div>

      `)
      .join("");
}


// ==============================
// EDIT TRANSAKSI
// ==============================

function editTransaction(id) {

  const tx =
    transactions.find(
      t => String(t.id) === String(id)
    );

  if (!tx) return;


  const name =
    prompt(
      "Nama transaksi:",
      tx.name
    );

  if (name === null) return;


  const amountText =
    prompt(
      "Jumlah RM:",
      tx.amount
    );

  if (amountText === null) return;


  const amount =
    Number(amountText);


  if (
    !name.trim() ||
    !amount ||
    amount <= 0
  ) {

    alert(
      "Sila masukkan nama dan jumlah yang betul."
    );

    return;
  }


  const category =
    prompt(
      "Kategori:",
      tx.category || "Umum"
    );


  if (category === null) return;


  tx.name =
    name.trim();

  tx.amount =
    amount;

  tx.category =
    category.trim() || "Umum";


  localStorage.setItem(
    KEY_TX,
    JSON.stringify(transactions)
  );


  render();
}


// ==============================
// PADAM TRANSAKSI
// ==============================

function deleteTransaction(id) {

  const tx =
    transactions.find(
      t => String(t.id) === String(id)
    );

  if (!tx) return;


  const confirmDelete =
    confirm(
      `Padam transaksi "${tx.name}"?`
    );


  if (!confirmDelete) return;


  transactions =
    transactions.filter(
      t => String(t.id) !== String(id)
    );


  localStorage.setItem(
    KEY_TX,
    JSON.stringify(transactions)
  );


  render();
}


// ==============================
// EDIT AKAUN
// ==============================

function editAccount(id) {

  const account =
    accounts.find(
      a => String(a.id) === String(id)
    );

  if (!account) return;


  const name =
    prompt(
      "Nama akaun:",
      account.name
    );

  if (name === null) return;


  const amountText =
    prompt(
      "Baki akaun RM:",
      account.amount
    );

  if (amountText === null) return;


  const amount =
    Number(amountText);


  if (
    !name.trim() ||
    isNaN(amount) ||
    amount < 0
  ) {

    alert(
      "Sila masukkan nama dan baki yang betul."
    );

    return;
  }


  account.name =
    name.trim();

  account.amount =
    amount;


  localStorage.setItem(
    KEY_ACCOUNTS,
    JSON.stringify(accounts)
  );


  render();
}


// ==============================
// PADAM AKAUN
// ==============================

function deleteAccount(id) {

  const account =
    accounts.find(
      a => String(a.id) === String(id)
    );

  if (!account) return;


  const confirmDelete =
    confirm(
      `Padam akaun "${account.name}"?`
    );


  if (!confirmDelete) return;


  accounts =
    accounts.filter(
      a => String(a.id) !== String(id)
    );


  localStorage.setItem(
    KEY_ACCOUNTS,
    JSON.stringify(accounts)
  );


  render();
}


// ==============================
// KESELAMATAN HTML
// ==============================

function escapeHtml(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ==============================
// MULA APLIKASI
// ==============================

render();
