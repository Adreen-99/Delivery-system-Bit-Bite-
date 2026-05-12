from flask import Blueprint, request, jsonify, current_app
from itsdangerous import URLSafeTimedSerializer as Serializer
from .models import db, User, Restaurant, MenuItem, Order, OrderItem, Delivery, Payment
from .lnbits import get_lnbits_client
import uuid
from datetime import datetime

api_bp = Blueprint('api', __name__)

def generate_token(user_id):
    s = Serializer(current_app.config['SECRET_KEY'], salt='auth')
    return s.dumps({'user_id': user_id})

def verify_token(token):
    s = Serializer(current_app.config['SECRET_KEY'], salt='auth')
    try:
        data = s.loads(token)
        return User.query.get(data['user_id'])
    except Exception:
        return None

# ============ RESTAURANTS & MENU ============

@api_bp.route('/restaurants', methods=['GET'])
def get_restaurants():
    """Get all active restaurants"""
    restaurants = Restaurant.query.filter_by(is_active=True).all()
    return jsonify([r.to_dict() for r in restaurants]), 200

@api_bp.route('/restaurants/<int:restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):
    """Get single restaurant details"""
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    return jsonify(restaurant.to_dict()), 200

@api_bp.route('/restaurants/<int:restaurant_id>/menu', methods=['GET'])
def get_menu(restaurant_id):
    """Get menu items for a restaurant"""
    items = MenuItem.query.filter_by(
        restaurant_id=restaurant_id,
        is_available=True
    ).all()
    return jsonify([item.to_dict() for item in items]), 200

# ============ USERS ============

@api_bp.route('/users', methods=['POST'])
def create_user():
    """Register a new user"""
    data = request.get_json()
    required = ['name', 'email']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    user = User(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone'),
        lightning_address=data.get('lightning_address')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@api_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get user details"""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200

# ============ AUTH ============

@api_bp.route('/auth/register', methods=['POST'])
def register():
    """Register a new user with password"""
    data = request.get_json()
    required = ['name', 'email', 'password']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    user = User(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone'),
        lightning_address=data.get('lightning_address')
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id)
    return jsonify({'user': user.to_dict(), 'token': token}), 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    """Login with email and password"""
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = generate_token(user.id)
    return jsonify({'user': user.to_dict(), 'token': token}), 200

@api_bp.route('/auth/me', methods=['GET'])
def get_current_user():
    """Get current user from token"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401

    token = auth_header.split(' ', 1)[1]
    user = verify_token(token)
    if not user:
        return jsonify({'error': 'Invalid or expired token'}), 401

    return jsonify(user.to_dict()), 200

# ============ ORDERS ============

@api_bp.route('/orders', methods=['POST'])
def create_order():
    """Create a new order with Lightning invoice"""
    data = request.get_json()
    required = ['user_id', 'restaurant_id', 'items', 'delivery_address']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    user = User.query.get(data['user_id'])
    restaurant = Restaurant.query.get(data['restaurant_id'])
    if not user or not restaurant:
        return jsonify({'error': 'Invalid user or restaurant'}), 404

    # Validate items and calculate total
    total_sats = 0
    order_items = []
    for item_data in data['items']:
        menu_item = MenuItem.query.get(item_data['menu_item_id'])
        if not menu_item or not menu_item.is_available:
            return jsonify({'error': f'Item {item_data["menu_item_id"]} not available'}), 400

        quantity = item_data.get('quantity', 1)
        item_total = menu_item.price_sats * quantity
        total_sats += item_total

        order_item = OrderItem(
            quantity=quantity,
            price_sats=menu_item.price_sats,
            menu_item_id=menu_item.id
        )
        order_items.append(order_item)

    # Add platform fee and delivery fee
    platform_fee = current_app.config.get('PLATFORM_FEE_SATS', 10)
    delivery_fee = current_app.config.get('DELIVERY_FEE_SATS', 50)
    total_sats += platform_fee + delivery_fee

    # Generate unique order number
    order_number = f"BB-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

    # Create order
    order = Order(
        order_number=order_number,
        total_sats=total_sats,
        platform_fee_sats=platform_fee,
        delivery_fee_sats=delivery_fee,
        user_id=user.id,
        restaurant_id=restaurant.id
    )
    db.session.add(order)
    db.session.flush()  # Get order ID

    # Associate items with order
    for item in order_items:
        item.order_id = order.id
        db.session.add(item)

    # Create delivery record
    delivery = Delivery(
        delivery_address=data['delivery_address'],
        order_id=order.id,
        user_id=user.id
    )
    db.session.add(delivery)

    # Create Lightning invoice via LNbits
    try:
        client = get_lnbits_client()
        memo = f"Bit-Bite Order #{order_number} - {restaurant.name}"
        invoice_data = client.create_invoice(
            wallet_id=restaurant.lnbits_wallet_id or restaurant.id,
            amount_sats=total_sats,
            memo=memo,
            expiry=1800  # 30 minutes
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create Lightning invoice: {str(e)}'}), 500

    # Save payment record
    payment = Payment(
        payment_hash=invoice_data['payment_hash'],
        payment_request=invoice_data['payment_request'],
        amount_sats=total_sats,
        status='pending',
        order_id=order.id
    )
    db.session.add(payment)
    db.session.commit()

    return jsonify({
        'order': order.to_dict(),
        'payment': payment.to_dict(),
        'message': 'Order created. Pay the Lightning invoice to confirm.'
    }), 201

@api_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get order details"""
    order = Order.query.get_or_404(order_id)
    return jsonify(order.to_dict()), 200

@api_bp.route('/orders/user/<int:user_id>', methods=['GET'])
def get_user_orders(user_id):
    """Get all orders for a user"""
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200

# ============ PAYMENTS ============

@api_bp.route('/payments/check/<payment_hash>', methods=['GET'])
def check_payment(payment_hash):
    """Check payment status"""
    payment = Payment.query.filter_by(payment_hash=payment_hash).first_or_404()
    order = payment.order

    # If still pending, check with LNbits
    if payment.status == 'pending':
        try:
            client = get_lnbits_client()
            wallet_id = order.restaurant.lnbits_wallet_id or order.restaurant.id
            invoice_info = client.check_invoice(wallet_id, payment_hash)

            if invoice_info and invoice_info.get('paid'):
                payment.status = 'paid'
                payment.paid_at = datetime.utcnow()
                order.status = 'confirmed'

                db.session.commit()

                return jsonify({
                    'payment': payment.to_dict(),
                    'order': order.to_dict(),
                    'message': 'Payment confirmed!'
                }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({
        'payment': payment.to_dict(),
        'order': order.to_dict()
    }), 200

@api_bp.route('/payments/webhook', methods=['POST'])
def payment_webhook():
    """Webhook endpoint for LNbits payment notifications"""
    data = request.get_json()
    payment_hash = data.get('payment_hash')

    if not payment_hash:
        return jsonify({'error': 'Missing payment_hash'}), 400

    payment = Payment.query.filter_by(payment_hash=payment_hash).first()
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404

    payment.status = 'paid'
    payment.paid_at = datetime.utcnow()
    payment.order.status = 'confirmed'

    db.session.commit()

    return jsonify({'status': 'ok'}), 200

# ============ DELIVERY TRACKING ============

@api_bp.route('/delivery/<int:order_id>', methods=['GET'])
def get_delivery_status(order_id):
    """Get delivery status for an order"""
    delivery = Delivery.query.filter_by(order_id=order_id).first_or_404()
    return jsonify(delivery.to_dict()), 200

@api_bp.route('/delivery/<int:order_id>', methods=['PUT'])
def update_delivery_status(order_id):
    """Update delivery status (driver/merchant endpoint)"""
    delivery = Delivery.query.filter_by(order_id=order_id).first_or_404()
    data = request.get_json()

    allowed_statuses = ['preparing', 'ready', 'in_transit', 'delivered']
    new_status = data.get('status')
    if new_status not in allowed_statuses:
        return jsonify({'error': 'Invalid status'}), 400

    delivery.status = new_status
    if new_status == 'delivered':
        delivery.delivered_at = datetime.utcnow()
        delivery.order.status = 'completed'

    # Update driver info if provided
    delivery.driver_name = data.get('driver_name', delivery.driver_name)
    delivery.driver_contact = data.get('driver_contact', delivery.driver_contact)
    delivery.estimated_time = data.get('estimated_time', delivery.estimated_time)

    db.session.commit()
    return jsonify(delivery.to_dict()), 200

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'bit-bite-api'}), 200
