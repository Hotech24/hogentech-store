import uuid
from datetime import datetime
from django.db import models
from django.conf import settings

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('completed', 'Terminee'),
        ('cancelled', 'Annulee'),
    ]
    PAYMENT_CHOICES = [
        ('cash', 'Especes'),
        ('card', 'Carte bancaire'),
        ('mobile', 'Mobile Money'),
        ('transfer', 'Virement'),
    ]

    # Augmentation de max_length à 50 pour inclure le suffixe UUID
    order_number = models.CharField(max_length=50, unique=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    customer_name = models.CharField(max_length=200, blank=True, verbose_name='Nom client')
    customer_phone = models.CharField(max_length=20, blank=True, verbose_name='Telephone client')
    customer_email = models.EmailField(blank=True, verbose_name='Email client')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Statut')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='cash', verbose_name='Mode de paiement')
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Total')
    notes = models.TextField(blank=True, verbose_name='Notes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Commande'
        verbose_name_plural = 'Commandes'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Génération d'un numéro unique basé sur la date et un identifiant aléatoire court
            date_str = datetime.now().strftime('%Y%m%d')
            random_suffix = uuid.uuid4().hex[:6].upper()
            self.order_number = f"HT-{date_str}-{random_suffix}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Commande {self.order_number}"

    def calculate_total(self):
        total = sum(item.subtotal for item in self.items.all())
        self.total = total
        self.save(update_fields=['total'])
        return total

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    product_name = models.CharField(max_length=200, verbose_name='Nom du produit (snapshot)')
    quantity = models.PositiveIntegerField(default=1, verbose_name='Quantite')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Prix unitaire')

    class Meta:
        verbose_name = 'Ligne de commande'
        verbose_name_plural = 'Lignes de commande'

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"