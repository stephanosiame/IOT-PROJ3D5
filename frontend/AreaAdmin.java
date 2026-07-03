cat > energy/admin.py << 'ADMINEOF'
from django.contrib import admin
from .models import (
    Streetlight,
    SensorReading,
    Alert,
    EnergyLog,
    DeviceToken,
    Setting,
    Area
)

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(Streetlight)
class StreetlightAdmin(admin.ModelAdmin):
    list_display = ('id', 'light_id', 'area', 'location', 'is_active', 'installed_date')
    list_filter = ('is_active', 'installed_date', 'area')
    search_fields = ('light_id', 'location')
    ordering = ('light_id',)

@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ('id', 'streetlight', 'timestamp', 'voltage', 'current', 'power', 'energy_wh')
    list_filter = ('streetlight', 'timestamp')
    search_fields = ('streetlight__light_id',)
    ordering = ('-timestamp',)
    date_hierarchy = 'timestamp'

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'streetlight', 'alert_type', 'severity', 'is_resolved', 'created_at')
    list_filter = ('severity', 'is_resolved', 'alert_type', 'streetlight')
    search_fields = ('message', 'streetlight__light_id')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

@admin.register(EnergyLog)
class EnergyLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'streetlight', 'log_date', 'kWh_consumed', 'kWh_saved', 'cost_used')
    list_filter = ('streetlight', 'log_date')
    search_fields = ('streetlight__light_id',)
    ordering = ('-log_date',)
    date_hierarchy = 'log_date'

@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'streetlight', 'token', 'last_seen', 'is_active')
    list_filter = ('is_active', 'last_seen')
    search_fields = ('token', 'streetlight__light_id')
    ordering = ('-last_seen',)

@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'updated_at')
    search_fields = ('key', 'value')
ADMINEOF