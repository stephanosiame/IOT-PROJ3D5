from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from .models import Streetlight, SensorReading, Alert, EnergyLog, DeviceToken
from .serializers import (
    StreetlightSerializer, SensorReadingSerializer,
    AlertSerializer, EnergyLogSerializer
)

class StreetlightListCreate(generics.ListCreateAPIView):
    queryset = Streetlight.objects.all()
    serializer_class = StreetlightSerializer

class StreetlightDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Streetlight.objects.all()
    serializer_class = StreetlightSerializer

class ESP32ReadingView(APIView):
    def post(self, request):
        token = request.data.get('token')
        try:
            device = DeviceToken.objects.select_related('streetlight').get(token=token, is_active=True)
            streetlight = device.streetlight
        except DeviceToken.DoesNotExist:
            return Response({"error": "Invalid or inactive token"}, status=401)

        reading = SensorReading.objects.create(
            streetlight=streetlight,
            voltage=request.data['voltage'],
            current=request.data['current'],
            power=request.data['power'],
            energy_wh=request.data.get('energy_wh', 0)
        )
        return Response({"status": "ok", "reading_id": reading.id}, status=201)

class SensorReadingList(generics.ListAPIView):
    serializer_class = SensorReadingSerializer
    def get_queryset(self):
        qs = SensorReading.objects.all()
        light_id = self.request.query_params.get('streetlight')
        if light_id:
            qs = qs.filter(streetlight__id=light_id)
        return qs

class AlertList(generics.ListAPIView):
    serializer_class = AlertSerializer
    def get_queryset(self):
        return Alert.objects.filter(is_resolved=False)

class ResolveAlertView(APIView):
    def post(self, request, pk):
        try:
            alert = Alert.objects.get(pk=pk)
            alert.is_resolved = True
            alert.save()
            return Response({"status": "resolved"})
        except Alert.DoesNotExist:
            return Response({"error": "Alert not found"}, status=404)

class EnergyLogList(generics.ListAPIView):
    serializer_class = EnergyLogSerializer
    def get_queryset(self):
        qs = EnergyLog.objects.all()
        start = self.request.query_params.get('start_date')
        end = self.request.query_params.get('end_date')
        if start:
            qs = qs.filter(log_date__gte=start)
        if end:
            qs = qs.filter(log_date__lte=end)
        return qs

class DashboardSummary(APIView):
    def get(self, request):
        total_lights = Streetlight.objects.filter(is_active=True).count()
        total_energy = EnergyLog.objects.aggregate(total=models.Sum('kWh_consumed'))['total'] or 0
        total_savings = EnergyLog.objects.aggregate(total=models.Sum('kWh_saved'))['total'] or 0
        unresolved_alerts = Alert.objects.filter(is_resolved=False).count()
        return Response({
            'total_streetlights': total_lights,
            'total_energy_kwh': total_energy,
            'total_savings_kwh': total_savings,
            'unresolved_alerts': unresolved_alerts,
        })

def check_and_create_alerts(streetlight, voltage, current, power):
    """Create alerts if readings exceed thresholds."""
    alerts = []
    if voltage > 250:
        alerts.append(Alert(
            streetlight=streetlight,
            alert_type='overvoltage',
            message=f'Voltage {voltage}V exceeds 250V',
            severity='high'
        ))
    elif voltage < 180:
        alerts.append(Alert(
            streetlight=streetlight,
            alert_type='undervoltage',
            message=f'Voltage {voltage}V below 180V',
            severity='medium'
        ))
    if power < 10 and current < 0.1:
        alerts.append(Alert(
            streetlight=streetlight,
            alert_type='faulty_light',
            message=f'Power {power}W indicates light may be off or broken',
            severity='high'
        ))
    if alerts:
        Alert.objects.bulk_create(alerts)
    return alerts

# Replace your existing ESP32ReadingView.post method with this enhanced version
# (or manually edit the file to add the call to check_and_create_alerts)
