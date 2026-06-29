from django.urls import path
from .views import UserListView, UserDetailView, UserCreateView, ChangePasswordView, SearchUsersView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('create/', UserCreateView.as_view(), name='user-create'),
    path('<str:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('<str:pk>/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('search/', SearchUsersView.as_view(), name='user-search'),
]
