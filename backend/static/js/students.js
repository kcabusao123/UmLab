// students.js
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();

    document.getElementById('session-filter').addEventListener('change', function () {
        loadStudents(this.value || null);
    });
});

async function loadStudents(session = null) {
    const url = session ? `/students/api/?session=${session}` : '/students/api/';
    try {
        const data = await apiFetch(url);
        renderStudents(data.students);
    } catch (err) {
        console.error('Failed to load students:', err);
    }
}

function renderStudents(students) {
    const list = document.getElementById('student-list');
    list.innerHTML = '';
    if (!students.length) {
        list.innerHTML = '<p style="color:#aaa;padding:12px;">No student groups found.</p>';
        return;
    }
    students.forEach(s => list.appendChild(createStudentSection(s)));
}

function createStudentSection(s) {
    const schedDisplay = s.class_schedule === 'mon-wed' ? 'MTW' : 'THFS';
    const sessionLabel = capitalize(s.session);

    const section = document.createElement('div');
    section.className = 'stu__section';
    section.dataset.id = s.id;
    section.innerHTML = `
        <div class="stu__section-header">
            <span class="stu__section-label">
                ${sessionLabel}<span class="stu__section-code">(${escapeHtml(s.class_code)})</span>
                - ${schedDisplay}
            </span>
        </div>
        <div class="stu__card">
            <span class="stu__card-label">
                ${s.attendance_file ? escapeHtml(s.attendance_file) : 'PDF FILE ATTENDANCE DIRI'}
            </span>
            <div class="stu__card-actions">
                <button class="stu__print-btn" onclick="printAttendance(${JSON.stringify(s.attendance_file)})">
                    <i class="fa-solid fa-print"></i>
                </button>
                <button class="stu__delete-btn" onclick="deleteStudent(${s.id}, this)"
                    title="Delete this student group">
                    <img src="/static/assets/delete.png" alt="Delete">
                </button>
            </div>
        </div>
    `;
    return section;
}

function printAttendance(fileUrl) {
    if (!fileUrl) {
        alert('No attendance file uploaded for this student group.');
        return;
    }
    window.open(fileUrl, '_blank');
}

async function deleteStudent(id, btn) {
    if (!confirm('Delete this student group? This cannot be undone.')) return;
    try {
        await apiFetch(`/students/api/${id}/`, { method: 'DELETE' });
        const section = btn.closest('.stu__section');
        if (section) section.remove();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}
