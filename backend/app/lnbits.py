import requests
import hashlib
import hmac
from flask import current_app

class LNbitsClient:
    def __init__(self, base_url, admin_key, invoice_key):
        self.base_url = base_url.rstrip('/')
        self.admin_key = admin_key
        self.invoice_key = invoice_key
        self.headers_admin = {'X-Api-Key': admin_key, 'Content-Type': 'application/json'}
        self.headers_invoice = {'X-Api-Key': invoice_key, 'Content-Type': 'application/json'}
        self.timeout = 15

    def _request(self, method, url, **kwargs):
        kwargs.setdefault('timeout', self.timeout)
        resp = requests.request(method, url, **kwargs)
        resp.raise_for_status()
        return resp.json()

    def create_wallet(self, name, user_id):
        url = f"{self.base_url}/api/v1/wallets"
        return self._request('POST', url, json={'name': name, 'user': user_id, 'adminkey': self.admin_key}, headers=self.headers_admin)

    def create_invoice(self, wallet_id, amount_sats, memo="", expiry=3600):
        url = f"{self.base_url}/api/v1/payments"
        data = {
            'out': False,
            'amount': amount_sats,
            'memo': memo,
            'unit': 'sat',
            'wallet_id': wallet_id,
            'expiry': expiry
        }
        resp = requests.post(url, json=data, headers=self.headers_invoice, timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

    def pay_invoice(self, wallet_id, payment_request):
        url = f"{self.base_url}/api/v1/payments"
        data = {'out': True, 'bolt11': payment_request, 'wallet_id': wallet_id}
        resp = requests.post(url, json=data, headers=self.headers_invoice, timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

    def check_invoice(self, wallet_id, payment_hash):
        url = f"{self.base_url}/api/v1/payments/{payment_hash}"
        try:
            resp = requests.get(url, headers=self.headers_invoice, timeout=self.timeout)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()
        except requests.HTTPError as e:
            if e.response is not None and e.response.status_code == 404:
                return None
            raise

    def get_wallet_balance(self, wallet_id):
        url = f"{self.base_url}/api/v1/wallet/{wallet_id}"
        resp = requests.get(url, headers=self.headers_invoice, timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

def get_lnbits_client():
    config = current_app.config
    return LNbitsClient(
        base_url=config.get('LNBITS_URL', 'http://localhost:3000'),
        admin_key=config.get('LNBITS_ADMIN_KEY', ''),
        invoice_key=config.get('LNBITS_INVOICE_KEY', '')
    )

def verify_lnbits_webhook(signature, payload, secret):
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, f'sha256={expected}')
