from rest_framework import serializers
from .models import Streetlight, SensorReading, Alert, EnergyLog, DeviceToken, Setting, Area

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['id', 'name', 'description']

class StreetlightSerializer(serializers.ModelSerializer):
    area = AreaSerializer(read_only=True)
    area_id = serializers.PrimaryKeyRelatedField(source='area', queryset=Area.objects.all(), write_only=True, required=False, allow_null=True)

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

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = '__all__'
