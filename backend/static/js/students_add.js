// students_add.js
document.addEventListener('DOMContentLoaded', () => {
    // Auto-populate fields when a class code is selected
    document.getElementById('class-code').addEventListener('change', function () {
        const opt = this.options[this.selectedIndex];
        document.getElementById('teacher').value        = opt.dataset.teacher   || '';
        document.getElementById('class-time-in').value  = opt.dataset.timeIn    || '';
        document.getElementById('class-time-out').value = opt.dataset.timeOut   || '';
        document.getElementById('course').value         = opt.dataset.course    || '';

        const schedSel = document.getElementById('class-schedule');
        schedSel.value = opt.dataset.schedule || '';
    });

    // Show filename in upload label and validate PDF
    document.getElementById('sa__file-input').addEventListener('change', function () {
        const label = document.getElementById('sa__upload-label');
        const error = document.getElementById('sa__file-error');
        if (this.files[0]) {
            if (!this.files[0].name.toLowerCase().endsWith('.pdf')) {
                error.style.display = 'block';
                label.textContent = 'Attach the attendance here';
                this.value = '';
            } else {
                error.style.display = 'none';
                label.textContent = this.files[0].name;
            }
        }
    });

    document.getElementById('add-btn').addEventListener('click', handleAdd);
});

async function handleAdd() {
    const classCode   = document.getElementById('class-code').value.trim();
    const teacher     = document.getElementById('teacher').value.trim();
    const timeIn      = document.getElementById('class-time-in').value;
    const timeOut     = document.getElementById('class-time-out').value;
    const classSched  = document.getElementById('class-schedule').value;
    const course      = document.getElementById('course').value.trim();
    const fileInput   = document.getElementById('sa__file-input');

    if (!classCode || !teacher || !timeIn || !timeOut || !classSched || !course) {
        alert('Please select a Class Code to auto-fill the form.');
        return;
    }

    if (!fileInput.files[0]) {
        alert('Please attach a PDF attendance file.');
        return;
    }

    if (!fileInput.files[0].name.toLowerCase().endsWith('.pdf')) {
        alert('Only PDF files are allowed.');
        return;
    }

    const formData = new FormData();
    formData.append('teacher_name',    teacher);
    formData.append('class_time_in',   timeIn);
    formData.append('class_time_out',  timeOut);
    formData.append('class_schedule',  classSched);
    formData.append('class_code',      classCode);
    formData.append('course',          course);
    formData.append('attendance_file', fileInput.files[0]);

    try {
        await apiFetch('/students/api/', {
            method: 'POST',
            body: formData,
        });
        window.location.href = '/students/';
    } catch (err) {
        alert('Error: ' + err.message);
    }
}
