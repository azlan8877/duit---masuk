const KEY_TX = "duitMasuk_transactions";
const KEY_ACCOUNTS = "duitMasuk_accounts";

let transactions = JSON.parse(
  localStorage.getItem(KEY_TX) || "[]"
);

let accounts = JSON.parse(
  localStorage.getItem(KEY_ACCOUNTS) || "[]"
);

let currentType = "income";


// ================= FORMAT DUIT =================

function money(value) {
  return "RM " + Number(value || 0).toFixed(2);
}


// ================= PAPAR SKRIN =================

function show(id) {

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  const screen = document.getElementById(id);

  if (screen) {
    screen.classList.remove("hidden");
  }

  render();
}


// ================= TRANSAKSI =================

function openAdd() {

  const modal = document.getElementById("modal");

  if (!modal) return;

  modal.classList.remove("hidden");

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


function saveTx() {

  const name =
    document.getElementById("name").value.trim();

  const amount =
    Number(
      document.getElementById("amount").value
    );

  const category =
    document.getElementById("category").value.trim();


  if (!name || !amount || amount <= 0) {

    alert(
      "Sila masukkan nama dan jumlah."
    );

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


  document.getElementById("name").value = "";

  document.getElementById("amount").value = "";

  document.getElementById("category").value = "";


  closeModal();

  render();

  show("home");
}


// ================= AKAUN =================

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


function saveAccount() {

  const name =
    document.getElementById("accName").value.trim();

  const amount =
    Number(
      document.getElementById("accAmount").value
    );


  if (!name || amount < 0) {

    alert(
      "Sila masukkan nama akaun dan baki."
    );

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


  document.getElementById("accName").value = "";

  document.getElementById("accAmount").value = "";


  closeAccount();

  render();

  show("accounts");
}


// ================= KIRAAN =================

function calculateTotals() {

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


  return {
    income,
    expense,
    balance
  };
}


// ================= PAPAR SEMUA =================

function render() {

  const totals =
    calculateTotals();


  // ---------------- HOME ----------------

  setText(
    "incomeTotal",
    money(totals.income)
  );

  setText(
    "expenseTotal",
    money(totals.expense)
  );

  setText(
    "balance",
    money(totals.balance)
  );

  setText(
    "incomeRow",
    money(totals.income)
  );

  setText(
    "expenseRow",
    money(totals.expense)
  );


  // Simpanan belum dibuat sebagai
  // jenis transaksi khas.
  setText(
    "savingRow",
    money(0)
  );


  // ---------------- LAPORAN ----------------

  setText(
    "reportIncome",
    money(totals.income)
  );

  setText(
    "reportExpense",
    money(totals.expense)
  );

  setText(
    "reportBalance",
    money(totals.balance)
  );


  setText(
    "reportCount",
    transactions.length
  );


  const expenses =
    transactions.filter(
      t => t.type === "expense"
    );


  const average =
    expenses.length > 0
      ? totals.expense / expenses.length
      : 0;


  setText(
    "reportAverage",
    money(average)
  );


  renderRecent();

  renderAccounts();

  renderItems();
}


// ================= PAPAR TEKS =================

function setText(id, value) {

  const element =
    document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}


// ================= TRANSAKSI TERBARU =================

function renderRecent() {

  const recent =
    document.getElementById("recent");

  if (!recent) return;


  if (transactions.length === 0) {

    recent.innerHTML = `
      <div class="row">
        <span>Belum ada transaksi</span>
      </div>
    `;

    return;
  }


  recent.innerHTML =
    transactions
      .slice(0, 5)
      .map(t => {

        const income =
          t.type === "income";

        return `
          <div class="row">

            <div
              style="
                display:flex;
                align-items:center;
                gap:12px;
                min-width:0;
              "
            >

              <span
                class="dot ${income ? "green" : "pink"}"
              >
                ${income ? "↓" : "↑"}
              </span>


              <div
                style="
                  min-width:0;
                  flex:1;
                "
              >

                <b
                  style="
                    display:block;
                    font-size:16px;
                    line-height:1.2;
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
                  ${escapeHtml(
                    t.category || "Umum"
                  )}
                </small>

              </div>

            </div>


            <span
              style="
                white-space:nowrap;
                font-weight:600;
              "
            >
              ${income ? "+" : "-"}
              ${money(t.amount)}
            </span>

          </div>
        `;

      })
      .join("");
}


// ================= AKAUN =================

function renderAccounts() {

  const list =
    document.getElementById("accountList");

  const total =
    document.getElementById("accountTotal");


  if (!list || !total) return;


  const sum =
    accounts.reduce(
      (s, a) =>
        s + Number(a.amount || 0),
      0
    );


  total.textContent =
    money(sum);


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

          <b>
            ${escapeHtml(a.name)}
          </b>

          <span>
            ${money(a.amount)}
          </span>

        </div>
      `)
      .join("");
}


// ================= ITEM BELI =================

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

        <div class="row">

          <div
            style="
              display:flex;
              align-items:center;
              gap:12px;
              min-width:0;
            "
          >

            <div
              style="
                min-width:0;
              "
            >

              <b
                style="
                  display:block;
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
                ${escapeHtml(
                  t.category || "Umum"
                )}
              </small>

            </div>

          </div>


          <span
            style="
              white-space:nowrap;
              font-weight:600;
            "
          >
            ${money(t.amount)}
          </span>

        </div>

      `)
      .join("");
}


// ================= KESELAMATAN HTML =================

function escapeHtml(text) {

  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ================= MULA APP =================

render();
