#!/bin/bash

# deploy.sh - Deployment script for Metapharsic Todo on Hostinger VPS

APP_DIR="/u01/apps/metapharisc_todo"

echo "Deploying Metapharsic Todo to $APP_DIR..."

cd $APP_DIR

# Install Backend Dependencies
echo "Installing backend dependencies..."
cd backend
npm install --production
cd ..

# Install Frontend Dependencies and Build
echo "Building frontend..."
cd metapharsic-frontend
npm install
npm run build
cd ..

# Start/Restart with PM2
echo "Restarting application with PM2..."
pm2 startOrRestart ecosystem.config.js --env production

echo "Deployment complete!"
