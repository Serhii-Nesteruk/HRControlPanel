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
            return;
        }

        const response = await fetch('/api/profile', {
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
            updateProfileUI(data);
        } else {
            showError('Failed to fetch profile');
        }
    } catch(err) {
        showError(err.message);
    }
}

function updateProfileUI(data) {
    // Update basic info
    console.log(data.username);
    console.log(data.email);

    document.getElementById('username').textContent = data.username || 'N/A';
    document.getElementById('email').textContent = data.email || 'N/A';
    
    // Update additional info if available
    if (data.role) document.getElementById('role').textContent = data.role;
    if (data.department) document.getElementById('department').textContent = data.department;
    // if (data.phone) document.getElementById('phone').textContent = data.phone;
    // if (data.memberSince) document.getElementById('memberSince').textContent = data.memberSince;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        background: var(--danger);
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
    `;
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
}

window.addEventListener('load', fetchProfile);


const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);