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
