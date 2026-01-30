#!/usr/bin/env python3
"""Seed script for Strapi using admin authentication"""

import requests
import sys
import json

API_URL = "http://localhost:1337"
ADMIN_EMAIL = "admin@strapi.local"
ADMIN_PASSWORD = "Admin123!"

def main():
    print("🌱 Starting Strapi seed with authentication...")
    
    # Login and get JWT token
    print("🔐 Authenticating...")
    try:
        login_response = requests.post(
            f"{API_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        login_response.raise_for_status()
        token = login_response.json()["data"]["token"]
        print("✓ Authenticated")
    except Exception as e:
        print(f"❌ Failed to authenticate: {e}")
        sys.exit(1)
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    def post_data(endpoint, name, data):
        try:
            response = requests.post(
                f"{API_URL}/api/{endpoint}",
                json={"data": data},
                headers=headers
            )
            response.raise_for_status()
            result = response.json()
            if "data" in result and "id" in result["data"]:
                print(f"  ✓ {name}")
                return result["data"]["id"]
            else:
                print(f"  ✗ {name}: {result}")
                return None
        except Exception as e:
            print(f"  ✗ {name}: {e}")
            return None
    
    # Seed Genres
    print("📦 Seeding genres...")
    genres_data = [
        {"name": "RPG", "slug": "rpg"},
        {"name": "Visual Novel", "slug": "visual-novel"},
        {"name": "Dating Sim", "slug": "dating-sim"},
        {"name": "Sandbox", "slug": "sandbox"},
        {"name": "Management", "slug": "management"},
    ]
    for genre in genres_data:
        post_data("genres", genre["name"], genre)
    
    # Seed Tags
    print("📦 Seeding tags...")
    tags_data = [
        {"name": "Incest", "slug": "incest", "is_explicit": True},
        {"name": "NTR", "slug": "ntr", "is_explicit": True},
        {"name": "Corruption", "slug": "corruption", "is_explicit": True},
        {"name": "MILF", "slug": "milf", "is_explicit": True},
        {"name": "Male Protagonist", "slug": "male-protagonist", "is_explicit": False},
    ]
    for tag in tags_data:
        post_data("tags", tag["name"], tag)
    
    # Seed Engines
    print("📦 Seeding engines...")
    engines_data = [
        {"name": "Ren'Py", "slug": "renpy"},
        {"name": "Unity", "slug": "unity"},
        {"name": "RPG Maker", "slug": "rpg-maker"},
        {"name": "Unreal Engine", "slug": "unreal-engine"},
    ]
    for engine in engines_data:
        post_data("engines", engine["name"], engine)
    
    # Seed Platforms
    print("📦 Seeding platforms...")
    platforms_data = [
        {"name": "Windows", "slug": "windows"},
        {"name": "Mac", "slug": "mac"},
        {"name": "Linux", "slug": "linux"},
        {"name": "Android", "slug": "android"},
    ]
    for platform in platforms_data:
        post_data("platforms", platform["name"], platform)
    
    # Seed Developer
    print("📦 Seeding developer...")
    dev_data = {
        "name": "Notum Studio",
        "slug": "notum-studio",
        "patreon_link": "https://patreon.com/notumstudio",
        "website_link": "https://notum.cz",
        "twitter": "https://twitter.com/notumcz",
        "discord": "https://discord.gg/notum",
        "subscribestar": "https://subscribestar.com/notum",
    }
    dev_id = post_data("developers", "Notum Studio", dev_data)
    
    if dev_id:
        # Seed Sample Game
        print("📦 Seeding sample game...")
        game_data = {
            "title": "Sample Game",
            "slug": "sample-game",
            "version": "1.0.0",
            "status": "Ongoing",
            "release_date": "2025-01-29",
            "is_featured": True,
            "trending_score": 100,
            "description": "This is a sample game to demonstrate the architecture.",
            "developer": dev_id,
        }
        post_data("games", "Sample Game", game_data)
    
    print("✅ Seed completed!")

if __name__ == "__main__":
    main()
