document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/panel';
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

    // Fetch available tables
    async function loadTableList() {
        try {
            const res = await fetch(`${API_BASE}/tables`, { credentials: 'include' });
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
                { credentials: 'include' }
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
                { credentials: 'include' }
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
                { credentials: 'include' }
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
            // TODO: implement edit

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('btn-action', 'btn-delete');
            // TODO: implement delete

            actionTd.append(viewBtn, editBtn, deleteBtn);
            tr.appendChild(actionTd);
            tableBody.appendChild(tr);
        });
    }

    // Show "Add New Record" modal with dynamic fields
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

    // Handle adding a new record
    async function handleAddRecord(e) {
        e.preventDefault();
        const table = tableSelect.value;
        const formData = new FormData(addRecordForm);
        const recordObj = {};
        formData.forEach((value, key) => (recordObj[key] = value));

        try {
            const query = new URLSearchParams({
                tableName: table
            });
            const res = await fetch(`${API_BASE}/add?${query.toString()}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recordObj)
            });
            if (!res.ok) throw new Error(`Failed to add record: ${res.status}`);
            addModal.classList.add('hidden');
            addRecordForm.reset();
            await loadTable(table);
        } catch (err) {
            console.error('Error adding record:', err);
            alert(`Error adding record: ${err.message}`);
        }
    }
});
