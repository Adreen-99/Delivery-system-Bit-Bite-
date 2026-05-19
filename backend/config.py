import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError('SECRET_KEY must be set in environment')

    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError('DATABASE_URL must be set in environment')
    if SQLALCHEMY_DATABASE_URI.startswith('postgres://'):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace('postgres://', 'postgresql://', 1)

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    LNBITS_URL = os.getenv('LNBITS_URL', 'http://localhost:3000')
    LNBITS_ADMIN_KEY = os.getenv('LNBITS_ADMIN_KEY', '')
    LNBITS_INVOICE_KEY = os.getenv('LNBITS_INVOICE_KEY', '')

    PLATFORM_FEE_SATS = int(os.getenv('PLATFORM_FEE_SATS', '10'))
    DELIVERY_FEE_SATS = int(os.getenv('DELIVERY_FEE_SATS', '50'))

    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'https://delivery-system-bit-bite.vercel.app')
