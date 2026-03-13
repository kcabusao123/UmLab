import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Security ────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'dev-insecure-change-me-in-production')
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost 127.0.0.1').split()

# ─── Applications ─────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Project apps
    'core',
    'schedule',
    'dashboard',
    'reservation',
    'students',
    'kiosk',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'umlab.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'umlab.wsgi.application'

# ─── Database ─────────────────────────────────────────────────────────────────
# This project requires PostgreSQL. Configure DB_* variables in your .env file.
# SQLite is NOT supported and is intentionally removed to prevent silent data loss.
from django.core.exceptions import ImproperlyConfigured as _ImproperlyConfigured

_DB_NAME = os.environ.get('DB_NAME')
if not _DB_NAME:
    raise _ImproperlyConfigured(
        "DB_NAME environment variable is not set. "
        "Copy .env.example to .env and fill in your PostgreSQL credentials."
    )

DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql',
        'NAME':     _DB_NAME,
        'USER':     os.environ.get('DB_USER', ''),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST':     os.environ.get('DB_HOST', 'localhost'),
        'PORT':     os.environ.get('DB_PORT', '5432'),
    }
}

# ─── Auth ─────────────────────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
LOGIN_URL = '/signin/'
LOGIN_REDIRECT_URL = '/dashboard/'

# ─── Internationalisation ─────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Manila'
USE_I18N = True
USE_TZ = True

# ─── Static files ─────────────────────────────────────────────────────────────
# backend/static/  holds JS files.
# UmLab/ root contains CSS/ and assets/ used by templates via {% static 'CSS/...' %}
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static',       # backend/static/js/
    BASE_DIR.parent,           # UmLab/ — exposes CSS/ and assets/ as /static/CSS/ and /static/assets/
]
STATIC_ROOT = BASE_DIR / 'staticfiles'   # target for `collectstatic` in production

# ─── Media files (attendance uploads) ─────────────────────────────────────────
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── CSRF settings ────────────────────────────────────────────────────────────
CSRF_COOKIE_HTTPONLY = False   # JS needs to read the csrftoken cookie
CSRF_TRUSTED_ORIGINS = os.environ.get(
    'CSRF_TRUSTED_ORIGINS', 'http://localhost:8000 http://127.0.0.1:8000'
).split()
