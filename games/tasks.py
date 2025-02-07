from celery import shared_task
from django.db.models import F, Count, Avg
from django.utils import timezone
from math import log
from .models import Game


@shared_task
def update_game_rankings():
    """
    Update ad scores for all active games based on bid percentage, rating, and comments
    """
    games = Game.objects.filter(is_active=True, is_approved=True)
    
    for game in games:
        comments_count = game.comments.count()
        
        # Ad score formula: (bid_percentage * 10) + (rating) + (log(comments_count + 1) * 2)
        ad_score = (
            game.bid_percentage * 10 +  # Bid has the highest weight
            game.rating +               # Rating directly added
            (log(comments_count + 1) * 2)  # Logarithmic scale for comments
        )
        
        Game.objects.filter(id=game.id).update(ad_score=ad_score)

    return f"Updated rankings for {games.count()} games"


@shared_task
def process_game_purchase(payment_id):
    """
    Process game purchase after successful payment
    """
    from payments.models import Payment
    
    try:
        payment = Payment.objects.get(id=payment_id)
        game = payment.game
        
        # Update game statistics
        game.total_sales = F('total_sales') + 1
        game.save()
        
        # Update seller statistics
        seller = game.seller
        seller.total_sales = F('total_sales') + payment.amount
        seller.save()
        
        # Create notification for seller
        from core.models import Notification
        Notification.objects.create(
            user=seller,
            notification_type='sale',
            title=f'New sale: {game.title}',
            message=f'Your game {game.title} was purchased by {payment.buyer.username}',
            data={
                'game_id': game.id,
                'payment_id': payment.id,
                'amount': str(payment.amount)
            }
        )
        
        return f"Successfully processed purchase for game {game.id}"
    
    except Payment.DoesNotExist:
        return f"Payment {payment_id} not found"
    except Exception as e:
        return f"Error processing game purchase: {str(e)}"


@shared_task
def cleanup_inactive_games():
    """
    Clean up games that have been inactive for a long time
    """
    # Define the threshold for inactivity (e.g., 1 year)
    threshold = timezone.now() - timezone.timedelta(days=365)
    
    # Get inactive games
    inactive_games = Game.objects.filter(
        is_active=True,
        updated_at__lt=threshold,
        total_sales=0
    )
    
    # Deactivate games
    count = inactive_games.count()
    inactive_games.update(is_active=False)
    
    return f"Deactivated {count} inactive games"


@shared_task
def update_game_statistics():
    """
    Update statistics for all games
    """
    games = Game.objects.filter(is_active=True)
    
    for game in games:
        # Update ratings
        ratings = game.comments.filter(rating__isnull=False).aggregate(
            avg_rating=Avg('rating'),
            total_ratings=Count('id')
        )
        
        game.rating = ratings['avg_rating'] or 0
        game.total_ratings = ratings['total_ratings']
        
        # Save the game
        game.save()
    
    return f"Updated statistics for {games.count()} games" 