from rest_framework import serializers
from .models import Streetlight, SensorReading, Alert, EnergyLog, DeviceToken

class StreetlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Streetlight
        fields = '__all__'

class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = '__all__'

class AlertSerializer(serializers.ModelSerializer):
    resolved_by_username = serializers.CharField(source='resolved_by.username', read_only=True)
    class Meta:
        model = Alert
        fields = '__all__'

class EnergyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnergyLog
        fields = '__all__'

class DeviceTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceToken
        fields = '__all__'
