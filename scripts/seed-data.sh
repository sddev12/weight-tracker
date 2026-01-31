#!/bin/bash

# Weight Tracker - Seed Test Data
# Adds 50 random weight entries via the API

set -e

API_URL="http://localhost:8080/api/v1"
ENTRIES=50

echo "🌱 Seeding test data..."
echo ""

# Check if backend is running
if ! curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "❌ Error: Backend API is not running"
    echo "Please start the services first: ./start.sh"
    exit 1
fi

echo "Adding $ENTRIES weight entries..."
echo ""

# Starting weight around 170 pounds (12 stone 2 lbs)
# Will vary between 165-175 pounds with gradual trend
BASE_WEIGHT=170
SUCCESS_COUNT=0
SKIP_COUNT=0

for i in $(seq 1 $ENTRIES); do
    # Calculate date (going back from today)
    DAYS_AGO=$((ENTRIES - i))
    DATE=$(date -d "$DAYS_AGO days ago" +%Y-%m-%d)
    
    # Generate weight with slight random variation (-5 to +5 pounds)
    # and slight downward trend over time (-0.05 pounds per day)
    RANDOM_VARIATION=$((RANDOM % 11 - 5))
    TREND_ADJUSTMENT=$(echo "scale=2; -0.05 * $DAYS_AGO" | bc)
    WEIGHT=$(echo "scale=1; $BASE_WEIGHT + $RANDOM_VARIATION + $TREND_ADJUSTMENT" | bc)
    
    # Ensure weight is positive
    if (( $(echo "$WEIGHT < 100" | bc -l) )); then
        WEIGHT=100
    fi
    
    # POST to API
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/weights" \
        -H "Content-Type: application/json" \
        -d "{\"date\":\"$DATE\",\"pounds\":$WEIGHT}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "201" ]; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo "✅ [$i/$ENTRIES] Added entry: $DATE - $WEIGHT lbs"
    elif [ "$HTTP_CODE" = "409" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        echo "⏭️  [$i/$ENTRIES] Skipped (already exists): $DATE"
    else
        echo "❌ [$i/$ENTRIES] Failed: $DATE - HTTP $HTTP_CODE"
    fi
done

echo ""
echo "✨ Seeding complete!"
echo "   Added: $SUCCESS_COUNT entries"
echo "   Skipped: $SKIP_COUNT entries (already existed)"
echo ""
echo "View at: http://localhost:3000"
