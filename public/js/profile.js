async function getToken() {
    const token = localStorage.getItem('token');
    if (!token) 
        return null;
    return token;
}

async function fetchProfile() {
    try {
        const token = await getToken();
        if (!token) {
            alert('You have to sign in or sign up!');
            window.location.href = '/';
            return
        }

        const response = await fetch('/api/profile', {
            method: 'GET',
            header: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('username').textContent = `Username: ${data.username}`;
            document.getElementById('email').textContent = `Email: ${data.email}`;
        } else {
            alert('Some error happend. Failed to fetch profile');
            window.location.href = '/';
        }
    } catch(err) {
        alert('Error: ' + err.message);
        window.location.href = '/';
    }
}

window.onload = fetchProfile();