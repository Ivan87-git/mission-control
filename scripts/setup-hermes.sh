#!/bin/bash
# Reset Mission Control and register Hermes as the real agent
# Usage: bash scripts/setup-hermes.sh [MC_URL]

MC_URL="${1:-http://localhost:3001}"

echo "=== Mission Control Setup ==="
echo "Target: $MC_URL"
echo ""

# 1. Reset all demo data
echo "Clearing demo data..."
RESET=$(curl -s -X POST "$MC_URL/api/reset" -H "x-confirm-reset: yes-delete-all")
echo "  $RESET"

# 2. Register Hermes agent
echo ""
echo "Registering Hermes agent..."
AGENT=$(curl -s -X POST "$MC_URL/api/agents" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "hermes",
    "name": "Hermes",
    "status": "active",
    "model": "claude-opus-4",
    "provider": "Anthropic",
    "avatar": "🪶"
  }')
echo "  $AGENT"

# 3. Create the Mission Control project itself
echo ""
echo "Creating Mission Control project..."
PROJECT=$(curl -s -X POST "$MC_URL/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "mission-control",
    "name": "Mission Control",
    "description": "AI agent orchestration dashboard",
    "status": "active",
    "progress": 40,
    "color": "#4f8fff"
  }')
echo "  $PROJECT"

# 4. Log setup activity
echo ""
echo "Logging initial activity..."
curl -s -X POST "$MC_URL/api/activity" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Hermes",
    "action": "initialized",
    "detail": "Mission Control setup complete — real data mode",
    "type": "system"
  }' > /dev/null

echo ""
echo "=== Setup Complete ==="
echo "Hermes registered. Dashboard at: $MC_URL"
echo ""
