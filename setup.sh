#!/bin/bash

# TrainerToe Quick Setup Script
echo "Welcome to TrainerToe Setup!"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your credentials:"
    echo "   1. Discord Bot Token"
    echo "   2. Discord Client ID"
    echo "   3. ElevenLabs API Key"
    echo "   4. ElevenLabs Voice ID"
    echo ""
    echo "Press Enter when you've updated .env..."
    read
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building TypeScript..."
npm run build

# Success
echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the bot, run:"
echo "  npm start"
echo ""
echo "Need help? Check the README or run: /health"