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

    // Event listeners
    tableSelect.addEventListener('change', () => loadTable(tableSelect.value));
    addRecordBtn.addEventListener('click', openAddModal);
    closeViewModal.addEventListener('click', () => viewModal.classList.add('hidden'));
    closeAddModal.addEventListener('click', () => addModal.classList.add('hidden'));
    addRecordForm.addEventListener('submit', handleAddRecord);

    // Initial load
    loadTable(tableSelect.value);

    // Load all records for selected table
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
        } catch (error) {
            console.error('Error loading records:', error);
            alert(`Error loading records: ${error.message}`);
        }
    }

    // View a single record's details
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
        } catch (error) {
            console.error('Error fetching record:', error);
            alert(`Error fetching record details: ${error.message}`);
        }
    }

    // Render table headers and rows with action buttons
    function renderTable(data, table) {
        tableHeaders.innerHTML = '';
        tableBody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            tableBody.innerHTML = `<tr><td class="px-4 py-2 text-center" colspan="100%">No ${table} records found</td></tr>`;
            return;
        }

        // Create headers
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

        // Populate rows
        data.forEach(record => {
            const tr = document.createElement('tr');
            Object.values(record).forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                td.classList.add('px-4', 'py-2');
                tr.appendChild(td);
            });

            // Actions: View, Edit, Delete
            const actionTd = document.createElement('td');
            actionTd.classList.add('px-4', 'py-2', 'flex', 'space-x-2');

            const viewBtn = document.createElement('button');
            viewBtn.textContent = 'View';
            viewBtn.classList.add('btn-action', 'btn-view');
            viewBtn.addEventListener('click', () => viewRecord(table, record.id));

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('btn-action', 'btn-edit');
            // TODO: implement edit functionality

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('btn-action', 'btn-delete');
            // TODO: implement delete functionality

            actionTd.append(viewBtn, editBtn, deleteBtn);
            tr.appendChild(actionTd);
            tableBody.appendChild(tr);
        });
    }

    // Open modal for adding new record
    function openAddModal() {
        addFormFields.innerHTML = '';
        const headers = Array.from(tableHeaders.querySelectorAll('th'))
            .map(th => th.textContent)
            .filter(h => h !== 'Actions');
        headers.forEach(header => {
            const fieldDiv = document.createElement('div');
            fieldDiv.classList.add('flex', 'flex-col');

            const label = document.createElement('label');
            label.textContent = header;
            label.setAttribute('for', header);
            label.classList.add('font-medium');

            const input = document.createElement('input');
            input.type = 'text';
            input.name = header;
            input.id = header;
            input.classList.add('p-2', 'border', 'rounded-md', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');

            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            addFormFields.appendChild(fieldDiv);
        });
        addModal.classList.remove('hidden');
    }

    // Handle form submission to add a new record
    async function handleAddRecord(e) {
        e.preventDefault();
        const table = tableSelect.value;
        const formData = new FormData(addRecordForm);
        const recordObj = {};
        formData.forEach((value, key) => (recordObj[key] = value));

        try {
            const query = new URLSearchParams({
                tableName: table,
                record: JSON.stringify(recordObj)
            });
            const res = await fetch(`${API_BASE}/add?${query.toString()}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!res.ok) throw new Error(`Failed to add record: ${res.status}`);
            addModal.classList.add('hidden');
            addRecordForm.reset();
            loadTable(table);
        } catch (error) {
            console.error('Error adding record:', error);
            alert(`Error adding record: ${error.message}`);
        }
    }
});
