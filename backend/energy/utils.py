from .models import Setting

def get_setting(key, default=None):
    try:
        setting = Setting.objects.get(key=key)
        return setting.value
    except Setting.DoesNotExist:
        return default
