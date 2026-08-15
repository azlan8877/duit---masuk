const KEY_TX = "duitMasuk_transactions";
const KEY_ACCOUNTS = "duitMasuk_accounts";

let transactions = JSON.parse(
  localStorage.getItem(KEY_TX) || "[]"
);

let accounts = JSON.parse(
  localStorage.getItem(KEY_ACCOUNTS) || "[]"
);

let currentType = "income";
let editingId = null;


/* =========================
   DUIT
========================= */

function money(value) {
  return "RM " + Number(value || 0).toFixed(2);
}


/* =========================
   NAVIGATION
========================= */

function show(id) {
  document.querySelectorAll(".screen").forEach(function(screen) {
    screen.classList.add("hidden");
  });

  const screen = document.getElementById(id);

  if (screen) {
    screen.classList.remove("hidden");
  }

  render();
}


/* =========================
   TAMBAH TRANSAKSI
========================= */

function openAdd() {
  editingId = null;

  const title = document.getElementById("modalTitle");

  if (title) {
    title.textContent = "Tambah Transaksi";
  }

  clearForm();

  setType("income");

  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.remove("hidden");
  }
}


/* =========================
   EDIT TRANSAKSI
========================= */

function editTransaction(id) {

  const tx = transactions.find(function(item) {
    return String(item.id) === String(id);
  });

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

  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.remove("hidden");
  }
}


/* =========================
   HAPUS TRANSAKSI
========================= */

function deleteTransaction(id) {

  const tx = transactions.find(function(item) {
    return String(item.id) === String(id);
  });

  if (!tx) {
    return;
  }

  const yakin = confirm(
    'Hapus transaksi "' + tx.name + '"?'
  );

  if (!yakin) {
    return;
  }

  transactions = transactions.filter(function(item) {
    return String(item.id) !== String(id);
  });

  localStorage.setItem(
    KEY_TX,
    JSON.stringify(transactions)
  );

  render();
}


/* =========================
   TUTUP MODAL
========================= */

function closeModal() {

  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.add("hidden");
  }

  editingId = null;

  clearForm();
}


/* =========================
   KOSONGKAN BORANG
========================= */

function clearForm() {

  const name = document.getElementById("name");
  const amount = document.getElementById("amount");
  const category = document.getElementById("category");

  if (name) {
    name.value = "";
  }

  if (amount) {
    amount.value = "";
  }

  if (category) {
    category.value = "";
  }
}


/* =========================
   JENIS TRANSAKSI
========================= */

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


/* =========================
   SIMPAN / UPDATE
========================= */

function saveTx() {

  const nameEl =
    document.getElementById("name");

  const amountEl =
    document.getElementById("amount");

  const categoryEl =
    document.getElementById("category");

  if (!nameEl || !amountEl) {
    alert("Borang transaksi tidak dijumpai.");
    return;
  }

  const name =
    nameEl.value.trim();

  const amount =
    Number(amountEl.value);

  const category =
    categoryEl
      ? categoryEl.value.trim()
      : "";

  if (!name || !amount || amount <= 0) {
    alert(
      "Sila masukkan nama dan jumlah yang betul."
    );
    return;
  }


  /* =====================
     UPDATE TRANSAKSI
  ===================== */

  if (editingId !== null) {

    const index =
      transactions.findIndex(function(item) {
        return String(item.id) ===
               String(editingId);
      });

    if (index !== -1) {

      transactions[index] = {
        ...transactions[index],

        name: name,

        amount: amount,

        category:
          category || "Umum",

        type: currentType
      };
    }

  }


  /* =====================
     TRANSAKSI BARU
  ===================== */

  else {

    transactions.unshift({

      id: Date.now(),

      name: name,

      amount: amount,

      category:
        category || "Umum",

      type: currentType,

      date:
        new Date().toISOString()
    });

  }


  localStorage.setItem(
    KEY_TX,
    JSON.stringify(transactions)
  );

  closeModal();

  render();

  show("home");
}


/* =========================
   AKAUN
========================= */

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

  const nameEl =
    document.getElementById("accName");

  const amountEl =
    document.getElementById("accAmount");

  if (!nameEl || !amountEl) {
    return;
  }

  const name =
    nameEl.value.trim();

  const amount =
    Number(amountEl.value);

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

  nameEl.value = "";
  amountEl.value = "";

  closeAccount();

  render();
}


/* =========================
   RENDER UTAMA
========================= */

