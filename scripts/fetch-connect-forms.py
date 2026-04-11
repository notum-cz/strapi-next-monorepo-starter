import requests
from datetime import datetime

# Strapi Configuration
STRAPI_URL = "https://backend.apps.viswam.ai"
API_TOKEN = "a6e7e374b93364e9bb2fe285c15f0b08c182390676091cc11986259228957a801f0e8ff3e40913c69334af21978c422682bc0f1875837a3dab9416646e08b767fce86525236b14516f2ecc91239346af099aa8fb3bc24d6a3600cf7ac8191984506fb220fac20b0ab98b9f4d1c288aa5c3a284c63b6a11d9862abce2ad01f5b4"

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

def fetch_connect_forms():
    """Fetch all connect-form submissions from Strapi"""
    url = f"{STRAPI_URL}/api/connect-forms?populate=*&sort[0]=createdAt:desc"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code == 200:
        return response.json().get("data", [])
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
        return []

def display_forms(forms):
    """Display forms in a nice format"""
    if not forms:
        print("📭 No connect-form submissions found.")
        return
    
    print(f"\n{'='*80}")
    print(f"📋 CONNECT-FORM SUBMISSIONS ({len(forms)} total)")
    print(f"{'='*80}\n")
    
    for i, form in enumerate(forms, 1):
        attrs = form.get("attributes", {})
        doc = attrs.get("document", {})
        
        # Get file names if documents exist
        file_names = []
        if doc.get("data"):
            if isinstance(doc["data"], list):
                file_names = [f.get("name") for f in doc["data"] if f.get("name")]
            elif isinstance(doc["data"], dict):
                file_names = [doc["data"].get("name")]
        
        print(f"{'─'*80}")
        print(f"📝 Submission #{i}")
        print(f"{'─'*80}")
        print(f"  👤 Name:          {attrs.get('name', 'N/A')}")
        print(f"  📧 Email:         {attrs.get('email', 'N/A')}")
        print(f"  📞 Phone:         {attrs.get('phone', 'N/A')}")
        print(f"  🏢 Company:       {attrs.get('company', 'N/A')}")
        print(f"  📂 Category:      {attrs.get('category', 'N/A')}")
        print(f"  🔴 Priority:      {attrs.get('priority', 'N/A')}")
        print(f"  ✅ Status:        {attrs.get('status', 'N/A')}")
        print(f"  📅 Preferred Date:{attrs.get('preferredDate', 'N/A')}")
        print(f"  📜 Terms Agreed:  {'✅' if attrs.get('agreeTerms') else '❌'}")
        print(f"  🔒 Privacy Agreed:{'✅' if attrs.get('agreePrivacy') else '❌'}")
        print(f"  🎯 Interests:     {', '.join(attrs.get('interests', []))}")
        print(f"  📄 Documents:     {', '.join(file_names) if file_names else 'None'}")
        print(f"")
        print(f"  💬 Message:")
        print(f"     {attrs.get('message', 'N/A')}")
        print(f"")
        print(f"  📝 Description:")
        print(f"     {attrs.get('description', 'N/A')}")
        print(f"")
        print(f"  💭 Comments:")
        print(f"     {attrs.get('comments', 'N/A')}")
        print(f"")
        print(f"  🆔 ID:            {form.get('id')}")
        print(f"  🕐 Created:       {attrs.get('createdAt', 'N/A')}")
        print(f"{'─'*80}\n")

def main():
    print("🔄 Fetching connect-form submissions...")
    forms = fetch_connect_forms()
    display_forms(forms)

if __name__ == "__main__":
    main()
