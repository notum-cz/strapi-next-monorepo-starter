import requests

# Strapi Configuration
STRAPI_URL = "https://backend.apps.viswam.ai"
API_TOKEN = "YOUR_API_TOKEN"  # Replace with your Strapi API Token

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

def create_connect_form(form_data):
    """Create a connect-form entry in Strapi"""
    url = f"{STRAPI_URL}/api/connect-forms"
    response = requests.post(url, headers=HEADERS, json={"data": form_data})
    return response.json()

def main():
    # ===== FILL YOUR DATA HERE =====
    form_data = {
        # Text inputs
        "name": "Pavani Pothuganti",
        "email": "pavani@viswam.ai",
        "phone": "+91-9876543210",
        "company": "Viswam AI",
        
        # Text areas
        "message": "Interested in your services",
        "description": "Project inquiry",
        "comments": "Please contact me ASAP",
        
        # Select dropdown
        "category": "sales",
        
        # Radio button (single choice)
        "priority": "high",
        
        # Checkboxes (multiple choices)
        "interests": ["web-development", "ai-ml", "consulting"],
        "agreeTerms": True,
        "agreePrivacy": True,
        
        # Date/time picker
        "preferredDate": "2026-04-15T10:00:00.000Z"
    }
    
    response = create_connect_form(form_data)
    print("✅ Success!" if "data" in response else f"❌ Error: {response}")
    print(response)

if __name__ == "__main__":
    main()
