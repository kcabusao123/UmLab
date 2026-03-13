import json
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def signin_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid request.'}, status=400)

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        # Try matching by email first, then fall back to username
        try:
            user_obj = User.objects.get(email__iexact=email)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            # Allow superuser login with username in the email field
            user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({'success': True, 'redirect': '/dashboard/'})
        return JsonResponse({'success': False, 'error': 'Invalid email or password.'}, status=400)

    return render(request, 'signin.html')


@ensure_csrf_cookie
def signup_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid request.'}, status=400)

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return JsonResponse({'success': False, 'error': 'Email and password are required.'}, status=400)
        if User.objects.filter(email__iexact=email).exists():
            return JsonResponse({'success': False, 'error': 'Email is already registered.'}, status=400)

        # Derive a unique username from the email local-part
        base = email.split('@')[0]
        username = base
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1

        User.objects.create_user(username=username, email=email, password=password)
        return JsonResponse({'success': True, 'redirect': '/signin/'})

    return render(request, 'signup.html')


@login_required
def logout_view(request):
    logout(request)
    return redirect('signin')
