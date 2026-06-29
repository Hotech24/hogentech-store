from django.urls import path
from .views import OrderListView, OrderDetailView, DashboardStatsView

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('stats/dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
