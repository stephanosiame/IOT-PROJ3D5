from django.urls import path
from . import views

urlpatterns = [
    path('api/streetlights/', views.StreetlightListCreate.as_view(), name='streetlight-list'),
    path('api/streetlights/<int:pk>/', views.StreetlightDetail.as_view(), name='streetlight-detail'),
    path('api/esp32/reading/', views.ESP32ReadingView.as_view(), name='esp32-reading'),
    path('api/readings/', views.SensorReadingList.as_view(), name='reading-list'),
    path('api/alerts/', views.AlertList.as_view(), name='alert-list'),
    path('api/alerts/<int:pk>/resolve/', views.ResolveAlertView.as_view(), name='resolve-alert'),
    path('api/energylogs/', views.EnergyLogList.as_view(), name='energylog-list'),
    path('api/dashboard/', views.DashboardSummary.as_view(), name='dashboard'),
    path('api/settings/', views.SettingsView.as_view(), name='settings'),
]
