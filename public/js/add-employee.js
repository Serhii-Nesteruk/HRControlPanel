document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/panel';
    const AUTH_API_BASE = '/api/auth';
    let wizardStep = 0;
    const wizardData = {};

    // Modal elements
    const empModal       = document.getElementById('employeeWizardModal');
    const empBody        = document.getElementById('employeeWizardBody');
    const empTitle       = document.getElementById('employeeWizardTitle');
    const prevBtn        = document.getElementById('wizardPrevBtn');
    const nextBtn        = document.getElementById('wizardNextBtn');
    const closeWizardBtn = document.getElementById('closeEmployeeWizard');
    const tableSelect    = document.getElementById('tableSelect');

    // Sequence of tables for the wizard
    const tables = [
        'users',
        'employment',
        'employee',
        'schedules',
        'payment_details',
        'salaries'
    ];

    // Fetch dynamic columns for a given table
    async function fetchColumns(table) {
        const res = await fetch(
            `${API_BASE}/columns?tableName=${encodeURIComponent(table)}`,
            { credentials: 'include' }
        );
        if (!res.ok) throw new Error('Cannot fetch columns for ' + table);
        const cols = await res.json();
        return Array.isArray(cols) && typeof cols[0] === 'object'
            ? cols.map(c => c.column_name || c.name)
            : cols;
    }

    // Open the wizard when clicking nav
    document.getElementById('addEmployeeNav').addEventListener('click', async e => {
        e.preventDefault();
        wizardStep = 0;
        Object.keys(wizardData).forEach(k => delete wizardData[k]);
        await renderWizardStep();
        empModal.classList.remove('hidden');
    });

    // Close wizard
    closeWizardBtn.addEventListener('click', () => empModal.classList.add('hidden'));

    // Previous step
    prevBtn.addEventListener('click', async () => {
        wizardStep--;
        await renderWizardStep();
    });

    // Next or finish
    nextBtn.addEventListener('click', async () => {
        const inputs = empBody.querySelectorAll('input, select');
        const vals = {};
        inputs.forEach(i => vals[i.name] = i.value);

        try {
            if (wizardStep === 0) {
                // Create user
                const { username, email, pass } = vals;
                const res = await fetch(`${AUTH_API_BASE}/register`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                    body: JSON.stringify({ username, email, password: pass })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Registration failed');
                wizardData.user_id = data.userId;
            } else if (wizardStep === 1) {
                // Create employment
                const res = await fetch(
                    `${API_BASE}/add?tableName=employment`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        credentials: 'include',
                        body: JSON.stringify(vals),
                    }
                );
                if (!res.ok) throw new Error('Failed to create employment');
                const rec = await res.json();
                wizardData.employment_id = rec.id;
            } else if (wizardStep === 2) {
                // Create employee
                const payload = {
                    ...vals,
                    user_id: wizardData.user_id,
                    employment_id: wizardData.employment_id
                };
                const res = await fetch(
                    `${API_BASE}/add?tableName=employee`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        credentials: 'include',
                        body: JSON.stringify(payload),
                    }
                );
                if (!res.ok) throw new Error('Failed to create employee');
                const rec = await res.json();
                wizardData.employee_id = rec.id;
            } else if (wizardStep === 3) {
                // Create schedule
                const payload = {
                    ...vals,
                    employee_id: wizardData.employee_id
                };
                const res = await fetch(
                    `${API_BASE}/add?tableName=schedules`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        credentials: 'include',
                        body: JSON.stringify(payload),
                    }
                );
                if (!res.ok) throw new Error('Failed to create schedule');
                const rec = await res.json();
                wizardData.schedule_id = rec.id;
            } else if (wizardStep === 4) {
                // Create payment details
                const res = await fetch(
                    `${API_BASE}/add?tableName=payment_details`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        credentials: 'include',
                        body: JSON.stringify(vals),
                    }
                );
                if (!res.ok) throw new Error('Failed to create payment details');
                const rec = await res.json();
                wizardData.payment_details_id = rec.id;
            } else if (wizardStep === 5) {
                // Create salary
                const payload = {
                    ...vals,
                    employee_id: wizardData.employee_id,
                    payment_details_id: wizardData.payment_details_id
                };
                const res = await fetch(
                    `${API_BASE}/add?tableName=salaries`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        credentials: 'include',
                        body: JSON.stringify(payload),
                    }
                );
                if (!res.ok) throw new Error('Failed to create salary');
            }
        } catch (err) {
            return alert(err.message);
        }

        wizardStep++;
        if (wizardStep >= tables.length) {
            empModal.classList.add('hidden');
            alert('Employee успішно додано!');
            if (tableSelect.value === 'employee') loadTable('employee');
        } else {
            await renderWizardStep();
        }
    });

    // Render form fields for current step
    async function renderWizardStep() {
        const table = tables[wizardStep];
        empTitle.textContent = `Add Employee: Step ${wizardStep + 1}`;
        empBody.innerHTML = '';

        let cols = await fetchColumns(table);
        const excludeMap = {
            users: ['id'],
            employment: ['id'],
            employee: ['id','user_id','employment_id'],
            schedules: ['id','employee_id'],
            payment_details: ['id'],
            salaries: ['id','employee_id','payment_details_id']
        };
        cols = cols.filter(c => !excludeMap[table].includes(c));

        cols.forEach(col => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('flex','flex-col','mb-4');
            const lbl = document.createElement('label');
            lbl.textContent = col;
            lbl.setAttribute('for', col);
            lbl.classList.add('font-medium','mb-1');
            const inp = document.createElement('input');
            let type = 'text';
            if (['start_date','finish_date','date','payout_date'].includes(col)) {
                type = 'date';
            } else if (['start_time','finish_time'].includes(col)) {
                type = 'text';
                inp.placeholder = 'HH:MM';
            } else if (['pass','password'].includes(col)) {
                type = 'password';
            }
            inp.type = type;
            inp.name = col;
            inp.id = col;
            inp.classList.add('p-2','border','rounded-md','focus:outline-none','focus:ring-2','focus:ring-blue-500');
            wrapper.append(lbl, inp);
            empBody.appendChild(wrapper);
        });

        prevBtn.classList.toggle('hidden', wizardStep === 0);
        nextBtn.textContent = wizardStep === tables.length - 1 ? 'Finish' : 'Next';
    }
});
