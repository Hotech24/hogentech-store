from django.urls import path
from .views import (
    InvoiceListView,
    InvoiceDetailView,
    GenerateInvoiceView,
    PreviewInvoiceView,
    DownloadInvoicePDFView,
)

urlpatterns = [
    path('', InvoiceListView.as_view(), name='invoice-list'),
    path('<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('<int:pk>/download/', DownloadInvoicePDFView.as_view(), name='invoice-download'),
    path('generate/<int:order_id>/', GenerateInvoiceView.as_view(), name='invoice-generate'),
    path('preview/<int:order_id>/', PreviewInvoiceView.as_view(), name='invoice-preview'),
]