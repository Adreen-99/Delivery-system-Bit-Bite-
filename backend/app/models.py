from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from .extensions import db

# Association table for Restaurant-User favorites (many-to-many)
favorites = db.Table('favorites',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('restaurant_id', db.Integer, db.ForeignKey('restaurant.id'), primary_key=True)
)

class User(db.Model):
    """Customer user model"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(256), nullable=True)
    lightning_address = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(20), nullable=False, default='customer', server_default='customer')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    orders = db.relationship('Order', backref='customer', lazy=True)
    deliveries = db.relationship('Delivery', backref='customer', lazy=True)
    favorite_restaurants = db.relationship(
        'Restaurant',
        secondary=favorites,
        backref=db.backref('favorited_by', lazy='dynamic')
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'lightning_address': self.lightning_address,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class Restaurant(db.Model):
    """Restaurant/merchant model"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    address = db.Column(db.String(255), nullable=False)
    logo_url = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # LNbits wallet for this restaurant (to receive payments)
    lnbits_wallet_id = db.Column(db.String(100), nullable=True)
    lnbits_invoice_key = db.Column(db.String(100), nullable=True)

    # Relationships
    menu_items = db.relationship('MenuItem', backref='restaurant', lazy=True)
    orders = db.relationship('Order', backref='restaurant', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'address': self.address,
            'logo_url': self.logo_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class MenuItem(db.Model):
    """Menu item model"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price_sats = db.Column(db.Integer, nullable=False)  # Price in satoshis
    image_url = db.Column(db.String(255), nullable=True)
    category = db.Column(db.String(50), nullable=False, default='food')
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Foreign keys
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price_sats': self.price_sats,
            'image_url': self.image_url,
            'category': self.category,
            'is_available': self.is_available,
            'restaurant_id': self.restaurant_id
        }

class Order(db.Model):
    """Order model"""
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    status = db.Column(
        db.String(20),
        nullable=False,
        default='pending',
        server_default='pending'
    )
    total_sats = db.Column(db.Integer, nullable=False)
    platform_fee_sats = db.Column(db.Integer, default=10)
    delivery_fee_sats = db.Column(db.Integer, default=50)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    payment = db.relationship('Payment', backref='order', lazy=True, uselist=False)
    delivery = db.relationship('Delivery', backref='order', lazy=True, uselist=False)

    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'status': self.status,
            'total_sats': self.total_sats,
            'platform_fee_sats': self.platform_fee_sats,
            'delivery_fee_sats': self.delivery_fee_sats,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'customer': self.customer.to_dict() if self.customer else None,
            'restaurant': self.restaurant.to_dict() if self.restaurant else None,
            'items': [item.to_dict() for item in self.items],
            'payment': self.payment.to_dict() if self.payment else None,
            'delivery': self.delivery.to_dict() if self.delivery else None
        }

class OrderItem(db.Model):
    """Individual items within an order"""
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price_sats = db.Column(db.Integer, nullable=False)  # Price at time of order

    # Foreign keys
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_item.id'), nullable=False)

    # Relationship
    menu_item = db.relationship('MenuItem', backref='order_items')

    def to_dict(self):
        return {
            'id': self.id,
            'quantity': self.quantity,
            'price_sats': self.price_sats,
            'menu_item': self.menu_item.to_dict() if self.menu_item else None
        }

class Delivery(db.Model):
    """Delivery tracking model"""
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(
        db.String(20),
        nullable=False,
        default='preparing',
        server_default='preparing'
    )
    delivery_address = db.Column(db.String(255), nullable=False)
    driver_name = db.Column(db.String(100), nullable=True)
    driver_contact = db.Column(db.String(20), nullable=True)
    estimated_time = db.Column(db.Integer, nullable=True)  # Minutes
    delivered_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign keys
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'status': self.status,
            'delivery_address': self.delivery_address,
            'driver_name': self.driver_name,
            'driver_contact': self.driver_contact,
            'estimated_time': self.estimated_time,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Payment(db.Model):
    """Lightning payment model"""
    id = db.Column(db.Integer, primary_key=True)
    payment_hash = db.Column(db.String(128), unique=True, nullable=False)
    payment_request = db.Column(db.Text, nullable=False)  # Bolt11 invoice
    amount_sats = db.Column(db.Integer, nullable=False)
    status = db.Column(
        db.String(20),
        nullable=False,
        default='pending',
        server_default='pending'
    )
    paid_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Foreign keys
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'payment_hash': self.payment_hash,
            'payment_request': self.payment_request,
            'amount_sats': self.amount_sats,
            'status': self.status,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat()
        }
