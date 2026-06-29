from rest_framework import serializers
from .models import Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    # On récupère l'ID ou le statut de la commande liée si jamais ton frontend en a besoin
    order_id = serializers.IntegerField(source='order.id', read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'order', 'order_id', 'invoice_number', 'generated_at', 'pdf_file']