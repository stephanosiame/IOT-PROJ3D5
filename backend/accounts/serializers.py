from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default='engineer')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role')
        user = User.objects.create_user(**validated_data)
        user.profile.role = role
        user.profile.save()
        return user
