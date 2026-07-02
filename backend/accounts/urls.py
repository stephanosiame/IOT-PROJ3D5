from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserListView, UserDetailView, MeView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    path('me/', MeView.as_view(), name='me'),
]
