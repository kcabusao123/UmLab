// reservation.js
document.addEventListener('DOMContentLoaded', () => {
    loadReservations('unapproved');

    document.querySelectorAll('.rsv__sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.rsv__sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadReservations(btn.dataset.filter);
        });
    });
});

async function loadReservations(status) {
    try {
        const data = await apiFetch(`/reservation/api/?status=${status}`);
        renderReservations(data.reservations);
    } catch (err) {
        console.error('Failed to load reservations:', err);
    }
}

function renderReservations(reservations) {
    const list = document.getElementById('reservation-list');
    list.innerHTML = '';
    if (!reservations.length) {
        list.innerHTML = '<p style="color:#aaa;padding:12px;">No reservations found.</p>';
        return;
    }
    reservations.forEach(r => list.appendChild(createReservationCard(r)));
}

function createReservationCard(r) {
    const card = document.createElement('div');
    card.className = 'rsv__card';
    card.dataset.id = r.id;

    const equipRows = (r.equipment || [])
        .map(eq => `<tr><td>${escapeHtml(eq.name)}</td><td>${escapeHtml(String(eq.quantity))}</td></tr>`)
        .join('') || '<tr><td colspan="2" style="color:#aaa;">—</td></tr>';

    card.innerHTML = `
        <div class="rsv__card-tag">Equipment Reservation</div>
        <div class="rsv__card-body">
            <div class="rsv__row rsv__row--2col">
                <div class="rsv__field">
                    <span class="rsv__label">Name of the Borrower:</span>
                    <span class="rsv__value">${escapeHtml(r.borrower_name)}</span>
                </div>
                <div class="rsv__field">
                    <span class="rsv__label">Class Code:</span>
                    <span class="rsv__value">${escapeHtml(r.class_code)}</span>
                </div>
            </div>
            <div class="rsv__card-grid">
                <div class="rsv__field">
                    <span class="rsv__label">Name of the Teacher:</span>
                    <span class="rsv__value">${escapeHtml(r.teacher_name)}</span>
                </div>
                <div class="rsv__graybox rsv__graybox--span">
                    <div class="rsv__graybox-header">Equipment</div>
                    <table class="rsv__equip-table">
                        <thead><tr><th>Name</th><th>Quantity</th></tr></thead>
                        <tbody>${equipRows}</tbody>
                    </table>
                </div>
                <div class="rsv__fields-left">
                    <div class="rsv__field"><span class="rsv__label">Date of Filing:</span><span class="rsv__value">${escapeHtml(r.date_filed)}</span></div>
                    <div class="rsv__field"><span class="rsv__label">Date of use:</span><span class="rsv__value">${escapeHtml(r.date_of_use)}</span></div>
                    <div class="rsv__field"><span class="rsv__label">Room Num:</span><span class="rsv__value">${escapeHtml(r.room_num)}</span></div>
                    <div class="rsv__field"><span class="rsv__label">Date of return:</span><span class="rsv__value">${escapeHtml(r.date_of_return)}</span></div>
                    <div class="rsv__field"><span class="rsv__label">Course:</span><span class="rsv__value">${escapeHtml(r.course)}</span></div>
                    <div class="rsv__field"><span class="rsv__label">College:</span><span class="rsv__value">${escapeHtml(r.college)}</span></div>
                </div>
            </div>
        </div>
        <div class="rsv__card-footer">
            <div class="rsv__footer-left">
                <span class="rsv__status-label">Status:
                    <span class="rsv__status-value" id="rsv-status-${r.id}">${capitalize(r.status)}</span>
                </span>
                    <span class="rsv__class-hours">Class Time: ${escapeHtml(r.class_time || r.class_hours || '')}</span>
            </div>
            <div class="rsv__footer-actions">
                <button class="rsv__btn-approve"
                    onclick="approveReservation(${r.id}, this)">Approved</button>
                <button class="rsv__btn-delete"
                    onclick="deleteReservation(${r.id}, this)">Delete</button>
                <button class="rsv__btn-seemore">See More</button>
            </div>
        </div>
    `;
    return card;
}

async function approveReservation(id, btn) {
    try {
        const data = await apiFetch(`/reservation/api/${id}/approve/`, {
            method: 'POST',
            body: JSON.stringify({ status: 'approved' }),
        });
        const statusEl = document.getElementById(`rsv-status-${id}`);
        if (statusEl) statusEl.textContent = capitalize(data.status);
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

async function deleteReservation(id, btn) {
    if (!confirm('Delete this reservation? This cannot be undone.')) return;
    try {
        await apiFetch(`/reservation/api/${id}/`, { method: 'DELETE' });
        const card = btn.closest('.rsv__card');
        if (card) card.remove();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}
