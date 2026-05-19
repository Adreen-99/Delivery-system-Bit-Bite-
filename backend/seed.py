#!/usr/bin/env python3
"""
Seed sample data into the database.
Run: flask --app run:app shell
>>> from seed import seed_database; seed_database()
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import Restaurant, MenuItem
from datetime import datetime

app = create_app()

def seed_database():
    """Create sample restaurants and menu items"""
    with app.app_context():
        db.create_all()

        if Restaurant.query.count() > 0:
            print("Database already seeded. Skipping.")
            return

        restaurants = [
            {
                'name': 'Pizza Palace',
                'description': 'Authentic Italian pizzas with fresh ingredients and wood-fired taste.',
                'address': '123 Main Street, Downtown',
                'menu_items': [
                    {'name': 'Margherita Pizza', 'description': 'Classic tomato, mozzarella, and basil', 'price_sats': 25000, 'category': 'pizza'},
                    {'name': 'Pepperoni Pizza', 'description': 'Loaded with pepperoni and mozzarella', 'price_sats': 30000, 'category': 'pizza'},
                    {'name': 'Garlic Bread', 'description': 'Toasted bread with garlic butter', 'price_sats': 8000, 'category': 'sides'},
                ]
            },
            {
                'name': 'Burger Barn',
                'description': 'Gourmet crafted burgers with locally-sourced ingredients.',
                'address': '456 Oak Avenue, Midtown',
                'menu_items': [
                    {'name': 'Classic Cheeseburger', 'description': 'Beef patty, cheese, lettuce, tomato, special sauce', 'price_sats': 20000, 'category': 'burgers'},
                    {'name': 'Bacon Deluxe', 'description': 'Double patty, crispy bacon, cheddar, onion rings', 'price_sats': 28000, 'category': 'burgers'},
                    {'name': 'French Fries', 'description': 'Crispy golden fries with sea salt', 'price_sats': 7000, 'category': 'sides'},
                    {'name': 'Milkshake', 'description': 'Vanilla, chocolate, or strawberry', 'price_sats': 12000, 'category': 'drinks'},
                ]
            },
            {
                'name': 'Sushi Haven',
                'description': 'Fresh Japanese cuisine with expertly crafted sushi and rolls.',
                'address': '789 Pine Street, Arts District',
                'menu_items': [
                    {'name': 'California Roll', 'description': 'Crab, avocado, cucumber - 8 pieces', 'price_sats': 18000, 'category': 'sushi'},
                    {'name': 'Salmon Nigiri', 'description': 'Fresh salmon over pressed rice - 4 pieces', 'price_sats': 15000, 'category': 'sushi'},
                    {'name': 'Dragon Roll', 'description': 'Eel, avocado, eel sauce - 8 pieces', 'price_sats': 25000, 'category': 'sushi'},
                    {'name': 'Miso Soup', 'description': 'Traditional miso with tofu and seaweed', 'price_sats': 5000, 'category': 'sides'},
                ]
            },
            {
                'name': 'Taco Town',
                'description': 'Authentic Mexican street tacos with all the fixings.',
                'address': '321 Sunset Blvd, Westside',
                'menu_items': [
                    {'name': 'Carne Asada Tacos (3)', 'description': 'Grilled steak, cilantro, onions, salsa', 'price_sats': 15000, 'category': 'tacos'},
                    {'name': 'Al Pastor Tacos (3)', 'description': 'Marinated pork, pineapple, onion, cilantro', 'price_sats': 14000, 'category': 'tacos'},
                    {'name': 'Guacamole & Chips', 'description': 'Fresh guacamole with tortilla chips', 'price_sats': 10000, 'category': 'sides'},
                    {'name': 'Mexican Coke', 'description': 'Coca-Cola with real sugar', 'price_sats': 4000, 'category': 'drinks'},
                ]
            },
        ]

        print("Seeding database...")
        for rest_data in restaurants:
            restaurant = Restaurant(
                name=rest_data['name'],
                description=rest_data['description'],
                address=rest_data['address'],
                logo_url=rest_data.get('logo_url'),
                lnbits_wallet_id=rest_data.get('lnbits_wallet_id'),
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.session.add(restaurant)
            db.session.flush()

            for item_data in rest_data['menu_items']:
                menu_item = MenuItem(
                    name=item_data['name'],
                    description=item_data['description'],
                    price_sats=item_data['price_sats'],
                    category=item_data['category'],
                    is_available=True,
                    restaurant_id=restaurant.id,
                    created_at=datetime.utcnow()
                )
                db.session.add(menu_item)

        db.session.commit()

        rest_count = Restaurant.query.count()
        item_count = MenuItem.query.count()
        print(f"Seeded {rest_count} restaurants")
        print(f"Seeded {item_count} menu items")
        print("Sample restaurants:")
        for r in Restaurant.query.all():
            print(f"  - {r.name} ({len(r.menu_items)} items)")

if __name__ == '__main__':
    seed_database()
