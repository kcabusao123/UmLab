// schedule.js
document.addEventListener('DOMContentLoaded', () => {
    loadSchedules();

    document.getElementById('session-filter').addEventListener('change', function () {
        loadSchedules(this.value || null);
    });
});

async function loadSchedules(session = null) {
    const url = session ? `/schedule/api/?session=${session}` : '/schedule/api/';
    try {
        const data = await apiFetch(url);
        const schedules = data.schedules;

        if (session) {
            // Show only the matching section, hide the others
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
        console.error('Failed to load schedules:', err);
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
    items.forEach(item => list.appendChild(createScheduleCard(item)));
}

async function deleteSchedule(id, btn) {
    if (!confirm('Delete this schedule? This cannot be undone.')) return;
    try {
        await apiFetch(`/schedule/api/${id}/`, { method: 'DELETE' });
        const card = btn.closest('.sch__card');
        if (card) card.remove();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function createScheduleCard(item) {
    const card = document.createElement('div');
    card.className = 'sch__card';
    card.dataset.id = item.id;
    card.innerHTML = `
        <div class="sch__card-tag">Lab Schedule</div>
        <div class="sch__card-body">
            <div class="sch__row">
                <div class="sch__field">
                    <span class="sch__label">Name of the Teacher:</span>
                    <span class="sch__value">${escapeHtml(item.teacher_name)}</span>
                </div>
                <div class="sch__field">
                    <span class="sch__label">Class Time:</span>
                    <span class="sch__value">${escapeHtml(item.class_time_display)}</span>
                </div>
                <div class="sch__field">
                    <span class="sch__label">Schedule:</span>
                    <span class="sch__value">${escapeHtml(item.class_schedule_display)}</span>
                </div>
            </div>
            <div class="sch__row">
                <div class="sch__field">
                    <span class="sch__label">Class Code:</span>
                    <span class="sch__value">${escapeHtml(item.class_code)}</span>
                </div>
                <div class="sch__field">
                    <span class="sch__label">Classroom #:</span>
                    <span class="sch__value">${escapeHtml(item.room_display || item.room)}</span>
                </div>
                <div class="sch__field">
                    <span class="sch__label">Course:</span>
                    <span class="sch__value">${escapeHtml(item.course)}</span>
                </div>
            </div>
        </div>
        <div class="sch__card-footer">
            <span class="sch__status-label">Status:
                <span class="sch__status-value sch__status--${escapeHtml(item.status)}">
                    ${escapeHtml(item.status_display)}
                </span>
            </span>
            <div class="sch__footer-actions">
                <button class="sch__btn-edit"
                    onclick="window.location.href='/schedule/edit/${item.id}/'">Edit</button>
                <button class="sch__btn-seemore"
                    onclick="window.location.href='/schedule/edit/${item.id}/'">See More</button>
                <button class="sch__btn-delete"
                    onclick="deleteSchedule(${item.id}, this)">Delete</button>
            </div>
        </div>
    `;
    return card;
}
