from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from games.models import Game
from payments.models import Payment

class AnalyticsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Get query parameters
        period = request.query_params.get('period', 'month')
        game_id = request.query_params.get('gameId')
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')

        # Calculate date range
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
        else:
            end = timezone.now().date()
            if period == 'week':
                start = end - timedelta(days=7)
            elif period == 'month':
                start = end - timedelta(days=30)
            elif period == 'year':
                start = end - timedelta(days=365)
            else:
                start = end - timedelta(days=30)  # Default to month

        # Base queryset
        games_queryset = Game.objects.filter(seller=request.user, is_active=True)
        if game_id:
            games_queryset = games_queryset.filter(id=game_id)

        # Get payments in date range
        payments_queryset = Payment.objects.filter(
            game__in=games_queryset,
            created_at__date__range=[start, end],
            status='completed'
        )

        # Calculate stats
        stats = {
            'total_sales': payments_queryset.count(),
            'total_revenue': payments_queryset.aggregate(
                total=Sum('amount'))['total'] or 0,
            'platform_fees': payments_queryset.aggregate(
                total=Sum('platform_fee'))['total'] or 0,
            'seller_earnings': payments_queryset.aggregate(
                total=Sum('seller_amount'))['total'] or 0,
            'total_games': games_queryset.count(),
            'average_rating': games_queryset.aggregate(
                avg=Avg('rating'))['avg'] or 0,
        }

        # Get sales data by day
        sales_data = []
        current = start
        while current <= end:
            day_sales = payments_queryset.filter(
                created_at__date=current
            ).aggregate(
                count=Count('id'),
                revenue=Sum('amount')
            )
            sales_data.append({
                'date': current.isoformat(),
                'sales': day_sales['count'] or 0,
                'revenue': day_sales['revenue'] or 0
            })
            current += timedelta(days=1)

        # Get rating data
        rating_data = []
        for game in games_queryset:
            rating_data.append({
                'title': game.title,
                'rating': game.rating or 0,
                'total_ratings': game.total_ratings or 0
            })

        # Get top performing games
        top_games = []
        for game in games_queryset.order_by('-total_sales')[:5]:
            game_payments = payments_queryset.filter(game=game)
            top_games.append({
                'id': game.id,
                'title': game.title,
                'revenue': game_payments.aggregate(total=Sum('amount'))['total'] or 0,
                'sales': game_payments.count(),
                'rating': game.rating or 0
            })

        return Response({
            'stats': stats,
            'salesData': sales_data,
            'ratingData': rating_data,
            'topGames': top_games
        })
