from django.db import models

class Invoice(models.Model):
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=50, unique=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    pdf_file = models.FileField(upload_to='invoices/%Y/%m/', blank=True, null=True)

    class Meta:
        verbose_name = 'Facture'
        verbose_name_plural = 'Factures'
        ordering = ['-generated_at']

    def __str__(self):
        return f"Facture {self.invoice_number}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            from datetime import datetime
            # Utilisation d'un format plus précis avec un compteur si nécessaire
            date_str = datetime.now().strftime('%Y%m%d')
            base_number = f"FAC-{date_str}-{self.order.id}"
            
            # Vérification simple pour éviter les doublons (cas extrêmes)
            if Invoice.objects.filter(invoice_number=base_number).exists():
                # Ajoute un suffixe aléatoire ou un timestamp plus précis en cas de conflit
                import uuid
                self.invoice_number = f"{base_number}-{uuid.uuid4().hex[:4].upper()}"
            else:
                self.invoice_number = base_number
        
        super().save(*args, **kwargs)
