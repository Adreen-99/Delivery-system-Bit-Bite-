from datetime import datetime, timedelta

from app.extensions import db
from app.models import Delivery, Order, OrderItem, Payment
from tests.conftest import auth_header, login, signed_webhook_headers


def create_order(client, sample_data, token):
    return client.post(
        "/api/orders",
        headers=auth_header(token),
        json={
            "restaurant_id": sample_data["restaurant_id"],
            "items": [{"menu_item_id": sample_data["menu_item_id"], "quantity": 2}],
            "delivery_address": "123 Test Lane",
        },
    )


def test_register_login_and_me(client):
    register_response = client.post(
        "/api/auth/register",
        json={"name": "New User", "email": "new@example.com", "password": "password123"},
    )
    assert register_response.status_code == 201
    token = register_response.get_json()["token"]

    me_response = client.get("/api/auth/me", headers=auth_header(token))
    assert me_response.status_code == 200
    assert me_response.get_json()["email"] == "new@example.com"
    assert me_response.get_json()["role"] == "customer"


def test_restaurants_and_menu_are_public(client, sample_data):
    restaurants_response = client.get("/api/restaurants")
    assert restaurants_response.status_code == 200
    assert restaurants_response.get_json()[0]["name"] == "Pizza Palace"

    menu_response = client.get(f"/api/restaurants/{sample_data['restaurant_id']}/menu")
    assert menu_response.status_code == 200
    assert menu_response.get_json()[0]["price_sats"] == 25000


def test_order_creation_requires_auth(client, sample_data):
    response = client.post(
        "/api/orders",
        json={
            "restaurant_id": sample_data["restaurant_id"],
            "items": [{"menu_item_id": sample_data["menu_item_id"], "quantity": 1}],
            "delivery_address": "123 Test Lane",
        },
    )
    assert response.status_code == 401


def test_order_creation_returns_invoice(client, app, sample_data):
    token = login(client)
    response = create_order(client, sample_data, token)

    assert response.status_code == 201
    body = response.get_json()
    assert body["order"]["total_sats"] == 50060
    assert body["payment"]["payment_hash"] == "test-payment-hash"
    assert body["payment"]["status"] == "pending"


def test_user_cannot_read_someone_elses_order(client, sample_data):
    owner_token = login(client)
    order_response = create_order(client, sample_data, owner_token)
    order_id = order_response.get_json()["order"]["id"]

    other_token = login(client, "other@example.com")
    response = client.get(f"/api/orders/{order_id}", headers=auth_header(other_token))

    assert response.status_code == 403


def test_payment_check_marks_paid(client, app, sample_data):
    token = login(client)
    create_order(client, sample_data, token)
    app.fake_lnbits.paid = True

    response = client.get("/api/payments/check/test-payment-hash", headers=auth_header(token))

    assert response.status_code == 200
    assert response.get_json()["payment"]["status"] == "paid"
    assert response.get_json()["order"]["status"] == "confirmed"


def test_expired_payment_updates_order(client, app, sample_data):
    token = login(client)
    create_order(client, sample_data, token)

    with app.app_context():
        payment = Payment.query.filter_by(payment_hash="test-payment-hash").one()
        payment.expires_at = datetime.utcnow() - timedelta(seconds=1)
        db.session.commit()

    response = client.get("/api/orders/1", headers=auth_header(token))

    assert response.status_code == 200
    assert response.get_json()["payment"]["status"] == "expired"
    assert response.get_json()["status"] == "payment_expired"


def test_delivery_update_requires_admin_or_restaurant_role(client, sample_data):
    customer_token = login(client)
    order_id = create_order(client, sample_data, customer_token).get_json()["order"]["id"]

    customer_response = client.put(
        f"/api/delivery/{order_id}",
        headers=auth_header(customer_token),
        json={"status": "ready"},
    )
    assert customer_response.status_code == 403

    restaurant_token = login(client, "restaurant@example.com")
    restaurant_response = client.put(
        f"/api/delivery/{order_id}",
        headers=auth_header(restaurant_token),
        json={"status": "ready", "estimated_time": 20},
    )
    assert restaurant_response.status_code == 200
    assert restaurant_response.get_json()["status"] == "ready"


def test_webhook_requires_valid_signature(client, sample_data):
    token = login(client)
    create_order(client, sample_data, token)

    bad_response = client.post(
        "/api/payments/webhook",
        json={"payment_hash": "test-payment-hash"},
        headers={"X-LNbits-Signature": "sha256=bad"},
    )
    assert bad_response.status_code == 401

    body, headers = signed_webhook_headers({"payment_hash": "test-payment-hash"})
    good_response = client.post("/api/payments/webhook", data=body, headers=headers)
    assert good_response.status_code == 200

    with client.application.app_context():
        payment = Payment.query.filter_by(payment_hash="test-payment-hash").one()
        assert payment.status == "paid"
