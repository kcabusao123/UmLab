import json
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db import transaction
from .models import Schedule


@login_required
@ensure_csrf_cookie
def schedule_page(request):
    return render(request, 'schedule/schedule.html', {'active_page': 'schedule'})


@login_required
@ensure_csrf_cookie
def schedule_add_page(request):
    return render(request, 'schedule/schedule_add.html', {'active_page': 'schedule'})


@login_required
@ensure_csrf_cookie
def schedule_edit_page(request, pk):
    schedule = get_object_or_404(Schedule, pk=pk)
    return render(request, 'schedule/schedule_edit.html', {
        'active_page': 'schedule',
        'schedule': schedule,
    })


@login_required
@require_http_methods(['GET', 'POST'])
def api_schedule_list(request):
    if request.method == 'GET':
        session_filter = request.GET.get('session')
        qs = Schedule.objects.all()
        result = {'morning': [], 'afternoon': [], 'evening': []}
        for s in qs:
            result[s.session].append(s.to_dict())

        if session_filter and session_filter in result:
            return JsonResponse({'schedules': result[session_filter]})
        return JsonResponse({'schedules': result})

    # POST — create
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)

    required = ['room', 'teacher_name', 'class_time_in', 'class_time_out', 'class_schedule', 'class_code', 'course']
    for field in required:
        if not data.get(field):
            return JsonResponse({'error': f'{field} is required.'}, status=400)

    # A class code must always belong to the same teacher.
    # Reject if the code already exists under a different teacher name.
    conflict = (
        Schedule.objects
        .filter(class_code=data['class_code'])
        .exclude(teacher_name__iexact=data['teacher_name'])
        .values_list('teacher_name', flat=True)
        .first()
    )
    if conflict:
        return JsonResponse(
            {'error': f'Class code "{data["class_code"]}" is already assigned to {conflict}. '
                      f'A class code cannot be shared between different teachers.'},
            status=400,
        )

    try:
        with transaction.atomic():
            schedule = Schedule.objects.create(
                room=data['room'],
                teacher_name=data['teacher_name'],
                class_time_in=data['class_time_in'],
                class_time_out=data['class_time_out'],
                class_schedule=data['class_schedule'],
                class_code=data['class_code'],
                course=data['course'],
                status=data.get('status', 'tentative'),
            )
            # refresh_from_db converts raw strings to proper Python types
            # (TimeField stays as str after create until re-fetched from DB)
            schedule.refresh_from_db()
        return JsonResponse({'success': True, 'schedule': schedule.to_dict()}, status=201)
    except Exception as exc:
        return JsonResponse({'error': str(exc) or 'Failed to save schedule.'}, status=500)


@login_required
@require_http_methods(['GET', 'PUT', 'DELETE'])
def api_schedule_detail(request, pk):
    schedule = get_object_or_404(Schedule, pk=pk)

    if request.method == 'GET':
        return JsonResponse({'schedule': schedule.to_dict()})

    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)

        # If class_code or teacher_name is being changed, re-validate the pairing
        new_code    = data.get('class_code',    schedule.class_code)
        new_teacher = data.get('teacher_name',  schedule.teacher_name)
        conflict = (
            Schedule.objects
            .filter(class_code=new_code)
            .exclude(pk=schedule.pk)
            .exclude(teacher_name__iexact=new_teacher)
            .values_list('teacher_name', flat=True)
            .first()
        )
        if conflict:
            return JsonResponse(
                {'error': f'Class code "{new_code}" is already assigned to {conflict}. '
                          f'A class code cannot be shared between different teachers.'},
                status=400,
            )

        fields = ['room', 'teacher_name', 'class_time_in', 'class_time_out',
                  'class_schedule', 'class_code', 'course', 'status']
        try:
            with transaction.atomic():
                for field in fields:
                    if field in data:
                        setattr(schedule, field, data[field])
                schedule.save()
                schedule.refresh_from_db()
            return JsonResponse({'success': True, 'schedule': schedule.to_dict()})
        except Exception as exc:
            return JsonResponse({'error': str(exc) or 'Failed to update schedule.'}, status=500)

    # DELETE
    try:
        with transaction.atomic():
            schedule.delete()
        return JsonResponse({'success': True})
    except Exception as exc:
        return JsonResponse({'error': str(exc) or 'Failed to delete schedule.'}, status=500)
