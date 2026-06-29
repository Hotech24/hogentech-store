from django.db import transaction
from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.models import Product

# 1. Ce sérialiseur doit être défini en premier
class OrderCreateItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

# 2. Sérialiseur pour les éléments d'une commande existante (affichage)
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'unit_price', 'subtotal']

    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.product.image.url)
            return obj.product.image.url
        return None

# 3. Sérialiseur pour l'affichage de la commande
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'customer_name', 'customer_phone', 'customer_email',
                  'status', 'status_display', 'payment_method', 'payment_method_display',
                  'total', 'notes', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'order_number', 'total', 'created_at', 'updated_at']

# 4. Sérialiseur pour la création (utilise OrderCreateItemSerializer déjà défini)
class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderCreateItemSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = ['customer_name', 'customer_phone', 'customer_email', 'payment_method', 'notes', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # transaction.atomic garantit que si une erreur survient, 
        # rien n'est enregistré en base (ni la commande, ni la baisse de stock)
        with transaction.atomic():
            order = Order.objects.create(**validated_data)
            total = 0
            
            for item_data in items_data:
                try:
                    # select_for_update() verrouille le produit pour éviter les ventes concurrentes
                    product = Product.objects.select_for_update().get(id=item_data['product_id'], is_active=True)
                    
                    if product.stock_quantity < item_data['quantity']:
                        raise serializers.ValidationError(f"Stock insuffisant pour {product.name}")

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        product_name=product.name,
                        quantity=item_data['quantity'],
                        unit_price=product.price
                    )
                    
                    total += (product.price * item_data['quantity'])
                    product.stock_quantity -= item_data['quantity']
                    product.save()

                except Product.DoesNotExist:
                    raise serializers.ValidationError(f"Produit avec ID {item_data['product_id']} non trouvé")

            order.total = total
            order.save()
            
        return order