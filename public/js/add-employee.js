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

    const stepLabels = [
        'Dane konta',               // users
        'Dane zatrudnienia',        // employment
        'Profil pracownika',        // employee
        'Grafik pracy',             // schedules
        'Dane płatnicze',           // payment_details
        'Ustawienia wynagrodzenia'  // salaries
    ];

    // Sequence of tables for the wizard
    const tables = [
        'users',
        'employment',
        'employee',
        'schedules',
        'payment_details',
        'salaries'
    ];

    // Days of the week for schedule creation (try different formats)
    const daysOfWeek = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
    ];

    // Alternative formats in case the above doesn't work
  //  const daysOfWeekNumbers = [1, 2, 3, 4, 5, 6, 7]; // 1=Monday, 7=Sunday
//    const daysOfWeekShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

                // Debug: Log the payload to see what's being sent
                console.log('Employee creation payload:', payload);
                console.log('wizardData:', wizardData);
                console.log('vals:', vals);

                const res = await fetch(
                    `${API_BASE}/add?tableName=employee`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        credentials: 'include',
                        body: JSON.stringify(payload),
                    }
                );

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error('Failed to create employee:', errorText);
                    throw new Error('Failed to create employee: ' + errorText);
                }

                const rec = await res.json();
                console.log('Employee creation rec: ' + rec);
            } else if (wizardStep === 3) {
                // Create schedules - 7 records for each day of the week
                const schedulePromises = daysOfWeek.map(async (day, index) => {
                    const payload = {
                        ...vals,
                        employee_id: wizardData.employee_id,
                        day_of_week: day
                    };

                    // Debug: log the payload
                    console.log(`Creating schedule for ${day}:`, payload);

                    const res = await fetch(
                        `${API_BASE}/add?tableName=schedules`, {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            credentials: 'include',
                            body: JSON.stringify(payload),
                        }
                    );

                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error(`Failed to create schedule for ${day}:`, errorText);
                        throw new Error(`Failed to create schedule for ${day}: ${errorText}`);
                    }

                    return await res.json();
                });

                // Wait for all 7 schedules to be created
                const scheduleRecords = await Promise.all(schedulePromises);

                // Store the first schedule ID (you might want to store all IDs if needed)
                wizardData.schedule_id = scheduleRecords[0].id;
                wizardData.schedule_ids = scheduleRecords.map(rec => rec.id);
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
        empTitle.textContent = `Add Employee: Step ${wizardStep + 1} — ${stepLabels[wizardStep]}`;
        empBody.innerHTML = '';

        let cols = await fetchColumns(table);
        const excludeMap = {
            users: ['id'],
            employment: ['id'],
            employee: ['id','user_id','employment_id'],
            schedules: ['id','employee_id','day_of_week'], // Exclude day_of_week since we'll add it automatically
            payment_details: ['id'],
            salaries: ['id','employee_id','payment_details_id']
        };
        cols = cols.filter(c => !excludeMap[table].includes(c));

        // Special message for schedules step
        if (table === 'schedules') {
            const infoDiv = document.createElement('div');
            infoDiv.classList.add('bg-blue-50', 'border', 'border-blue-200', 'rounded-md', 'p-3', 'mb-4');
            infoDiv.innerHTML = `
                <div class="flex">
                    <i class="fas fa-info-circle text-blue-500 mr-2 mt-1"></i>
                    <div class="text-sm text-blue-700">
                        <strong>Note:</strong> This schedule will be applied to all 7 days of the week automatically.
                    </div>
                </div>
            `;
            empBody.appendChild(infoDiv);
        }

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