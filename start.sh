#!/bin/sh

echo "--- Starting VocalCred Production Server ---"

# 1. Try to push the database schema
# We use the local prisma binary if possible
echo "Enabling database schema..."
if [ -f "./node_modules/.bin/prisma" ]; then
  ./node_modules/.bin/prisma db push --accept-data-loss
else
  npx prisma db push --accept-data-loss
fi

echo "--- Starting Next.js Standalone Server on Port $PORT ---"
# 2. Start the application
# Standalone mode requires server.js
node server.js
