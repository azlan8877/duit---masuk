/* =========================================================
   DUIT MASUK - APLIKASI KEWANGAN
   app.js
========================================================= */


/* =========================================================
   DATA
========================================================= */

const KEY_TX = "duitMasuk_transactions";
const KEY_ACCOUNTS = "duitMasuk_accounts";

let transactions = [];
let accounts = [];

let currentType = "income";
let currentAccountFilter = "all";


/* =========================================================
   LOAD DATA
========================================================= */

try {
  transactions = JSON.parse(
    localStorage.getItem(KEY_TX) || "[]"
  );
} catch (error) {
  transactions = [];
}

try {
  accounts = JSON.parse(
    localStorage.getItem(KEY_ACCOUNTS) || "[]"
  );
} catch (error) {
  accounts = [];
}


/* =========================================================
   FORMAT DUIT
========================================================= */

function money(value) {
  const number = Number(value || 0);

  return "RM " + number.toFixed(2);
}


/* =========================================================
   KESELAMATAN HTML
========================================================= */

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   NAVIGASI SCREEN
========================================================= */

function show(id) {
  document
    .querySelectorAll(".screen")
    .forEach(screen => {
      screen.classList.add("hidden");
    });

  const target = document.getElementById(id);

  if (target) {
    target.classList.remove("hidden");
  }

  render();
}


/* =========================================================
   MODAL TRANSAKSI
========================================================= */

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


/* =========================================================
   PILIH DUIT MASUK / DUIT KELUAR
========================================================= */

