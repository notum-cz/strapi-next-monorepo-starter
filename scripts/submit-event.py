import requests

# Strapi Configuration
STRAPI_URL = "https://backend.apps.viswam.ai"
API_TOKEN = "a6e7e374b93364e9bb2fe285c15f0b08c182390676091cc11986259228957a801f0e8ff3e40913c69334af21978c422682bc0f1875837a3dab9416646e08b767fce86525236b14516f2ecc91239346af099aa8fb3bc24d6a3600cf7ac8191984506fb220fac20b0ab98b9f4d1c288aa5c3a284c63b6a11d9862abce2ad01f5b4"

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

def create_event(event_data):
    """Create an event entry in Strapi"""
    url = f"{STRAPI_URL}/api/events"
    response = requests.post(url, headers=HEADERS, json={"data": event_data})
    return response.json()

def main():
    # ===== FILL YOUR EVENT DATA HERE =====
    event_data = {
        # Required fields
        "title": "Tech Conference 2026",
        "slug": "tech-conference-2026",
        "date": "2026-05-15",
        
        # Optional fields
        "subtitle": "Annual Technology & Innovation Summit",
        "time": "09:00:00.000Z",
        "location": "Hyderabad Convention Center",
        "description": "Join us for the biggest tech conference of the year featuring AI, cloud, and blockchain.",
        "organizers": "Viswam AI Team",
        "eventType": "Conference",
        "featured": True,
        "capacity": 500,
        "price": 99.99,
        "registrationRequired": True,
        "registrationLink": "https://example.com/register",
        "participationOptions": "Online or In-person",
        
        # Tags (array of text)
        "tags": [
            {"text": "AI"},
            {"text": "Technology"},
            {"text": "Networking"}
        ]
        
        # Roundtable sessions (if needed)
        # "roundtableSessions": [
        #     {"title": "AI in Healthcare", "time": "10:00"},
        #     {"title": "Blockchain Future", "time": "14:00"}
        # ]
    }
    
    response = create_event(event_data)
    print("✅ Event Created!" if "data" in response else f"❌ Error: {response}")
    print(response)

if __name__ == "__main__":
    main()
