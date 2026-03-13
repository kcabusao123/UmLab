// dashboard.js
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();

    document.getElementById('session-filter').addEventListener('change', function () {
        loadDashboard(this.value || null);
    });
});

async function loadDashboard(session = null) {
    const url = session ? `/dashboard/api/?session=${session}` : '/dashboard/api/';
    try {
        const data = await apiFetch(url);
        const schedules = data.schedules;

        if (session) {
            ['morning', 'afternoon', 'evening'].forEach(s => {
                const sec = document.getElementById(`section-${s}`);
                if (sec) sec.style.display = s === session ? '' : 'none';
            });
            renderSession(session, Array.isArray(schedules) ? schedules : (schedules[session] || []));
        } else {
            ['morning', 'afternoon', 'evening'].forEach(s => {
                const sec = document.getElementById(`section-${s}`);
                if (sec) sec.style.display = '';
                renderSession(s, schedules[s] || []);
            });
        }
    } catch (err) {
        console.error('Dashboard load failed:', err);
        if (err.message && err.message.toLowerCase().includes('session expired')) {
            window.location.href = '/signin/?next=/dashboard/';
        } else {
            ['morning', 'afternoon', 'evening'].forEach(s => {
                const list = document.getElementById(`list-${s}`);
                if (list) list.innerHTML = '<p style="color:#e53935;padding:12px 0;">Failed to load schedules. Please refresh the page.</p>';
            });
        }
    }
}

function renderSession(session, items) {
    const list = document.getElementById(`list-${session}`);
    if (!list) return;
    list.innerHTML = '';
    if (items.length === 0) {
        list.innerHTML = '<p style="color:#aaa;padding:12px 0;">No schedules for this session.</p>';
        return;
    }
    items.forEach(item => list.appendChild(createDashCard(item)));
}

/**
 * Determine whether attendance buttons should be visible.
 * Buttons show when:  status is 'pending'  OR  marked_at is older than 12 hours.
 */
function buttonsVisible(item) {
    if (item.attendance_status === 'pending') return true;
    if (!item.marked_at) return true;
    const elapsed = Date.now() - new Date(item.marked_at).getTime();
    return elapsed >= TWELVE_HOURS_MS;
}

function createDashCard(item) {
    const showBtns = buttonsVisible(item);
    const card = document.createElement('div');
    card.className = 'schedule__card';
    card.innerHTML = `
        <div class="card__header">
            <span class="card__professor">${escapeHtml(item.teacher_name)}</span>
            <span class="card__schedule">${escapeHtml(item.class_code)}</span>
            <span class="card__time">${escapeHtml(item.class_time_display)}</span>
        </div>
        <div class="card__body">
            <span class="card__hours-label">Total hours:</span>
            <span class="card__hours-value" id="hours-${item.attendance_id}">${escapeHtml(String(item.total_hours))} HOURS</span>
        </div>
        <div class="card__footer">
            <span class="card__status">Status:
                <span class="status__value" id="status-${item.attendance_id}">
                    ${capitalize(item.attendance_status)}
                </span>
            </span>
            <div class="card__actions" id="actions-${item.attendance_id}"${showBtns ? '' : ' style="display:none"'}>
                <button class="btn__present"
                    onclick="markAttendance(${item.attendance_id}, 'present', this)">Present</button>
                <button class="btn__absent"
                    onclick="markAttendance(${item.attendance_id}, 'absent', this)">Absent</button>
            </div>
        </div>
    `;

    // If already marked and within 12h window, schedule a timer to show buttons
    if (!showBtns && item.marked_at) {
        const elapsed = Date.now() - new Date(item.marked_at).getTime();
        const remaining = TWELVE_HOURS_MS - elapsed;
        if (remaining > 0) {
            setTimeout(() => {
                const actionsEl = document.getElementById(`actions-${item.attendance_id}`);
                if (actionsEl) actionsEl.style.display = '';
            }, remaining);
        }
    }

    return card;
}

async function markAttendance(attendanceId, status, btn) {
    try {
        const data = await apiFetch(`/dashboard/api/attendance/${attendanceId}/`, {
            method: 'POST',
            body: JSON.stringify({ status }),
        });

        // Update status label
        const statusEl = document.getElementById(`status-${attendanceId}`);
        if (statusEl) statusEl.textContent = capitalize(data.status);

        // Update hours display
        const hoursEl = document.getElementById(`hours-${attendanceId}`);
        if (hoursEl && data.total_hours !== undefined) {
            hoursEl.textContent = data.total_hours + ' HOURS';
        }

        // Hide buttons and schedule them to reappear after 12h
        const actionsEl = document.getElementById(`actions-${attendanceId}`);
        if (actionsEl) {
            actionsEl.style.display = 'none';
            setTimeout(() => {
                actionsEl.style.display = '';
            }, TWELVE_HOURS_MS);
        }
    } catch (err) {
        alert('Error updating attendance: ' + err.message);
    }
}
