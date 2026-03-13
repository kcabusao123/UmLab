import json
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db import transaction
from .models import Reservation, ReservationEquipment


@login_required
@ensure_csrf_cookie
def reservation_page(request):
    return render(request, 'reservation/reservation.html', {'active_page': 'reservation'})


@login_required
@require_http_methods(['GET', 'POST'])
def api_reservation_list(request):
    if request.method == 'GET':
        status_filter = request.GET.get('status')
        qs = Reservation.objects.prefetch_related('equipment').all()
        if status_filter:
            qs = qs.filter(status=status_filter)
        return JsonResponse({'reservations': [r.to_dict() for r in qs]})

    # POST — create
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)

    required = ['borrower_name', 'class_code', 'teacher_name',
                'date_filed', 'date_of_use', 'room_num', 'date_of_return', 'course', 'college']
    for field in required:
        if not data.get(field):
            return JsonResponse({'error': f'{field} is required.'}, status=400)

    try:
        with transaction.atomic():
            reservation = Reservation.objects.create(
                borrower_name=data['borrower_name'],
                class_code=data['class_code'],
                teacher_name=data['teacher_name'],
                date_filed=data['date_filed'],
                date_of_use=data['date_of_use'],
                room_num=data['room_num'],
                date_of_return=data['date_of_return'],
                course=data['course'],
                college=data['college'],
                class_hours=data.get('class_hours'),
                class_time=data.get('class_time', ''),
            )
            for eq in data.get('equipment', []):
                ReservationEquipment.objects.create(
                    reservation=reservation,
                    name=eq['name'],
                    quantity=eq['quantity'],
                )
            reservation.refresh_from_db()
        return JsonResponse({'success': True, 'reservation': reservation.to_dict()}, status=201)
    except Exception as exc:
        return JsonResponse({'error': str(exc) or 'Failed to save reservation.'}, status=500)


@login_required
@require_http_methods(['POST'])
def api_reservation_approve(request, pk):
    reservation = get_object_or_404(Reservation, pk=pk)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)

    new_status = data.get('status', 'approved')
    if new_status not in ('approved', 'unapproved'):
        return JsonResponse({'error': 'Invalid status value.'}, status=400)

    try:
        with transaction.atomic():
            reservation.status = new_status
            reservation.save()
        return JsonResponse({'success': True, 'status': reservation.status})
    except Exception as exc:
        return JsonResponse({'error': str(exc) or 'Failed to update reservation.'}, status=500)


@login_required
@require_http_methods(['GET', 'DELETE'])
def api_reservation_detail(request, pk):
    """GET a single reservation or DELETE it."""
    reservation = get_object_or_404(Reservation, pk=pk)

    if request.method == 'GET':
        return JsonResponse({'reservation': reservation.to_dict()})

    # DELETE
    try:
        with transaction.atomic():
            reservation.delete()
        return JsonResponse({'success': True})
    except Exception as exc:
        return JsonResponse({'error': str(exc) or 'Failed to delete reservation.'}, status=500)
