from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer
from apps.products.models import Product
from apps.products.permissions import IsAdminOrVendor

class OrderListView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrVendor]

    def get_queryset(self):
        return Order.objects.all().select_related('user').prefetch_related('items', 'items__product').order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        # On utilise le sérialiseur de lecture pour renvoyer l'objet complet immédiatement
        read_serializer = OrderSerializer(order)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrVendor]
    lookup_field = 'pk'

class DashboardStatsView(APIView):
    permission_classes = [IsAdminOrVendor]

    def get(self, request):
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=29)

        # Optimisation : 1 seule requête au lieu de 30
        stats = Order.objects.filter(
            status='completed', 
            created_at__date__gte=thirty_days_ago
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            amount=Sum('total')
        ).order_by('date')

        # Dictionnaire pour accès rapide : {date_obj: montant}
        sales_map = {stat['date']: float(stat['amount'] or 0) for stat in stats}

        # Construction de la liste des 30 derniers jours
        daily_sales = []
        for i in range(30):
            date = today - timedelta(days=i)
            daily_sales.append({
                'date': date.strftime('%Y-%m-%d'),
                'amount': sales_map.get(date, 0),
                'day': date.strftime('%d/%m')
            })
        daily_sales.reverse()

        # Statistiques globales
        total_orders = Order.objects.filter(created_at__date__gte=thirty_days_ago).count()
        completed_orders = Order.objects.filter(status='completed', created_at__date__gte=thirty_days_ago).count()
        total_revenue = Order.objects.filter(status='completed', created_at__date__gte=thirty_days_ago).aggregate(
            total=Sum('total')
        )['total'] or 0

        # Stock
        stock_ok = Product.objects.filter(stock_quantity__gte=10).count()
        stock_low = Product.objects.filter(stock_quantity__gt=0, stock_quantity__lt=10).count()
        stock_out = Product.objects.filter(stock_quantity=0).count()

        return Response({
            'daily_sales': daily_sales,
            'summary': {
                'total_orders': total_orders,
                'completed_orders': completed_orders,
                'total_revenue': float(total_revenue),
                'conversion_rate': round((completed_orders / total_orders * 100), 2) if total_orders > 0 else 0
            },
            'stock_status': {
                'ok': stock_ok,
                'low': stock_low,
                'out': stock_out
            }
        })