// signin.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('signin-btn').addEventListener('click', handleSignIn);

    // Allow Enter key to submit
    document.querySelectorAll('#signin-email, #signin-password').forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') handleSignIn(); });
    });
});

async function handleSignIn() {
    const email    = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    if (!email || !password) {
        showError('Please enter your email and password.');
        return;
    }

    try {
        const data = await apiFetch('/signin/', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.redirect) window.location.href = data.redirect;
    } catch (err) {
        showError(err.message);
    }
}

function showError(msg) {
    let el = document.querySelector('.signin__error');
    if (!el) {
        el = document.createElement('p');
        el.className = 'signin__error';
        el.style.cssText = 'color:#e53935;font-size:14px;text-align:center;margin:4px 0 0;';
        document.querySelector('.signin_form').appendChild(el);
    }
    el.textContent = msg;
}
