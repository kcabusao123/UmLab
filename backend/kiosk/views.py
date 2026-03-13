import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db import transaction
from reservation.models import Reservation, ReservationEquipment
from .models import Equipment


@ensure_csrf_cookie
def frontpage_view(request):
    return render(request, 'kiosk/frontpage.html')


@ensure_csrf_cookie
def lab_choose_view(request):
    user_type = request.GET.get('type', 'student')
    return render(request, 'kiosk/laboratory_choose.html', {'user_type': user_type})


@ensure_csrf_cookie
def pick_equipment_view(request):
    lab = request.GET.get('lab', 'physics')
    user_type = request.GET.get('type', 'student')
    return render(request, 'kiosk/pickequipment.html', {'lab': lab, 'user_type': user_type})


@ensure_csrf_cookie
def item_list_view(request):
    return render(request, 'kiosk/itemlist.html')


@ensure_csrf_cookie
def fillout_view(request):
    from schedule.models import Schedule
    from datetime import datetime, date as dt_date

    seen = set()
    schedule_list = []
    for s in Schedule.objects.order_by('class_code', 'teacher_name'):
        key = (s.class_code.lower(), s.teacher_name.lower())
        if key not in seen:
            seen.add(key)
            duration_h = round(
                (datetime.combine(dt_date.today(), s.class_time_out) -
                 datetime.combine(dt_date.today(), s.class_time_in)).seconds / 3600,
                2
            )
            schedule_list.append({
                'class_code':         s.class_code,
                'teacher_name':       s.teacher_name,
                'room_display':       s.ROOM_DISPLAY.get(s.room, s.room),
                'class_time_display': (
                    f"{s.class_time_in.strftime('%I:%M %p')} – "
                    f"{s.class_time_out.strftime('%I:%M %p')}"
                ),
                'class_hours':        duration_h,
            })
    return render(request, 'kiosk/fillout.html', {'schedules': schedule_list})


@require_http_methods(['GET'])
def api_equipment_list(request):
    lab = request.GET.get('lab', '')
    qs = Equipment.objects.all()
    if lab:
        qs = qs.filter(lab=lab)
    return JsonResponse({'equipment': [e.to_dict() for e in qs]})


@require_http_methods(['POST'])
def api_kiosk_reserve(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)

    required = ['borrower_name', 'date_filed', 'teacher_name',
                'date_of_use', 'date_of_return', 'class_code', 'college', 'course']
    for field in required:
        if not data.get(field):
            return JsonResponse({'error': f'{field} is required.'}, status=400)

    equipment_list = data.get('equipment', [])
    if not equipment_list:
        return JsonResponse({'error': 'At least one equipment item is required.'}, status=400)

    try:
        with transaction.atomic():
            reservation = Reservation.objects.create(
                borrower_name=data['borrower_name'],
                class_code=data['class_code'],
                teacher_name=data['teacher_name'],
                date_filed=data['date_filed'],
                date_of_use=data['date_of_use'],
                room_num=data.get('room_num', ''),
                date_of_return=data['date_of_return'],
                course=data['course'],
                college=data['college'],
                class_hours=data.get('class_hours'),
                class_time=data.get('class_time', ''),
                status='unapproved',
            )
            for item in equipment_list:
                ReservationEquipment.objects.create(
                    reservation=reservation,
                    name=item.get('name', ''),
                    quantity=item.get('quantity', 1),
                )
        return JsonResponse({'success': True, 'reservation_id': reservation.pk}, status=201)
    except Exception as exc:
        return JsonResponse({'error': str(exc) or 'Failed to submit reservation.'}, status=500)
