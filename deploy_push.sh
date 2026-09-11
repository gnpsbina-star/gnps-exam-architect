#!/bin/bash
# One-click helper script to push changes and trigger automatic online deployment

cd "$(dirname "$0")"

COMMIT_MSG="${1:-Update application changes}"

echo "================================================="
echo "  Deploying updates to online website..."
echo "  Commit Message: $COMMIT_MSG"
echo "================================================="

git add .
git commit -m "$COMMIT_MSG"
git push origin main

echo ""
echo "✅ Changes pushed to GitHub successfully!"
echo "🚀 Cloud hosting (Render / Railway) will automatically deploy the update within 1 minute."
echo "================================================="
