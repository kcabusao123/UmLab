import json
from datetime import date
from django.utils import timezone
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db import transaction
from django.db.models import Sum
from schedule.models import Schedule
from .models import Attendance


@login_required
@ensure_csrf_cookie
def dashboard_page(request):
    return render(request, 'dashboard/dashboard.html', {'active_page': 'dashboard'})


@login_required
@require_http_methods(['GET'])
def api_dashboard(request):
    session_filter = request.GET.get('session')
    today = date.today()
    qs = Schedule.objects.all()

    try:
        result = {'morning': [], 'afternoon': [], 'evening': []}
        with transaction.atomic():
            for s in qs:
                attendance, _ = Attendance.objects.get_or_create(
                    schedule=s,
                    date=today,
                    defaults={'status': 'pending', 'total_hours': 0},
                )
                entry = s.to_dict()
                cumulative = (
                    Attendance.objects
                    .filter(schedule=s, status='present')
                    .aggregate(total=Sum('total_hours'))['total'] or 0
                )
                entry['attendance_id'] = attendance.id
                entry['attendance_status'] = attendance.status
                entry['total_hours'] = str(cumulative)
                entry['marked_at'] = attendance.marked_at.isoformat() if attendance.marked_at else None
                result[s.session].append(entry)

        if session_filter and session_filter in result:
            return JsonResponse({'schedules': result[session_filter]})
        return JsonResponse({'schedules': result})
    except Exception as exc:
        return JsonResponse({'error': str(exc) or 'Failed to load dashboard.'}, status=500)


@login_required
@require_http_methods(['POST'])
def api_attendance_update(request, pk):
    attendance = get_object_or_404(Attendance, pk=pk)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)

    status = data.get('status')
    if status not in ('present', 'absent', 'pending'):
        return JsonResponse({'error': 'Invalid status value.'}, status=400)

    try:
        with transaction.atomic():
            attendance.status = status
            attendance.marked_at = timezone.now()
            # Each day is worth exactly 2 hours when present, 0 otherwise.
            # This prevents double-counting if Present is pressed more than once per day.
            attendance.total_hours = 2 if status == 'present' else 0
            attendance.save()
            attendance.refresh_from_db()
            # Return cumulative hours (sum of all present days for this schedule)
            cumulative = (
                Attendance.objects
                .filter(schedule=attendance.schedule, status='present')
                .aggregate(total=Sum('total_hours'))['total'] or 0
            )
        return JsonResponse({
            'success': True,
            'status': attendance.status,
            'total_hours': str(cumulative),
            'marked_at': attendance.marked_at.isoformat() if attendance.marked_at else None,
        })
    except Exception as exc:
        return JsonResponse({'error': str(exc) or 'Failed to update attendance.'}, status=500)
