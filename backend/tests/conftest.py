import hmac
import hashlib
import json
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import MenuItem, Restaurant, User


class FakeLNbitsClient:
    def __init__(self):
        self.paid = False

    def create_invoice(self, wallet_id, amount_sats, memo="", expiry=3600, invoice_key=None):
        return {
            "payment_hash": "test-payment-hash",
            "payment_request": "lnbc-test-invoice",
        }

    def check_invoice(self, wallet_id, payment_hash, invoice_key=None):
        return {"paid": self.paid}


@pytest.fixture()
def app(monkeypatch):
    app = create_app("config.TestingConfig")
    fake_lnbits = FakeLNbitsClient()
    monkeypatch.setattr("app.routes.get_lnbits_client", lambda: fake_lnbits)
    app.fake_lnbits = fake_lnbits

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def sample_data(app):
    with app.app_context():
        customer = User(name="Ada Customer", email="ada@example.com", role="customer")
        customer.set_password("password123")
        other = User(name="Other Customer", email="other@example.com", role="customer")
        other.set_password("password123")
        admin = User(name="Admin User", email="admin@example.com", role="admin")
        admin.set_password("password123")
        restaurant_user = User(name="Restaurant User", email="restaurant@example.com", role="restaurant")
        restaurant_user.set_password("password123")

        restaurant = Restaurant(
            name="Pizza Palace",
            description="Pizza and sides",
            address="123 Main Street",
            lnbits_wallet_id="wallet-123",
            lnbits_invoice_key="restaurant-invoice-key",
            is_active=True,
        )
        db.session.add_all([customer, other, admin, restaurant_user, restaurant])
        db.session.flush()

        menu_item = MenuItem(
            name="Margherita",
            description="Classic pizza",
            price_sats=25000,
            category="pizza",
            restaurant_id=restaurant.id,
            is_available=True,
        )
        db.session.add(menu_item)
        db.session.commit()

        return {
            "customer_id": customer.id,
            "other_id": other.id,
            "admin_id": admin.id,
            "restaurant_user_id": restaurant_user.id,
            "restaurant_id": restaurant.id,
            "menu_item_id": menu_item.id,
        }


def login(client, email="ada@example.com", password="password123"):
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.get_json()["token"]


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def signed_webhook_headers(payload, secret="test-webhook-secret"):
    body = json.dumps(payload).encode()
    digest = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return body, {"Content-Type": "application/json", "X-LNbits-Signature": f"sha256={digest}"}
