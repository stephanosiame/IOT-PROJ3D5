from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Streetlight(models.Model):
    light_id = models.CharField(max_length=50, unique=True)
    location = models.CharField(max_length=200)
    area = models.ForeignKey("Area", on_delete=models.SET_NULL, null=True, blank=True, related_name="streetlights")
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    installed_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.light_id

class SensorReading(models.Model):
    streetlight = models.ForeignKey(Streetlight, on_delete=models.CASCADE, related_name='readings')
    timestamp = models.DateTimeField(auto_now_add=True)
    voltage = models.FloatField()
    current = models.FloatField()
    power = models.FloatField()
    energy_wh = models.FloatField(default=0)

    class Meta:
        ordering = ['-timestamp']

class Alert(models.Model):
    SEVERITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]
    streetlight = models.ForeignKey(Streetlight, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=50)
    message = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

class EnergyLog(models.Model):
    streetlight = models.ForeignKey(Streetlight, on_delete=models.CASCADE, related_name='energy_logs')
    log_date = models.DateField()
    kWh_consumed = models.FloatField(default=0)
    kWh_saved = models.FloatField(default=0)
    cost_used = models.FloatField(default=0)
    baseline_kwh = models.FloatField(default=0)

    class Meta:
        unique_together = ['streetlight', 'log_date']

class DeviceToken(models.Model):
    streetlight = models.OneToOneField(Streetlight, on_delete=models.CASCADE, related_name='device_token')
    token = models.CharField(max_length=64, unique=True)
    last_seen = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Token for {self.streetlight.light_id}"

class Setting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}: {self.value}"

class Area(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
