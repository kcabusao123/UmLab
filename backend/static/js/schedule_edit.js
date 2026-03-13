// schedule_edit.js
document.addEventListener('DOMContentLoaded', () => {
    const scheduleId = document.getElementById('schedule-id')?.value;
    if (scheduleId) loadScheduleData(scheduleId);

    document.getElementById('save-btn').addEventListener('click', () => handleSave(scheduleId));
});

async function loadScheduleData(id) {
    try {
        const data = await apiFetch(`/schedule/api/${id}/`);
        const s = data.schedule;

        document.getElementById('room').value           = s.room;
        document.getElementById('teacher').value        = s.teacher_name;
        document.getElementById('class-time-in').value  = s.class_time_in;
        document.getElementById('class-time-out').value = s.class_time_out;
        document.getElementById('class-schedule').value = s.class_schedule;
        document.getElementById('class-code').value     = s.class_code;
        document.getElementById('status').value         = s.status;

        // Handle course value — check if it's a known option, else show "others"
        const courseSelect = document.getElementById('course');
        const knownVals = Array.from(courseSelect.options).map(o => o.value);
        if (knownVals.includes(s.course)) {
            courseSelect.value = s.course;
        } else {
            courseSelect.value = 'others';
            const otherInput = document.getElementById('course-other-edit');
            if (otherInput) {
                otherInput.style.display = 'block';
                otherInput.value = s.course;
            }
        }
    } catch (err) {
        console.error('Failed to load schedule data:', err);
    }
}

async function handleSave(id) {
    const courseSelect = document.getElementById('course');
    const course = courseSelect.value === 'others'
        ? document.getElementById('course-other-edit').value.trim()
        : courseSelect.value;

    const payload = {
        room:           document.getElementById('room').value,
        teacher_name:   document.getElementById('teacher').value.trim(),
        class_time_in:  document.getElementById('class-time-in').value,
        class_time_out: document.getElementById('class-time-out').value,
        class_schedule: document.getElementById('class-schedule').value,
        class_code:     document.getElementById('class-code').value.trim(),
        course,
        status:         document.getElementById('status').value,
    };

    try {
        await apiFetch(`/schedule/api/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        window.location.href = '/schedule/';
    } catch (err) {
        alert('Error: ' + err.message);
    }
}
