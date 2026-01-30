#!/bin/bash
# Seed script using curl for Strapi

API_URL="http://localhost:1337/api"

echo "🌱 Starting Strapi seed..."

# Function to POST data
post_data() {
  local endpoint=$1
  local name=$2
  local data=$3
  
  response=$(curl -s -X POST "$API_URL/$endpoint" \
    -H "Content-Type: application/json" \
    -d "{\"data\": $data}")
  
  if echo "$response" | grep -q '"id"'; then
    echo "  ✓ $name"
  else
    echo "  ✗ $name: $response"
  fi
}

# Seed Genres
echo "📦 Seeding genres..."
post_data "genres" "RPG" '{"name":"RPG","slug":"rpg"}'
post_data "genres" "Visual Novel" '{"name":"Visual Novel","slug":"visual-novel"}'
post_data "genres" "Dating Sim" '{"name":"Dating Sim","slug":"dating-sim"}'
post_data "genres" "Sandbox" '{"name":"Sandbox","slug":"sandbox"}'
post_data "genres" "Management" '{"name":"Management","slug":"management"}'

# Seed Tags
echo "📦 Seeding tags..."
post_data "tags" "Incest" '{"name":"Incest","slug":"incest","is_explicit":true}'
post_data "tags" "NTR" '{"name":"NTR","slug":"ntr","is_explicit":true}'
post_data "tags" "Corruption" '{"name":"Corruption","slug":"corruption","is_explicit":true}'
post_data "tags" "MILF" '{"name":"MILF","slug":"milf","is_explicit":true}'
post_data "tags" "Male Protagonist" '{"name":"Male Protagonist","slug":"male-protagonist","is_explicit":false}'

# Seed Engines
echo "📦 Seeding engines..."
post_data "engines" "Ren'Py" '{"name":"Ren'"'"'Py","slug":"renpy"}'
post_data "engines" "Unity" '{"name":"Unity","slug":"unity"}'
post_data "engines" "RPG Maker" '{"name":"RPG Maker","slug":"rpg-maker"}'
post_data "engines" "Unreal Engine" '{"name":"Unreal Engine","slug":"unreal-engine"}'

# Seed Platforms
echo "📦 Seeding platforms..."
post_data "platforms" "Windows" '{"name":"Windows","slug":"windows"}'
post_data "platforms" "Mac" '{"name":"Mac","slug":"mac"}'
post_data "platforms" "Linux" '{"name":"Linux","slug":"linux"}'
post_data "platforms" "Android" '{"name":"Android","slug":"android"}'

# Seed Developer
echo "📦 Seeding developer..."
dev_response=$(curl -s -X POST "$API_URL/developers" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"Notum Studio","slug":"notum-studio","patreon_link":"https://patreon.com/notumstudio","website_link":"https://notum.cz","twitter":"https://twitter.com/notumcz","discord":"https://discord.gg/notum","subscribestar":"https://subscribestar.com/notum"}}')

if echo "$dev_response" | grep -q '"id"'; then
  echo "  ✓ Notum Studio"
  dev_id=$(echo "$dev_response" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
  
  # Seed Sample Game
  echo "📦 Seeding sample game..."
  post_data "games" "Sample Game" '{"title":"Sample Game","slug":"sample-game","version":"1.0.0","status":"Ongoing","release_date":"2025-01-29","is_featured":true,"trending_score":100,"description":"This is a sample game to demonstrate the architecture.","developer":'$dev_id'}'
else
  echo "  ✗ Notum Studio: $dev_response"
fi

echo "✅ Seed completed!"
