from celery import shared_task
from django.utils import timezone
from django.conf import settings
import paypalrestsdk
from .models import Payment, Transaction


# Configure PayPal
paypalrestsdk.configure({
    "mode": settings.PAYPAL_MODE,
    "client_id": settings.PAYPAL_CLIENT_ID,
    "client_secret": settings.PAYPAL_CLIENT_SECRET
})


@shared_task
def process_pending_payments():
    """
    Process all pending payments
    """
    pending_payments = Payment.objects.filter(
        status='pending',
        created_at__gte=timezone.now() - timezone.timedelta(days=1)  # Only process recent payments
    )
    
    processed_count = 0
    for payment in pending_payments:
        try:
            # Verify payment with PayPal
            paypal_payment = paypalrestsdk.Payment.find(payment.paypal_payment_id)
            
            if paypal_payment.state == 'approved':
                # Create purchase transaction
                Transaction.objects.create(
                    payment=payment,
                    transaction_type='purchase',
                    amount=payment.amount,
                    paypal_transaction_id=paypal_payment.transactions[0].related_resources[0].sale.id,
                    status='completed',
                    notes='Payment approved by PayPal'
                )
                
                # Create platform fee transaction
                Transaction.objects.create(
                    payment=payment,
                    transaction_type='platform_fee',
                    amount=payment.platform_fee,
                    paypal_transaction_id=paypal_payment.transactions[0].related_resources[0].sale.id,
                    status='completed',
                    notes='Platform fee collected'
                )
                
                # Update payment status
                payment.status = 'completed'
                payment.completed_at = timezone.now()
                payment.save()
                
                # Trigger game purchase processing
                from games.tasks import process_game_purchase
                process_game_purchase.delay(payment.id)
                
                processed_count += 1
            
            elif paypal_payment.state in ['expired', 'cancelled', 'failed']:
                payment.status = 'failed'
                payment.save()
                
                Transaction.objects.create(
                    payment=payment,
                    transaction_type='purchase',
                    amount=payment.amount,
                    paypal_transaction_id=payment.paypal_payment_id,
                    status='failed',
                    notes=f'Payment {paypal_payment.state}'
                )
        
        except Exception as e:
            # Log the error
            from core.models import AuditLog
            AuditLog.objects.create(
                action='payment',
                model_name='Payment',
                object_id=str(payment.id),
                object_repr=f'Payment {payment.id}',
                changes={'error': str(e)},
                user=payment.buyer
            )
    
    return f"Processed {processed_count} payments"


@shared_task
def process_seller_payments():
    """
    Process payments to sellers for completed transactions
    """
    # Get completed payments where seller hasn't been paid
    unpaid_payments = Payment.objects.filter(
        status='completed',
        is_seller_paid=False,
        completed_at__lte=timezone.now() - timezone.timedelta(days=1)  # 24h holding period
    )
    
    processed_count = 0
    for payment in unpaid_payments:
        try:
            # Create PayPal payout
            payout = paypalrestsdk.Payout({
                "sender_batch_header": {
                    "sender_batch_id": f"SAMMA_PAYOUT_{payment.id}_{timezone.now().timestamp()}",
                    "email_subject": "You have a payment from Samma Games"
                },
                "items": [
                    {
                        "recipient_type": "EMAIL",
                        "amount": {
                            "value": str(payment.seller_amount),
                            "currency": "USD"
                        },
                        "receiver": payment.seller.paypal_email,
                        "note": f"Payment for game: {payment.game.title}",
                        "sender_item_id": f"PAYMENT_{payment.id}"
                    }
                ]
            })
            
            if payout.create():
                # Create seller payment transaction
                Transaction.objects.create(
                    payment=payment,
                    transaction_type='seller_payment',
                    amount=payment.seller_amount,
                    paypal_transaction_id=payout.batch_header.payout_batch_id,
                    status='completed',
                    notes='Seller payment processed'
                )
                
                payment.is_seller_paid = True
                payment.save()
                
                # Create notification for seller
                from core.models import Notification
                Notification.objects.create(
                    user=payment.seller,
                    notification_type='sale',
                    title='Payment Received',
                    message=f'You received payment of ${payment.seller_amount} for {payment.game.title}',
                    data={
                        'payment_id': payment.id,
                        'amount': str(payment.seller_amount)
                    }
                )
                
                processed_count += 1
            else:
                # Log payout error
                from core.models import AuditLog
                AuditLog.objects.create(
                    action='payment',
                    model_name='Payment',
                    object_id=str(payment.id),
                    object_repr=f'Seller Payment {payment.id}',
                    changes={'error': payout.error},
                    user=payment.seller
                )
        
        except Exception as e:
            # Log the error
            from core.models import AuditLog
            AuditLog.objects.create(
                action='payment',
                model_name='Payment',
                object_id=str(payment.id),
                object_repr=f'Seller Payment {payment.id}',
                changes={'error': str(e)},
                user=payment.seller
            )
    
    return f"Processed {processed_count} seller payments"


@shared_task
def cleanup_abandoned_payments():
    """
    Clean up abandoned payment records
    """
    # Define the threshold for abandoned payments (e.g., 24 hours)
    threshold = timezone.now() - timezone.timedelta(hours=24)
    
    # Get abandoned payments
    abandoned_payments = Payment.objects.filter(
        status='pending',
        created_at__lt=threshold
    )
    
    # Update their status
    count = abandoned_payments.count()
    abandoned_payments.update(status='failed')
    
    return f"Cleaned up {count} abandoned payments" 