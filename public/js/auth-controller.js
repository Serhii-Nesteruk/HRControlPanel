
// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert(data.message);
            window.location.href = '/panel';
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert(data.message);
            window.location.href = '/panel';
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});