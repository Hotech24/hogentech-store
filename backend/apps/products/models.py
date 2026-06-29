from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name='Nom')
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, verbose_name='Description')
    icon = models.CharField(max_length=50, blank=True, help_text="Nom icone Lucide")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Categorie'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200, verbose_name='Nom')
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(verbose_name='Description')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Prix')
    stock_quantity = models.PositiveIntegerField(default=0, verbose_name='Quantite en stock')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products', verbose_name='Categorie')
    image = models.ImageField(upload_to='products/%Y/%m/', blank=True, null=True, verbose_name='Image')
    is_active = models.BooleanField(default=True, verbose_name='Actif')
    featured = models.BooleanField(default=False, verbose_name='Mis en avant')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Produit'
        verbose_name_plural = 'Produits'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def stock_status(self):
        if self.stock_quantity == 0:
            return 'rupture'
        elif self.stock_quantity < 10:
            return 'bas'
        return 'ok'

    @property
    def stock_status_display(self):
        status_map = {'ok': 'Disponible', 'bas': 'Stock bas', 'rupture': 'Rupture'}
        return status_map.get(self.stock_status, 'Inconnu')
