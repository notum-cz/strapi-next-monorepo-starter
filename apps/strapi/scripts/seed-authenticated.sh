#!/bin/bash
# Seed script with admin authentication

API_URL="http://localhost:1337"
ADMIN_EMAIL="admin@strapi.local"
ADMIN_PASSWORD="Admin123!"

echo "🌱 Starting Strapi seed with authentication..."

# Step 1: Login and get JWT token
echo "🔐 Authenticating..."
login_response=$(curl -s -X POST "$API_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

jwt=$(echo "$login_response" | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$jwt" ]; then
  echo "❌ Failed to authenticate"
  echo "Response: $login_response"
  exit 1
fi

echo "✓ Authenticated with JWT token"

# Function to POST data with authentication
post_data() {
  local endpoint=$1
  local name=$2
  local data=$3
  
  response=$(curl -s -X POST "$API_URL/api/$endpoint" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $jwt" \
    -d "{\"data\": $data}")
  
  if echo "$response" | grep -q '"id"'; then
    echo "  ✓ $name"
    # Extract and return the ID
    echo "$response" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*'
  else
    error=$(echo "$response" | grep -o '"message":"[^"]*' | cut -d'"' -f4 | head -1)
    echo "  ✗ $name: ${error:-Error}"
  fi
}

# Seed Genres
echo "📦 Seeding genres..."
post_data "genres" "RPG" '{"name":"RPG","slug":"rpg"}' > /dev/null
post_data "genres" "Visual Novel" '{"name":"Visual Novel","slug":"visual-novel"}' > /dev/null
post_data "genres" "Dating Sim" '{"name":"Dating Sim","slug":"dating-sim"}' > /dev/null
post_data "genres" "Sandbox" '{"name":"Sandbox","slug":"sandbox"}' > /dev/null
post_data "genres" "Management" '{"name":"Management","slug":"management"}' > /dev/null

# Seed Tags
echo "📦 Seeding tags..."
post_data "tags" "Incest" '{"name":"Incest","slug":"incest","is_explicit":true}' > /dev/null
post_data "tags" "NTR" '{"name":"NTR","slug":"ntr","is_explicit":true}' > /dev/null
post_data "tags" "Corruption" '{"name":"Corruption","slug":"corruption","is_explicit":true}' > /dev/null
post_data "tags" "MILF" '{"name":"MILF","slug":"milf","is_explicit":true}' > /dev/null
post_data "tags" "Male Protagonist" '{"name":"Male Protagonist","slug":"male-protagonist","is_explicit":false}' > /dev/null

# Seed Engines
echo "📦 Seeding engines..."
post_data "engines" "Ren'Py" '{"name":"Ren'"'"'Py","slug":"renpy"}' > /dev/null
post_data "engines" "Unity" '{"name":"Unity","slug":"unity"}' > /dev/null
post_data "engines" "RPG Maker" '{"name":"RPG Maker","slug":"rpg-maker"}' > /dev/null
post_data "engines" "Unreal Engine" '{"name":"Unreal Engine","slug":"unreal-engine"}' > /dev/null

# Seed Platforms
echo "📦 Seeding platforms..."
post_data "platforms" "Windows" '{"name":"Windows","slug":"windows"}' > /dev/null
post_data "platforms" "Mac" '{"name":"Mac","slug":"mac"}' > /dev/null
post_data "platforms" "Linux" '{"name":"Linux","slug":"linux"}' > /dev/null
post_data "platforms" "Android" '{"name":"Android","slug":"android"}' > /dev/null

# Seed Developer
echo "📦 Seeding developer..."
dev_response=$(curl -s -X POST "$API_URL/api/developers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $jwt" \
  -d '{"data":{"name":"Notum Studio","slug":"notum-studio","patreon_link":"https://patreon.com/notumstudio","website_link":"https://notum.cz","twitter":"https://twitter.com/notumcz","discord":"https://discord.gg/notum","subscribestar":"https://subscribestar.com/notum"}}')

if echo "$dev_response" | grep -q '"id"'; then
  echo "  ✓ Notum Studio"
  dev_id=$(echo "$dev_response" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
  
  # Seed Sample Game
  echo "📦 Seeding sample game..."
  post_data "games" "Sample Game" '{"title":"Sample Game","slug":"sample-game","version":"1.0.0","status":"Ongoing","release_date":"2025-01-29","is_featured":true,"trending_score":100,"description":"This is a sample game to demonstrate the architecture.","developer":'$dev_id'}' > /dev/null
else
  error=$(echo "$dev_response" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
  echo "  ✗ Notum Studio: ${error:-Error}"
fi

echo "✅ Seed completed!"
