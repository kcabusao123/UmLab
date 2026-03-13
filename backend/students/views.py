from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db import transaction
from .models import StudentGroup
from schedule.models import Schedule


@login_required
@ensure_csrf_cookie
def student_page(request):
    return render(request, 'students/student.html', {'active_page': 'students'})


@login_required
@ensure_csrf_cookie
def student_add_page(request):
    # Exclude schedules whose class_code already has an attendance file attached.
    # Once that StudentGroup is deleted the code re-appears automatically.
    taken_codes = (
        StudentGroup.objects
        .exclude(attendance_file='')
        .exclude(attendance_file__isnull=True)
        .values_list('class_code', flat=True)
    )
    schedules = Schedule.objects.exclude(class_code__in=taken_codes).order_by('class_time_in')
    return render(request, 'students/student_add.html', {
        'active_page': 'students',
        'schedules': schedules,
    })


@login_required
@require_http_methods(['GET', 'POST'])
def api_student_list(request):
    if request.method == 'GET':
        session_filter = request.GET.get('session')
        qs = list(StudentGroup.objects.all())
        if session_filter:
            qs = [s for s in qs if s.session == session_filter]
        return JsonResponse({'students': [s.to_dict() for s in qs]})

    # POST — multipart (file upload)
    teacher_name = request.POST.get('teacher_name', '').strip()
    class_time_in = request.POST.get('class_time_in', '').strip()
    class_time_out = request.POST.get('class_time_out', '').strip()
    class_schedule = request.POST.get('class_schedule', '').strip()
    class_code = request.POST.get('class_code', '').strip()
    course = request.POST.get('course', '').strip()
    course_other = request.POST.get('course_other', '').strip()

    if course == 'others':
        course = course_other

    required = {
        'teacher_name': teacher_name,
        'class_time_in': class_time_in,
        'class_time_out': class_time_out,
        'class_schedule': class_schedule,
        'class_code': class_code,
        'course': course,
    }
    for field, value in required.items():
        if not value:
            return JsonResponse({'error': f'{field} is required.'}, status=400)

    try:
        with transaction.atomic():
            student_group = StudentGroup.objects.create(
                teacher_name=teacher_name,
                class_time_in=class_time_in,
                class_time_out=class_time_out,
                class_schedule=class_schedule,
                class_code=class_code,
                course=course,
                attendance_file=request.FILES.get('attendance_file'),
            )
            student_group.refresh_from_db()
        return JsonResponse({'success': True, 'student': student_group.to_dict()}, status=201)
    except Exception as exc:
        return JsonResponse({'error': str(exc) or 'Failed to save student group.'}, status=500)


@login_required
@require_http_methods(['GET', 'DELETE'])
def api_student_detail(request, pk):
    student = get_object_or_404(StudentGroup, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'student': student.to_dict()})
    # DELETE
    try:
        with transaction.atomic():
            student.delete()
        return JsonResponse({'success': True})
    except Exception as exc:
        return JsonResponse({'error': str(exc) or 'Failed to delete student.'}, status=500)
