// schedule_add.js

// Cache of existing schedules fetched on page load: { classCode → teacherName }
const existingClassCodes = {};

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('submit-btn').addEventListener('click', handleAdd);

    // Pre-load existing class codes so we can validate on the client side
    try {
        const data = await apiFetch('/schedule/api/');
        const all = [
            ...(data.schedules.morning  || []),
            ...(data.schedules.afternoon || []),
            ...(data.schedules.evening  || []),
        ];
        all.forEach(s => {
            existingClassCodes[s.class_code.toLowerCase()] = s.teacher_name;
        });
    } catch (_) {
        // If the fetch fails we still let the backend validate
    }
});

async function handleAdd() {
    const courseSelect = document.getElementById('course');
    const course = courseSelect.value === 'others'
        ? document.getElementById('course-other-add').value.trim()
        : courseSelect.value;

    const payload = {
        room:           document.getElementById('room').value,
        teacher_name:   document.getElementById('teacher').value.trim(),
        class_time_in:  document.getElementById('class-time-in').value,
        class_time_out: document.getElementById('class-time-out').value,
        class_schedule: document.getElementById('class-schedule').value,
        class_code:     document.getElementById('class-code').value.trim(),
        course,
    };

    for (const [key, val] of Object.entries(payload)) {
        if (!val) {
            alert(`Please fill in the "${key.replace(/_/g, ' ')}" field.`);
            return;
        }
    }

    // Validate: a class code must always belong to the same teacher
    const existingTeacher = existingClassCodes[payload.class_code.toLowerCase()];
    if (existingTeacher && existingTeacher.toLowerCase() !== payload.teacher_name.toLowerCase()) {
        alert(
            `Class code "${payload.class_code}" is already assigned to ${existingTeacher}.\n` +
            `A class code cannot be shared between different teachers.`
        );
        return;
    }

    try {
        await apiFetch('/schedule/api/', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        window.location.href = '/schedule/';
    } catch (err) {
        alert('Error: ' + err.message);
    }
}
