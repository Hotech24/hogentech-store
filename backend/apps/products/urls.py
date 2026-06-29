from django.urls import path
from .views import CategoryListView, CategoryDetailView, ProductListView, ProductDetailView, SearchProductsView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', CategoryDetailView.as_view(), name='category-detail'),
    path('', ProductListView.as_view(), name='product-list'),
    path('<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    path('search/global/', SearchProductsView.as_view(), name='product-search'),
]
