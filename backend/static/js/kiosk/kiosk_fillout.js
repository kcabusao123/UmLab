// kiosk_fillout.js — Fill Out Details page

// Module-level reference so handleSubmit can read the selected option's data
const classCodeSelect = document.getElementById('class-code');

document.addEventListener('DOMContentLoaded', function () {
    const cart = JSON.parse(sessionStorage.getItem('kiosk_cart') || '[]');

    // Show equipment summary
    const summary = cart.map(i => `${i.name} ×${i.quantity}`).join(', ');
    document.getElementById('equipment-summary').value = summary || '(none)';

    // Set today as default filing date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('filing-date').value = today;

    // Set minimum date for date-of-use to 3 days from today
    const minUse = new Date();
    minUse.setDate(minUse.getDate() + 3);
    const minUseStr = minUse.toISOString().split('T')[0];
    const dateUseInput = document.getElementById('date-use');
    const dateReturnInput = document.getElementById('date-return');
    dateUseInput.min = minUseStr;

    // Auto-fill teacher, room, and class time when class code is selected
    const teacherInput    = document.getElementById('teacher');
    const roomInput       = document.getElementById('room-num');
    const classTimeInput  = document.getElementById('class-time');
    if (classCodeSelect) {
        function syncFromClassCode() {
            const selected = classCodeSelect.options[classCodeSelect.selectedIndex];
            if (teacherInput)   teacherInput.value   = selected ? (selected.dataset.teacher || '') : '';
            if (roomInput)      roomInput.value      = selected ? (selected.dataset.room    || '') : '';
            if (classTimeInput) classTimeInput.value = selected ? (selected.dataset.time    || '') : '';
        }
        classCodeSelect.addEventListener('change', syncFromClassCode);
        // Sync immediately in case the browser restored the select value (bfcache)
        if (classCodeSelect.value) syncFromClassCode();
    }

    // Auto-fill date of return to match date of use (same day)
    dateUseInput.addEventListener('change', function () {
        dateReturnInput.value = this.value;
        dateReturnInput.min = this.value;
        dateReturnInput.max = this.value;
    });

    // Filter course options by selected college
    const collegeSelect = document.getElementById('college');
    const courseSelect  = document.getElementById('course');
    const allCourseOptions = Array.from(courseSelect.options).slice(1); // skip placeholder

    function filterCourses() {
        const chosen = collegeSelect.value;
        // Reset course selection
        courseSelect.value = '';
        courseSelect.options[0].textContent = chosen ? 'Select a course' : 'Select a college first';
        allCourseOptions.forEach(opt => {
            const show = opt.dataset.college === chosen;
            opt.hidden = !show;
            opt.disabled = !show;
        });
    }

    collegeSelect.addEventListener('change', filterCourses);
    // Run once on load in case browser restores a value
    if (collegeSelect.value) filterCourses();

    document.getElementById('proceed-btn').addEventListener('click', handleSubmit);
});

function getCsrfToken() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
        c = c.trim();
        if (c.startsWith(name + '=')) return decodeURIComponent(c.slice(name.length + 1));
    }
    return '';
}

function handleSubmit() {
    const cart = JSON.parse(sessionStorage.getItem('kiosk_cart') || '[]');
    if (!cart.length) {
        alert('No equipment selected. Please go back and pick equipment.');
        return;
    }

    const borrower    = document.getElementById('borrower').value.trim();
    const filingDate  = document.getElementById('filing-date').value;
    const teacher     = document.getElementById('teacher').value;
    const dateUse     = document.getElementById('date-use').value;
    const dateReturn  = document.getElementById('date-return').value;
    const classCode   = document.getElementById('class-code').value;
    const college     = document.getElementById('college').value;
    const course      = document.getElementById('course').value;
    const roomNum     = document.getElementById('room-num').value.trim();
    const selected    = classCodeSelect
        ? classCodeSelect.options[classCodeSelect.selectedIndex]
        : null;
    const classHours  = selected ? (selected.dataset.hours || '') : '';
    const classTime   = selected ? (selected.dataset.time  || '') : '';

    if (!borrower || !filingDate || !teacher || !dateUse || !dateReturn || !classCode || !college || !course || !roomNum) {
        alert('Please fill out all fields.');
        return;
    }

    // Validate: date of use must be at least 3 days from today (compare in local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = dateUse.split('-').map(Number);
    const useDate = new Date(y, m - 1, d);  // local midnight, no UTC shift
    const diffDays = (useDate - today) / (1000 * 60 * 60 * 24);
    if (diffDays < 3) {
        alert('Reservation must be made at least 3 days before the date of use.');
        return;
    }

    // Enforce date of return = date of use
    if (dateReturn !== dateUse) {
        alert('Date of return must be the same day as the date of use.');
        return;
    }

    const payload = {
        borrower_name:  borrower,
        date_filed:     filingDate,
        teacher_name:   teacher,
        date_of_use:    dateUse,
        date_of_return: dateReturn,
        class_code:     classCode,
        college:        college,
        course:         course,
        room_num:       roomNum,
        class_hours:    classHours,
        class_time:     classTime,
        equipment:      cart,
    };

    fetch(RESERVE_URL, {
        method:  'POST',
        headers: {
            'Content-Type':   'application/json',
            'X-CSRFToken':    getCsrfToken(),
        },
        body: JSON.stringify(payload),
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            // Clear cart and go back to front page
            sessionStorage.removeItem('kiosk_cart');
            sessionStorage.removeItem('kiosk_lab');
            sessionStorage.removeItem('kiosk_type');
            alert('Reservation submitted successfully!');
            window.location.href = FRONTPAGE_URL;
        } else {
            alert('Error: ' + (data.error || 'Something went wrong.'));
        }
    })
    .catch(() => alert('Network error. Please try again.'));
}