function render() {

  const income =
    transactions
      .filter(function(t) {
        return t.type === "income";
      })
      .reduce(function(sum, t) {
        return sum + Number(t.amount || 0);
      }, 0);


  const expense =
    transactions
      .filter(function(t) {
        return t.type === "expense";
      })
      .reduce(function(sum, t) {
        return sum + Number(t.amount || 0);
      }, 0);


  const balance =
    income - expense;


  setText(
    "incomeTotal",
    money(income)
  );

  setText(
    "expenseTotal",
    money(expense)
  );

  setText(
    "balance",
    money(balance)
  );

  setText(
    "incomeRow",
    money(income)
  );

  setText(
    "expenseRow",
    money(expense)
  );


  renderRecent();

  renderTransactions();

  renderItems();

  renderAccounts();
}


/* =========================
   TRANSAKSI TERKINI
========================= */

function renderRecent() {

  const recent =
    document.getElementById("recent");

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


  recent.innerHTML =
    transactions
      .slice(0, 5)
      .map(function(t) {

        return `
          <div class="row">

            <span class="dot ${
              t.type === "income"
                ? "green"
                : "pink"
            }">
              ${
                t.type === "income"
                  ? "↓"
                  : "↑"
              }
            </span>

            <b>
              ${escapeHtml(t.name)}
            </b>

            <span>
              ${
                t.type === "income"
                  ? "+"
                  : "-"
              }
              ${money(t.amount)}
            </span>

          </div>
        `;

      })
      .join("");
}


/* =========================
   HALAMAN TRANSAKSI
========================= */

function renderTransactions() {

  const list =
    document.getElementById(
      "transactionList"
    ) ||
    document.getElementById(
      "transactionsList"
    );

  if (!list) {
    return;
  }


  if (transactions.length === 0) {

    list.innerHTML = `
      <div class="row">
        <span>
          Belum ada transaksi
        </span>
      </div>
    `;

    return;
  }


  list.innerHTML =
    transactions
      .map(function(t) {

        const income =
          t.type === "income";

        return `

          <div class="row">

            <span class="dot ${
              income
                ? "green"
                : "pink"
            }">
              ${
                income
                  ? "↓"
                  : "↑"
              }
            </span>

            <div style="flex:1">

              <b>
                ${escapeHtml(t.name)}
              </b>

              <small style="
                display:block;
                color:#777;
              ">
                ${escapeHtml(
                  t.category || "Umum"
                )}
              </small>

              <div style="
                margin-top:6px;
              ">

                <button
                  type="button"
                  onclick="editTransaction('${t.id}')">
                  Edit
                </button>

                <button
                  type="button"
                  onclick="deleteTransaction('${t.id}')">
                  Hapus
                </button>

              </div>

            </div>

            <strong>
              ${
                income
                  ? "+"
                  : "-"
              }
              ${money(t.amount)}
            </strong>

          </div>

        `;

      })
      .join("");
}


/* =========================
   ITEM BELI
========================= */

function renderItems() {

  const list =
    document.getElementById(
      "itemList"
    );

  if (!list) {
    return;
  }

  const expenses =
    transactions.filter(function(t) {
      return t.type === "expense";
    });


  if (expenses.length === 0) {

    list.innerHTML = `
      <div class="row">
        <span>
          Belum ada item beli
        </span>
      </div>
    `;

    return;
  }


  list.innerHTML =
    expenses
      .map(function(t) {

        return `

          <div class="row">

            <div>

              <b>
                ${escapeHtml(t.name)}
              </b>

              <small style="
                display:block;
                color:#777;
              ">
                ${escapeHtml(
                  t.category || "Umum"
                )}
              </small>

            </div>

            <strong>
              ${money(t.amount)}
            </strong>

          </div>

        `;

      })
      .join("");
}


/* =========================
   AKAUN
========================= */

function renderAccounts() {

  const list =
    document.getElementById(
      "accountList"
    );

  const total =
    document.getElementById(
      "accountTotal"
    );

  if (!list || !total) {
    return;
  }


  const sum =
    accounts.reduce(function(
      totalAmount,
      account
    ) {
      return totalAmount +
        Number(account.amount || 0);
    }, 0);


  total.textContent =
    money(sum);


  if (accounts.length === 0) {

    list.innerHTML = `
      <div class="row">
        <span>
          Belum ada akaun
        </span>
      </div>
    `;

    return;
  }


  list.innerHTML =
    accounts
      .map(function(account) {

        return `

          <div class="row">

            <b>
              ${escapeHtml(
                account.name
              )}
            </b>

            <span>
              ${money(account.amount)}
            </span>

          </div>

        `;

      })
      .join("");
}


/* =========================
   HELPER
========================= */

function setText(id, value) {

  const element =
    document.getElementById(id);

  if (element) {
    element.textContent = value;
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
   MULA
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {
    render();
  }
);

render();
