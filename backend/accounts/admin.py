from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ('role',)

# Extend the default UserAdmin to include the profile inline
class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_role')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')

    def get_role(self, obj):
        return obj.profile.role if hasattr(obj, 'profile') else '—'
    get_role.short_description = 'Role'

# Re-register User with the custom admin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# Register UserProfile separately if needed
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')
    ordering = ('user__username',)
