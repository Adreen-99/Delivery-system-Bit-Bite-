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

4. Start PostgreSQL:
   ```bash
   # From the project root, if Docker is installed:
   docker compose up -d postgres
   ```

5. Initialize/update database:
   ```bash
   flask --app run:app db upgrade
   ```

6. Seed sample data:
   ```bash
   python seed.py
   ```

7. Start the server:
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:5001/api`

## API Documentation

### Authentication
Password auth is enabled. Protected endpoints require `Authorization: Bearer <token>`.

### Restaurant Endpoints
- `GET /api/restaurants` - List all active restaurants
- `GET /api/restaurants/<id>` - Get restaurant details
- `GET /api/restaurants/<id>/menu` - Get menu items

### User Endpoints
- `POST /api/users` - Create a user (admin only)
  ```json
  { "name": "John", "email": "john@example.com", "phone": "...", "lightning_address": "..." }
  ```
- `GET /api/users/<id>` - Get user details

### Order Endpoints
- `POST /api/orders` - Create order for the authenticated user (returns Lightning invoice)
- `GET /api/orders/<id>` - Get order details for owner/admin/restaurant users
- `GET /api/orders/user/<user_id>` - List user orders for owner/admin users

### Payment Endpoints
- `GET /api/payments/check/<payment_hash>` - Check if invoice paid for owner/admin/restaurant users
- `POST /api/payments/webhook` - LNbits webhook, verified with `LNBITS_WEBHOOK_SECRET` when configured

### Delivery Endpoints
- `GET /api/delivery/<order_id>` - Get delivery status
- `PUT /api/delivery/<order_id>` - Update delivery status (admin/restaurant users only)

## Sample Order Flow

1. User creates account (POST /users)
2. Restaurant has menu items
3. User adds items to cart in frontend
4. User checks out (POST /orders) with:
   ```json
   {
     "restaurant_id": 1,
     "items": [{"menu_item_id": 1, "quantity": 2}],
     "delivery_address": "123 Main St"
   }
   ```
5. Backend creates Lightning invoice via LNbits
6. Frontend displays QR code and bolt11 invoice
7. User pays invoice with any Lightning wallet
8. Frontend polls payment status with the user's token or waits for webhook
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

Flask-Migrate is used for database migrations. Do not rely on `db.create_all()` for development or deployment.

```bash
# After modifying models
flask --app run:app db migrate -m "description"
flask --app run:app db upgrade
```
