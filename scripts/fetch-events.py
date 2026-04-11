import requests

# Strapi Configuration
STRAPI_URL = "https://backend.apps.viswam.ai"
API_TOKEN = "a6e7e374b93364e9bb2fe285c15f0b08c182390676091cc11986259228957a801f0e8ff3e40913c69334af21978c422682bc0f1875837a3dab9416646e08b767fce86525236b14516f2ecc91239346af099aa8fb3bc24d6a3600cf7ac8191984506fb220fac20b0ab98b9f4d1c288aa5c3a284c63b6a11d9862abce2ad01f5b4"

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

def fetch_events():
    """Fetch all events from Strapi"""
    url = f"{STRAPI_URL}/api/events?populate=*&sort[0]=date:asc"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code == 200:
        return response.json().get("data", [])
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
        return []

def display_events(events):
    """Display events in a nice format"""
    if not events:
        print("📭 No events found.")
        return
    
    print(f"\n{'='*80}")
    print(f"📅 EVENTS ({len(events)} total)")
    print(f"{'='*80}\n")
    
    for i, event in enumerate(events, 1):
        attrs = event.get("attributes", {})
        image = attrs.get("image", {})
        image_url = None
        
        # Get image URL if exists
        if image.get("data"):
            img_data = image["data"]
            if isinstance(img_data, dict):
                image_url = img_data.get("url", "")
        
        tags = attrs.get("tags", {}).get("data", [])
        tag_names = [t.get("attributes", {}).get("text") for t in tags if t.get("attributes")]
        
        sessions = attrs.get("roundtableSessions", [])
        session_titles = [s.get("title") for s in sessions if s.get("title")]
        
        print(f"{'─'*80}")
        print(f"🎫 Event #{i}")
        print(f"{'─'*80}")
        print(f"  📌 Title:            {attrs.get('title', 'N/A')}")
        print(f"  🔗 Slug:             {attrs.get('slug', 'N/A')}")
        print(f"  📝 Subtitle:         {attrs.get('subtitle', 'N/A')}")
        print(f"  📅 Date:             {attrs.get('date', 'N/A')}")
        print(f"  🕐 Time:             {attrs.get('time', 'N/A')}")
        print(f"  📍 Location:         {attrs.get('location', 'N/A')}")
        print(f"  🎭 Event Type:       {attrs.get('eventType', 'N/A')}")
        print(f"  ⭐ Featured:         {'✅' if attrs.get('featured') else '❌'}")
        print(f"  👥 Capacity:         {attrs.get('capacity', 'N/A')}")
        print(f"  💰 Price:            ${attrs.get('price', 0)}")
        print(f"  🎟️ Registration:     {'Required' if attrs.get('registrationRequired') else 'Not Required'}")
        print(f"  🔗 Reg Link:         {attrs.get('registrationLink', 'N/A')}")
        print(f"  🏢 Organizers:       {attrs.get('organizers', 'N/A')}")
        print(f"  🏷️ Tags:            {', '.join(filter(None, tag_names)) if tag_names else 'None'}")
        print(f"  📋 Sessions:         {', '.join(session_titles) if session_titles else 'None'}")
        print(f"  🎫 Participation:    {attrs.get('participationOptions', 'N/A')}")
        print(f"  🖼️ Image URL:        {image_url if image_url else 'None'}")
        print(f"")
        print(f"  📄 Description:")
        print(f"     {attrs.get('description', 'N/A')}")
        print(f"")
        print(f"  🆔 ID:               {event.get('id')}")
        print(f"  📊 Published At:     {attrs.get('publishedAt', 'Draft')}")
        print(f"  🕐 Created:          {attrs.get('createdAt', 'N/A')}")
        print(f"{'─'*80}\n")

def main():
    print("🔄 Fetching events...")
    events = fetch_events()
    display_events(events)

if __name__ == "__main__":
    main()
