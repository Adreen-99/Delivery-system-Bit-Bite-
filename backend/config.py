import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://postgres:postgres@localhost:5432/bitbite'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # LNbits API
    LNBITS_URL = os.getenv('LNBITS_URL', 'http://localhost:3000')
    LNBITS_ADMIN_KEY = os.getenv('LNBITS_ADMIN_KEY', '')
    LNBITS_INVOICE_KEY = os.getenv('LNBITS_INVOICE_KEY', '')

    # Fee settings (sats)
    PLATFORM_FEE_SATS = int(os.getenv('PLATFORM_FEE_SATS', '10'))
    DELIVERY_FEE_SATS = int(os.getenv('DELIVERY_FEE_SATS', '50'))
