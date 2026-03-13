# UMLab – Django Backend Setup

## Quick Start

### 1. Create and activate a virtual environment
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies
```powershell
pip install -r requirements.txt
```

### 3. Configure environment variables
```powershell
copy .env.example .env
# Then edit .env with your settings (the defaults work for local SQLite dev)
```

### 4. Run migrations
```powershell
python manage.py migrate
```

### 5. Create a superuser (for /admin and initial login)
```powershell
python manage.py createsuperuser
# Enter an email and password matching what signin.html expects
```

### 6. Run the development server
```powershell
python manage.py runserver
```

Open **http://127.0.0.1:8000** — it redirects to `/signin/`.

---

## Switching to PostgreSQL

1. Create a database in PostgreSQL:
   ```sql
   CREATE DATABASE umlab;
   CREATE USER umlab_user WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE umlab TO umlab_user;
   ```
2. Fill in `.env`:
   ```
   DB_NAME=umlab
   DB_USER=umlab_user
   DB_PASSWORD=yourpassword
   DB_HOST=localhost
   DB_PORT=5432
   ```
3. Run `python manage.py migrate`

---

## Project Structure

```
backend/
├── umlab/              # Django project config (settings, urls)
├── core/               # Auth — sign in / sign up / logout
├── schedule/           # Schedule CRUD + API
├── dashboard/          # Dashboard view + attendance marking API
├── reservation/        # Reservation list + approve API
├── students/           # Student groups + attendance file upload API
├── templates/          # Django templates (converted from HTML/)
│   ├── base.html       # Base with fonts, FA, global.css
│   ├── base_app.html   # Extends base — adds sidebar + sidebar.css
│   ├── sidebar.html    # Sidebar partial (active_page context var)
│   ├── signin.html
│   ├── signup.html
│   ├── dashboard/
│   ├── reservation/
│   ├── schedule/
│   └── students/
└── static/
    └── js/             # AJAX JavaScript files
        ├── utils.js        # getCsrfToken(), apiFetch(), escapeHtml()
        ├── signin.js
        ├── signup.js
        ├── dashboard.js
        ├── schedule.js
        ├── schedule_add.js
        ├── schedule_edit.js
        ├── reservation.js
        ├── students.js
        └── students_add.js
```

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/signin/` | Login (JSON: email, password) |
| POST | `/signup/` | Register (JSON: email, password) |
| GET | `/dashboard/api/` | All schedules + today's attendance |
| POST | `/dashboard/api/attendance/<id>/` | Mark present/absent |
| GET/POST | `/schedule/api/` | List all / create schedule |
| GET/PUT/DELETE | `/schedule/api/<id>/` | Get / update / delete schedule |
| GET/POST | `/reservation/api/` | List / create reservation |
| POST | `/reservation/api/<id>/approve/` | Approve reservation |
| GET/POST | `/students/api/` | List / create student group |
| GET/DELETE | `/students/api/<id>/` | Get / delete student group |
