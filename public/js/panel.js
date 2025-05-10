document.addEventListener('DOMContentLoaded', () => {
    let searchResults = {};
    let searchTables = [];
    let currentTableIndex = 0;

    const API_BASE = '/api/panel';
    const AUTH_API_BASE = '/api/auth';
    const tableSelect = document.getElementById('tableSelect');
    const addRecordBtn = document.getElementById('addRecordBtn');
    const tableHeaders = document.getElementById('tableHeaders');
    const tableBody = document.getElementById('tableBody');
    const viewModal = document.getElementById('viewModal');
    const viewModalContent = document.getElementById('viewModalContent');
    const closeViewModal = document.getElementById('closeViewModal');
    const addModal = document.getElementById('addModal');
    const closeAddModal = document.getElementById('closeAddModal');
    const addFormFields = document.getElementById('addFormFields');
    const addRecordForm = document.getElementById('addRecordForm');

    let currentColumns = [];

    const searchInput = document.querySelector('input[type="search"]');

    if (searchInput) {
        searchInput.addEventListener('keydown', async(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query.length > 0) {
                    await search(query);
                } else {
                    alert('Введіть запит для пошуку');
                }
            }
        });
    }

    // Switch table: reload columns and data
    tableSelect.addEventListener('change', async () => {
        const tbl = tableSelect.value;
        await Promise.all([loadColumns(tbl), loadTable(tbl)]);
    });

    // Open "Add Record" modal, ensuring columns are fresh
    addRecordBtn.addEventListener('click', async () => {
        const tbl = tableSelect.value;
        await loadColumns(tbl);
        openAddModal();
    });

    // Close modals
    closeViewModal.addEventListener('click', () => viewModal.classList.add('hidden'));
    closeAddModal.addEventListener('click', () => addModal.classList.add('hidden'));

    // Handle add form submission
    addRecordForm.addEventListener('submit', handleAddRecord);

    // Initial setup
    (async () => {
        try {
            await loadTableList();
            const first = tableSelect.value;
            await Promise.all([loadColumns(first), loadTable(first)]);
        } catch (err) {
            console.error('Initialization error:', err);
            alert('Initialization error: ' + err.message);
        }
    })();

    async function search(query) {
        try {
            const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error(res.statusText);

            const results = await res.json();

            if (!Array.isArray(results) || results.length === 0) {
                alert(`Не знайдено жодного запису по "${query}"`);
                document.getElementById('searchNav').classList.add('hidden');
                return;
            }

            searchResults = {};
            for (const result of results) {
                const { table, row } = result;
                if (!searchResults[table]) searchResults[table] = [];
                searchResults[table].push(row);
            }

            searchTables = Object.keys(searchResults);
            currentTableIndex = 0;

            document.getElementById('searchNav').classList.remove('hidden');

            showCurrentSearchTable();
        } catch (err) {
            console.error('Search error:', err);
            alert(`Failed to find: ${err.message}`);
        }
    }

    function showCurrentSearchTable() {
        if (!searchTables.length) return;

        const table = searchTables[currentTableIndex];
        const rows = searchResults[table];
        renderTable(rows, table);

        document.getElementById('searchTableIndicator').textContent =
            `${currentTableIndex + 1} / ${searchTables.length}: ${table}`;
    }

    // Fetch available tables
    async function loadTableList() {
        try {
            const res = await fetch(`${API_BASE}/tables`, {credentials: 'include'});
            if (!res.ok) throw new Error(res.statusText);
            const tables = await res.json();
            tableSelect.innerHTML = '';
            tables.forEach(tbl => {
                const opt = document.createElement('option');
                opt.value = tbl;
                opt.textContent = tbl.charAt(0).toUpperCase() + tbl.slice(1);
                tableSelect.append(opt);
            });
        } catch (err) {
            console.error('Cannot load table list:', err);
            alert('Помилка отримання списку таблиць');
        }
    }

    // Fetch columns of a table
    async function loadColumns(table) {
        try {
            const res = await fetch(
                `${API_BASE}/columns?tableName=${encodeURIComponent(table)}`,
                {credentials: 'include'}
            );
            if (!res.ok) throw new Error(res.statusText);
            const cols = await res.json();
            // Normalize to array of strings
            if (Array.isArray(cols) && cols.length > 0 && typeof cols[0] === 'object') {
                currentColumns = cols.map(c => c.column_name || c.name || JSON.stringify(c));
            } else {
                currentColumns = cols;
            }
        } catch (err) {
            console.error('Cannot load columns:', err);
            alert('Помилка отримання стовпців таблиці');
        }
    }

    // Load all records for a table
    async function loadTable(table) {
        try {
            const res = await fetch(
                `${API_BASE}/getAll?tableName=${encodeURIComponent(table)}`,
                {credentials: 'include'}
            );
            if (!res.ok) throw new Error(`Failed to load ${table}: ${res.status}`);
            let data = await res.json();
            if (typeof data === 'string') data = JSON.parse(data);
            renderTable(data, table);
        } catch (err) {
            console.error('Error loading records:', err);
            alert(`Error loading records: ${err.message}`);
        }
    }

    // Display record details
    async function viewRecord(table, id) {
        try {
            const res = await fetch(
                `${API_BASE}/get?tableName=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`,
                {credentials: 'include'}
            );
            if (!res.ok) throw new Error(`Failed to fetch record: ${res.status}`);
            let record = await res.json();
            if (typeof record === 'string') record = JSON.parse(record);
            viewModalContent.innerHTML = '';
            Object.entries(record).forEach(([key, val]) => {
                const p = document.createElement('p');
                p.innerHTML = `<strong>${key}:</strong> ${val}`;
                viewModalContent.appendChild(p);
            });
            viewModal.classList.remove('hidden');
        } catch (err) {
            console.error('Error fetching record:', err);
            alert(`Error fetching record details: ${err.message}`);
        }
    }

    // Build table HTML
    function renderTable(data, table) {
        tableHeaders.innerHTML = '';
        tableBody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            tableBody.innerHTML = `<tr><td class="px-4 py-2 text-center" colspan="100%">No ${table} records found</td></tr>`;
            return;
        }

        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            th.classList.add('px-4', 'py-2', 'text-left', 'font-medium');
            tableHeaders.appendChild(th);
        });
        const actionTh = document.createElement('th');
        actionTh.textContent = 'Actions';
        actionTh.classList.add('px-4', 'py-2', 'text-left', 'font-medium');
        tableHeaders.appendChild(actionTh);

        data.forEach(record => {
            const tr = document.createElement('tr');
            Object.values(record).forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                td.contentEditable = true;
                td.spellCheck = false;
                td.classList.add('px-4', 'py-2');
                tr.appendChild(td);
            });

            const actionTd = document.createElement('td');
            actionTd.classList.add('px-4', 'py-2', 'flex', 'space-x-2');

            const viewBtn = document.createElement('button');
            viewBtn.textContent = 'View';
            viewBtn.classList.add('btn-action', 'btn-view');
            viewBtn.addEventListener('click', () => viewRecord(table, record.id));

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('btn-action', 'btn-edit');
            editBtn.addEventListener('click', async() => {
                          await editRecord(table, record.id)
                      })

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('btn-action', 'btn-delete');
            deleteBtn.addEventListener('click', async () => {
                await deleteRecord(table, record.id)
            });

            document.getElementById('prevTableBtn').addEventListener('click', () => {
                if (currentTableIndex > 0) {
                    currentTableIndex--;
                    showCurrentSearchTable();
                }
            });

            document.getElementById('nextTableBtn').addEventListener('click', () => {
                if (currentTableIndex < searchTables.length - 1) {
                    currentTableIndex++;
                    showCurrentSearchTable();
                }
            });

            actionTd.append(viewBtn, editBtn, deleteBtn);
            tr.appendChild(actionTd);
            tableBody.appendChild(tr);
        });
    }

      async function editRecord(table, recordId) {
          // 1. read the headers (minus the "Actions" column)
          const headers = Array.from(tableHeaders.querySelectorAll('th'))
              .slice(0, -1)                // drop the last "Actions" column
              .map(th => th.textContent);

          // 2. find the row whose first column ("id") matches recordId
          const idIndex = headers.indexOf('id');
          const rows = Array.from(tableBody.querySelectorAll('tr'));
          const targetRow = rows.find(row =>
              row.cells[idIndex].textContent === String(recordId)
          );
          if (!targetRow) {
              return alert(`Could not find row for id=${recordId}`);
          }

          try {
              // 3. for each column except "id", send an edit request
              const updatePromises = headers
                  .map((col, idx) => ({ col, idx }))
                  .filter(({ col }) => col !== 'id')
                  .map(({ col, idx }) => {
                      const newValue = targetRow.cells[idx].textContent;
                      const params = new URLSearchParams({
                          tableName: table,
                          id: recordId,
                          editedColumn: col,
                          newValue,
                      });
                      return fetch(`${API_BASE}/edit?${params}`, {
                          method: 'POST',
                          credentials: 'include',
                      });
                  });

              // 4. wait for every field update
              const responses = await Promise.all(updatePromises);
              for (const res of responses) {
                  if (!res.ok) {
                      throw new Error(`Update failed: ${res.statusText}`);
                  }
              }

              // 5. reload the table so you see the persisted data
              await loadTable(table);
              alert('Successfully updated record');
          } catch (err) {
              console.error('Error editing record:', err);
              alert(`Error editing record: ${err.message}`);
          }
      }

    async function deleteRecord(table, recordId) {
        const res = await fetch(
            `${API_BASE}/delete?tableName=${encodeURIComponent(table)}&id=${recordId}`,
            {
                method: 'POST',
                credentials: 'include'
            }
        );

        if (!res.ok) {
            throw new Error(`Failed to delete record with id ${recordId} from table ${table}: ${res.status}`);
        }

        await loadTable(table);
        alert('Saccessfuly deleted');

    }

    function openAddModal() {
        addFormFields.innerHTML = '';
        currentColumns
            .filter(col => col !== 'id')
            .forEach(colName => {
                const fieldDiv = document.createElement('div');
                fieldDiv.classList.add('flex', 'flex-col', 'mb-4');

                const label = document.createElement('label');
                label.textContent = colName;
                label.setAttribute('for', colName);
                label.classList.add('font-medium', 'mb-1');

                const input = document.createElement('input');
                input.type = 'text';
                input.name = colName;
                input.id = colName;
                input.classList.add(
                    'p-2',
                    'border',
                    'rounded-md',
                    'focus:outline-none',
                    'focus:ring-2',
                    'focus:ring-blue-500'
                );

                fieldDiv.appendChild(label);
                fieldDiv.appendChild(input);
                addFormFields.appendChild(fieldDiv);
            });
        addModal.classList.remove('hidden');
    }

    async function registerNewUser(recordObj) {
        const {username, email, pass} = recordObj;
        const password = pass;
        console.log({username, email, password})
        const response = await fetch(`${AUTH_API_BASE}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({username, email, password}),
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert(data.message);
            window.location.href = '/panel';
        } else {
            alert(data.error);
        }

    }

    async function addNewRecord(recordObj) {
        const table = tableSelect.value;
        const query = new URLSearchParams({
            tableName: table
        });
        const res = await fetch(`${API_BASE}/add?${query.toString()}`, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(recordObj)
        });
        if (!res.ok) throw new Error(`Failed to add record: ${res.status}`);
        addModal.classList.add('hidden');
        addRecordForm.reset();
        await loadTable(table);
    }

    async function handleAddRecord(e) {
        e.preventDefault();

        const formData = new FormData(addRecordForm);
        const recordObj = {};
        formData.forEach((value, key) => {
            recordObj[key] = value;
        });
        try {
            if (tableSelect.value === 'users') {
                await registerNewUser(recordObj);
            } else {
                await addNewRecord(recordObj);
            }
        } catch (err) {
            console.error('Error :', err);
            alert(`Error: ${err.message}`);
        }
    }

});
