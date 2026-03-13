/**
 * utils.js — shared helpers loaded on every page via base_app.html
 */

/** Read the Django csrftoken cookie value. */
function getCsrfToken() {
    const name = 'csrftoken';
    for (const cookie of document.cookie.split(';')) {
        const c = cookie.trim();
        if (c.startsWith(name + '=')) {
            return decodeURIComponent(c.slice(name.length + 1));
        }
    }
    return '';
}

/**
 * Thin fetch wrapper that always sends JSON + CSRF token.
 * For file uploads, omit Content-Type so the browser sets multipart boundary.
 */
async function apiFetch(url, options = {}) {
    const isFormData = options.body instanceof FormData;
    const headers = {
        'X-CSRFToken': getCsrfToken(),
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
    };
    const res = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers,
    });

    const contentType = res.headers.get('Content-Type') || '';

    if (!res.ok) {
        // HTML error page (e.g. 403 CSRF / 404) — extract a plain message
        if (contentType.includes('text/html')) {
            if (res.status === 403) throw new Error('Forbidden – CSRF token missing. Please reload the page and try again.');
            throw new Error(`Request failed (${res.status}).`);
        }
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Request failed (${res.status})`);
    }

    // Successful but redirected to login page (HTML instead of JSON)
    if (contentType.includes('text/html')) {
        throw new Error('Session expired. Please sign in again.');
    }

    return res.json();
}

/** Escape HTML to prevent XSS when injecting user-supplied strings into innerHTML. */
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Capitalise the first letter of a string. */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Show/hide the "other" text input when a select changes to "others". */
function toggleOtherInput(select, inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isOther = select.value === 'others';
    input.style.display = isOther ? 'block' : 'none';
    input.required = isOther;
    if (!isOther) input.value = '';
}
