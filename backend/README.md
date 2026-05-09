# Bit-Bite Backend

Flask API for Bit-Bite food delivery with Lightning Network payments.

## Setup

1. Create virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your database and LNbits credentials
   ```

4. Initialize database:
   ```bash
   flask --app run:app db init
   flask --app run:app db migrate -m "Initial migration"
   flask --app run:app db upgrade
   ```

5. Start the server:
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:5000/api`

## API Documentation

### Authentication
Currently no authentication. Users are identified by ID only.

### Restaurant Endpoints
- `GET /api/restaurants` - List all active restaurants
- `GET /api/restaurants/<id>` - Get restaurant details
- `GET /api/restaurants/<id>/menu` - Get menu items

### User Endpoints
- `POST /api/users` - Create a user
  ```json
  { "name": "John", "email": "john@example.com", "phone": "...", "lightning_address": "..." }
  ```
- `GET /api/users/<id>` - Get user details

### Order Endpoints
- `POST /api/orders` - Create order (returns Lightning invoice)
- `GET /api/orders/<id>` - Get order details
- `GET /api/orders/user/<user_id>` - List user orders

### Payment Endpoints
- `GET /api/payments/check/<payment_hash>` - Check if invoice paid
- `POST /api/payments/webhook` - LNbits webhook (called automatically)

### Delivery Endpoints
- `GET /api/delivery/<order_id>` - Get delivery status
- `PUT /api/delivery/<order_id>` - Update delivery status

## Sample Order Flow

1. User creates account (POST /users)
2. Restaurant has menu items
3. User adds items to cart in frontend
4. User checks out (POST /orders) with:
   ```json
   {
     "user_id": 1,
     "restaurant_id": 1,
     "items": [{"menu_item_id": 1, "quantity": 2}],
     "delivery_address": "123 Main St"
   }
   ```
5. Backend creates Lightning invoice via LNbits
6. Frontend displays QR code and bolt11 invoice
7. User pays invoice with any Lightning wallet
8. Frontend polls payment status or waits for webhook
9. Restaurant prepares order, driver picks up
10. Delivery status updates to "delivered"

## Database Models

- **User** - Customer information
- **Restaurant** - Merchant with LNbits wallet
- **MenuItem** - Food items with price in satoshis
- **Order** - Main order record
- **OrderItem** - Individual order line items
- **Delivery** - Delivery tracking info
- **Payment** - Lightning payment record

## Lightning Integration

Uses LNbits API to:
- Create invoices (BOLT11)
- Check payment status
- Receive webhook notifications

Restaurants must have their own LNbits wallets configured. Platform fees are deducted automatically via the invoice amount.

## Development

Flask-Migrate is used for database migrations.

```bash
# After modifying models
flask --app run:app db migrate -m "description"
flask --app run:app db upgrade
```
