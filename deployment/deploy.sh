#!/bin/bash

# Metapharsic Todo - Deployment Script
# Run this on your VPS to pull changes, build, and restart the app

echo "🚀 Starting deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# 2. Backend Setup
echo "⚙️ Setting up backend..."
cd backend
npm install --production
# Run migrations if any (optional, uncomment if migrate.js is ready)
# node migrate.js
cd ..

# 3. Frontend Setup
echo "🏗️ Building frontend..."
cd metapharsic-frontend
npm install
npm run build
cd ..

# 4. Restart Process with PM2
echo "🔄 Restarting application with PM2..."
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js

# 5. Save PM2 state
pm2 save

echo "✅ Deployment complete!"
