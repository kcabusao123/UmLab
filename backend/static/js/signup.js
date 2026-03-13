// signup.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('signup-btn').addEventListener('click', handleSignUp);

    document.querySelectorAll('#signup-email, #signup-password').forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') handleSignUp(); });
    });
});

async function handleSignUp() {
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!email || !password) {
        showError('Please enter your email and password.');
        return;
    }

    try {
        const data = await apiFetch('/signin/signup/', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.redirect) window.location.href = data.redirect;
    } catch (err) {
        showError(err.message);
    }
}

function showError(msg) {
    let el = document.querySelector('.signup__error');
    if (!el) {
        el = document.createElement('p');
        el.className = 'signup__error';
        el.style.cssText = 'color:#e53935;font-size:14px;text-align:center;margin:4px 0 0;';
        document.querySelector('.signin_form').appendChild(el);
    }
    el.textContent = msg;
}
