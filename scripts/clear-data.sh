#!/bin/bash

# Weight Tracker - Clear All Data
# Removes all weight entries via the API

set -e

API_URL="http://localhost:8080/api/v1"

echo "🗑️  Clearing all weight data..."
echo ""

# Check if backend is running
if ! curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "❌ Error: Backend API is not running"
    echo "Please start the services first: ./start.sh"
    exit 1
fi

# Fetch all weights
echo "Fetching all entries..."
WEIGHTS_RESPONSE=$(curl -s "$API_URL/weights")

# Extract IDs using grep and sed (portable approach)
IDS=$(echo "$WEIGHTS_RESPONSE" | grep -o '"id":[0-9]*' | sed 's/"id"://')

# Count entries
TOTAL_COUNT=$(echo "$IDS" | grep -c . || echo "0")

if [ "$TOTAL_COUNT" = "0" ]; then
    echo "ℹ️  No entries to delete"
    exit 0
fi

echo "Found $TOTAL_COUNT entries"
echo ""

# Confirm deletion
read -p "⚠️  Delete all $TOTAL_COUNT entries? This cannot be undone! (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Deleting entries..."
DELETE_COUNT=0

for ID in $IDS; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/weights/$ID")
    
    if [ "$HTTP_CODE" = "204" ]; then
        DELETE_COUNT=$((DELETE_COUNT + 1))
        echo "✅ Deleted entry ID: $ID [$DELETE_COUNT/$TOTAL_COUNT]"
    else
        echo "❌ Failed to delete ID: $ID - HTTP $HTTP_CODE"
    fi
done

echo ""
echo "✨ Cleanup complete!"
echo "   Deleted: $DELETE_COUNT entries"
echo ""