function setType(type) {
  currentType = type;

  const incomeTab =
    document.getElementById("incomeTab");

  const expenseTab =
    document.getElementById("expenseTab");

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


/* =========================================================
   SIMPAN TRANSAKSI
========================================================= */

function saveTx() {
  const nameEl =
    document.getElementById("name");

  const amountEl =
    document.getElementById("amount");

  const categoryEl =
    document.getElementById("category");


  if (!nameEl || !amountEl || !categoryEl) {
    return;
  }


  const name =
    nameEl.value.trim();

  const amount =
    Number(amountEl.value);

  const category =
    categoryEl.value.trim();


  if (!name) {
    alert("Sila masukkan nama transaksi.");
    return;
  }


  if (!amount || amount <= 0) {
    alert("Sila masukkan jumlah yang betul.");
    return;
  }


  const transaction = {
    id: Date.now(),
    name: name,
    amount: amount,
    category: category || "Umum",
    type: currentType,
    date: new Date().toISOString()
  };


  transactions.unshift(transaction);


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


/* =========================================================
   AKAUN
========================================================= */

function openAccount() {
  const modal =
    document.getElementById("accountModal");

  if (modal) {
    modal.classList.remove("hidden");
  }
}


function closeAccount() {
  const modal =
    document.getElementById("accountModal");

  if (modal) {
    modal.classList.add("hidden");
  }
}


/* =========================================================
   SIMPAN AKAUN
========================================================= */

function saveAccount() {
  const nameEl =
    document.getElementById("accName");

  const amountEl =
    document.getElementById("accAmount");

  const typeEl =
    document.getElementById("accType");


  if (!nameEl || !amountEl) {
    return;
  }


  const name =
    nameEl.value.trim();

  const amount =
    Number(amountEl.value);

  const type =
    typeEl ? typeEl.value : "bank";


  if (!name) {
    alert("Sila masukkan nama akaun.");
    return;
  }


  if (isNaN(amount) || amount < 0) {
    alert("Sila masukkan baki akaun yang betul.");
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


/* =========================================================
   NAMA JENIS AKAUN
========================================================= */

function accountTypeName(type) {

  if (type === "bank") {
    return "Bank";
  }

  if (
    type === "ewallet" ||
    type === "e-wallet"
  ) {
    return "E-Wallet";
  }

  if (type === "tunai") {
    return "Tunai";
  }

  return "Bank";
}


/* =========================================================
   FILTER AKAUN
========================================================= */

function filterAccounts(type) {

  currentAccountFilter = type;

  updateAccountFilterButtons();

  renderAccounts();
}


function updateAccountFilterButtons() {

  const screen =
    document.getElementById("accounts");

  if (!screen) {
    return;
  }


  const buttons =
    screen.querySelectorAll("button");


  buttons.forEach(button => {

    const text =
      button.textContent.trim();


    let type = null;


    if (text === "Semua") {
      type = "all";
    }

    if (text === "Bank") {
      type = "bank";
    }

    if (text === "E-Wallet") {
      type = "ewallet";
    }

    if (text === "Tunai") {
      type = "tunai";
    }


    if (type !== null) {

      button.classList.toggle(
        "sel",
        currentAccountFilter === type
      );

    }

  });
}


/* =========================================================
   PASANG FILTER AKAUN
========================================================= */

function setupAccountFilters() {

  const screen =
    document.getElementById("accounts");

  if (!screen) {
    return;
  }


  const buttons =
    screen.querySelectorAll("button");


  buttons.forEach(button => {

    const text =
      button.textContent.trim();


    if (text === "Semua") {

      button.onclick = function () {
        filterAccounts("all");
      };

    }


    if (text === "Bank") {

      button.onclick = function () {
        filterAccounts("bank");
      };

    }


    if (text === "E-Wallet") {

      button.onclick = function () {
        filterAccounts("ewallet");
      };

    }


    if (text === "Tunai") {

      button.onclick = function () {
        filterAccounts("tunai");
      };

    }

  });


  updateAccountFilterButtons();
}


/* =========================================================
   RENDER UTAMA
========================================================= */

function render() {

  const income =
    transactions
      .filter(t => t.type === "income")
      .reduce(
        (sum, t) =>
          sum + Number(t.amount || 0),
        0
      );


  const expense =
    transactions
      .filter(t => t.type === "expense")
      .reduce(
        (sum, t) =>
          sum + Number(t.amount || 0),
        0
      );


  const balance =
    income - expense;


  /* DUIT MASUK */

  const incomeTotal =
    document.getElementById("incomeTotal");

  if (incomeTotal) {
    incomeTotal.textContent =
      money(income);
  }


  /* DUIT KELUAR */

  const expenseTotal =
    document.getElementById("expenseTotal");

  if (expenseTotal) {
    expenseTotal.textContent =
      money(expense);
  }


  /* BAKI */

  const balanceEl =
    document.getElementById("balance");

  if (balanceEl) {
    balanceEl.textContent =
      money(balance);
  }


  /* RINGKASAN */

  const incomeRow =
    document.getElementById("incomeRow");

  if (incomeRow) {
    incomeRow.textContent =
      money(income);
  }


  const expenseRow =
    document.getElementById("expenseRow");

  if (expenseRow) {
    expenseRow.textContent =
      money(expense);
  }


  /* SENARAI */

  renderRecent();

  renderAccounts();

  renderItems();
}


/* =========================================================
   TRANSAKSI TERBARU
========================================================= */

function renderRecent() {

  const recent =
    document.getElementById("recent");


  if (!recent) {
    return;
  }


  /* TIADA TRANSAKSI */

  if (transactions.length === 0) {

    recent.innerHTML = `
      <div style="
        padding:20px;
        text-align:center;
        color:#777;
      ">
        Belum ada transaksi
      </div>
    `;

    return;
  }


  /* SENARAI TRANSAKSI */

  recent.innerHTML =
    transactions
      .slice(0, 5)
      .map(t => {

        const isIncome =
          t.type === "income";


        const sign =
          isIncome ? "+" : "-";


        const bg =
          isIncome
            ? "#dff4e7"
            : "#fde1e4";


        const color =
          isIncome
            ? "#4d9b68"
            : "#d66a76";


        return `
          <div style="
            display:grid;
            grid-template-columns:minmax(0,1fr) auto;
            align-items:center;
            gap:12px;
            width:100%;
            min-height:72px;
            padding:14px 16px;
            box-sizing:border-box;
            border-bottom:1px solid #eee;
          ">

            <div style="
              display:flex;
              align-items:center;
              gap:12px;
              min-width:0;
            ">

              <div style="
                width:38px;
                height:38px;
                min-width:38px;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:18px;
                background:${bg};
                color:${color};
              ">
                ${isIncome ? "↓" : "↑"}
              </div>


              <div style="
                min-width:0;
                flex:1;
              ">

                <div style="
                  font-weight:700;
                  font-size:16px;
                  line-height:20px;
                  color:#18251f;
                  white-space:nowrap;
                  overflow:hidden;
                  text-overflow:ellipsis;
                ">
                  ${escapeHtml(t.name)}
                </div>


                <div style="
                  margin-top:3px;
                  font-size:13px;
                  line-height:18px;
                  color:#777;
                ">
                  ${escapeHtml(
                    t.category || "Umum"
                  )}
                </div>

              </div>

            </div>


            <div style="
              flex-shrink:0;
              white-space:nowrap;
              font-weight:600;
              font-size:15px;
              text-align:right;
              color:#59635f;
            ">
              ${sign} ${money(t.amount)}
            </div>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   SENARAI AKAUN
========================================================= */

function renderAccounts() {

  const list =
    document.getElementById("accountList");

  const total =
    document.getElementById("accountTotal");


  if (!list || !total) {
    return;
  }


  /* JUMLAH SEMUA AKAUN */

  const totalAmount =
    accounts.reduce(
      (sum, account) =>
        sum + Number(account.amount || 0),
      0
    );


  total.textContent =
    money(totalAmount);


  /* FILTER */

  let filtered =
    accounts;


  if (
    currentAccountFilter !== "all"
  ) {

    filtered =
      accounts.filter(account => {

        const type =
          account.type || "bank";


        if (
          currentAccountFilter === "ewallet"
        ) {

          return (
            type === "ewallet" ||
            type === "e-wallet"
          );

        }


        return type === currentAccountFilter;

      });

  }


  /* TIADA AKAUN */

  if (filtered.length === 0) {

    list.innerHTML = `
      <div style="
        padding:20px;
        text-align:center;
        color:#777;
      ">
        Belum ada akaun
      </div>
    `;

    return;
  }


  /* PAPAR AKAUN */

  list.innerHTML =
    filtered
      .map(account => {

        return `
          <div style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:16px;
            width:100%;
            min-height:70px;
            padding:16px 18px;
            box-sizing:border-box;
            border-bottom:1px solid #eee;
          ">

            <div style="
              min-width:0;
              flex:1;
            ">

              <div style="
                font-weight:700;
                font-size:17px;
                color:#18251f;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
              ">
                ${escapeHtml(account.name)}
              </div>


              <small style="
                display:block;
                margin-top:4px;
                color:#777;
              ">
                ${accountTypeName(
                  account.type
                )}
              </small>

            </div>


            <div style="
              flex-shrink:0;
              white-space:nowrap;
              font-size:16px;
              color:#59635f;
            ">
              ${money(account.amount)}
            </div>

          </div>
        `;

      })
      .join("");


  updateAccountFilterButtons();
}


/* =========================================================
   ITEM BELI
========================================================= */

function renderItems() {

  const list =
    document.getElementById("itemList");


  if (!list) {
    return;
  }


  const expenses =
    transactions.filter(
      t => t.type === "expense"
    );


  /* TIADA ITEM */

  if (expenses.length === 0) {

    list.innerHTML = `
      <div style="
        padding:20px;
        text-align:center;
        color:#777;
      ">
        Belum ada item beli
      </div>
    `;

    return;
  }


  /* PAPAR ITEM */

  list.innerHTML =
    expenses
      .map(t => {

        return `
          <div style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:16px;
            width:100%;
            min-height:68px;
            padding:14px 16px;
            box-sizing:border-box;
            border-bottom:1px solid #eee;
          ">

            <div style="
              min-width:0;
              flex:1;
            ">

              <div style="
                font-weight:700;
                color:#18251f;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
              ">
                ${escapeHtml(t.name)}
              </div>


              <small style="
                display:block;
                margin-top:3px;
                color:#777;
              ">
                ${escapeHtml(
                  t.category || "Umum"
                )}
              </small>

            </div>


            <div style="
              flex-shrink:0;
              white-space:nowrap;
              font-weight:600;
              color:#59635f;
            ">
              ${money(t.amount)}
            </div>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   START APP
========================================================= */

setupAccountFilters();

render();
