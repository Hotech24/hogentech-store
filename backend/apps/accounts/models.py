from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('vendor', 'Vendeur'),
        ('client', 'Client'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Telephone')
    address = models.TextField(blank=True, verbose_name='Adresse')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounts_user'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_vendor(self):
        return self.role == 'vendor'

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_role_display()})"
