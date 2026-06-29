import os
import traceback
import base64
from datetime import datetime
from django.conf import settings
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from weasyprint import HTML

from apps.orders.models import Order
from apps.products.permissions import IsAdminOrVendor
from .models import Invoice
from .serializers import InvoiceSerializer

# ============================================================
# HELPER POUR LE LOGO (Correction)
# ============================================================

def get_logo_base64():
    """Convertit le logo en base64 pour WeasyPrint."""
    # Assurez-vous que le chemin pointe vers le fichier dans votre dossier
    path = os.path.join(settings.BASE_DIR, 'images_source', 'hogentech_logo.png')
    try:
        if os.path.exists(path):
            with open(path, "rb") as image_file:
                encoded = base64.b64encode(image_file.read()).decode()
                return f"data:image/png;base64,{encoded}"
    except Exception:
        pass
    return None

# ============================================================
# VUES DRF
# ============================================================

class InvoiceListView(generics.ListAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdminOrVendor]

    def get_queryset(self):
        queryset = Invoice.objects.all().order_by("-generated_at")
        order_id = self.request.query_params.get("order")
        if order_id:
            queryset = queryset.filter(order_id=order_id)
        return queryset.select_related("order", "order__user")

class InvoiceDetailView(generics.RetrieveAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdminOrVendor]
    lookup_field = "pk"

class PreviewInvoiceView(APIView):
    permission_classes = [IsAdminOrVendor]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"detail": "Commande non trouvée."}, status=404)

        invoice_number = f"FAC-{datetime.now().strftime('%Y%m%d')}-{order.id}"
        context = {
            "invoice": {"invoice_number": invoice_number, "generated_at": datetime.now()},
            "order": order,
            "items": order.items.all(),
            "company": {
                "name": getattr(settings, "INVOICE_COMPANY_NAME", "HogenTech Store"),
                "address": getattr(settings, "INVOICE_COMPANY_ADDRESS", ""),
                "phone": getattr(settings, "INVOICE_COMPANY_PHONE", ""),
                "email": getattr(settings, "INVOICE_COMPANY_EMAIL", ""),
            },
            "date": datetime.now().strftime("%d/%m/%Y"),
            "preview": True,
            "logo_path": get_logo_base64(),
        }
        html_string = render_to_string("invoices/invoice.html", context)
        return Response({"html": html_string, "invoice_number": invoice_number})

def _authenticate_jwt(request):
    auth = JWTAuthentication()
    try:
        user, token = auth.authenticate(request)
        request.user = user
        return user
    except (AuthenticationFailed, TypeError):
        return None

# ============================================================
# VUE GÉNÉRATION PDF
# ============================================================

@method_decorator(csrf_exempt, name='dispatch')
class GenerateInvoiceView(View):
    def post(self, request, order_id):
        user = _authenticate_jwt(request)
        if not user:
            return JsonResponse({'detail': 'Non authentifié'}, status=401)
        if not (user.is_staff or getattr(user, 'is_vendor', False)):
            return JsonResponse({'detail': 'Permission refusée'}, status=403)

        try:
            order = Order.objects.get(id=order_id)
            invoice, created = Invoice.objects.get_or_create(
                order=order,
                defaults={"invoice_number": f"FAC-{datetime.now().strftime('%Y%m%d')}-{order.id}"},
            )

            if invoice.pdf_file and os.path.exists(invoice.pdf_file.path):
                return JsonResponse({
                    "download_url": request.build_absolute_uri(settings.MEDIA_URL + str(invoice.pdf_file)),
                    "invoice_id": invoice.id,
                    "invoice_number": invoice.invoice_number,
                    "message": "Facture déjà existante"
                })

            context = {
                "invoice": invoice,
                "order": order,
                "items": order.items.all(),
                "company": {
                    "name": getattr(settings, "INVOICE_COMPANY_NAME", "HogenTech Store"),
                    "address": getattr(settings, "INVOICE_COMPANY_ADDRESS", ""),
                    "phone": getattr(settings, "INVOICE_COMPANY_PHONE", ""),
                    "email": getattr(settings, "INVOICE_COMPANY_EMAIL", ""),
                },
                "date": datetime.now().strftime("%d/%m/%Y"),
                "logo_path": get_logo_base64(),
            }

            html_string = render_to_string("invoices/invoice.html", context)
            pdf_bytes = HTML(string=html_string).write_pdf()

            pdf_path = f"invoices/{datetime.now().strftime('%Y/%m')}/{invoice.invoice_number}.pdf"
            full_path = os.path.join(settings.MEDIA_ROOT, pdf_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "wb") as f:
                f.write(pdf_bytes)

            invoice.pdf_file = pdf_path
            invoice.save()

            return JsonResponse({
                "download_url": request.build_absolute_uri(settings.MEDIA_URL + pdf_path),
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "message": "Facture générée avec succès"
            })

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error": str(e)}, status=500)

class DownloadInvoicePDFView(View):
    def get(self, request, pk):
        user = _authenticate_jwt(request)
        if not user:
            return JsonResponse({'detail': 'Non authentifié'}, status=401)
        if not (user.is_staff or getattr(user, 'is_vendor', False)):
            return JsonResponse({'detail': 'Permission refusée'}, status=403)

        invoice = get_object_or_404(Invoice, pk=pk)

        if not invoice.pdf_file or not os.path.exists(invoice.pdf_file.path):
            order = invoice.order
            context = {
                "invoice": invoice,
                "order": order,
                "items": order.items.all(),
                "company": {
                    "name": getattr(settings, "INVOICE_COMPANY_NAME", "HogenTech Store"),
                    "address": getattr(settings, "INVOICE_COMPANY_ADDRESS", ""),
                    "phone": getattr(settings, "INVOICE_COMPANY_PHONE", ""),
                    "email": getattr(settings, "INVOICE_COMPANY_EMAIL", ""),
                },
                "date": datetime.now().strftime("%d/%m/%Y"),
                "logo_path": get_logo_base64(),
            }
            html_string = render_to_string("invoices/invoice.html", context)
            pdf_bytes = HTML(string=html_string).write_pdf()

            pdf_path = f"invoices/{datetime.now().strftime('%Y/%m')}/{invoice.invoice_number}.pdf"
            full_path = os.path.join(settings.MEDIA_ROOT, pdf_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "wb") as f:
                f.write(pdf_bytes)

            invoice.pdf_file = pdf_path
            invoice.save()

        return JsonResponse({
            "download_url": request.build_absolute_uri(settings.MEDIA_URL + str(invoice.pdf_file)),
            "invoice_number": invoice.invoice_number,
        })