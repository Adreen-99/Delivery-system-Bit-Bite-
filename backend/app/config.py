import os
from dotenv import load_dotenv

load_dotenv()

def normalize_database_url(database_url):
    if database_url.startswith('postgres://'):
        return database_url.replace('postgres://', 'postgresql://', 1)
    return database_url

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-change-me')

    SQLALCHEMY_DATABASE_URI = normalize_database_url(
        os.getenv('DATABASE_URL', 'sqlite:///dev.db')
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    LNBITS_URL = os.getenv('LNBITS_URL', 'http://localhost:3000')
    LNBITS_ADMIN_KEY = os.getenv('LNBITS_ADMIN_KEY', '')
    LNBITS_INVOICE_KEY = os.getenv('LNBITS_INVOICE_KEY', '')

    PLATFORM_FEE_SATS = int(os.getenv('PLATFORM_FEE_SATS', '10'))
    DELIVERY_FEE_SATS = int(os.getenv('DELIVERY_FEE_SATS', '50'))

    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
