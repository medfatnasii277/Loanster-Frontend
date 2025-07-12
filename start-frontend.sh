#!/bin/bash

echo "🚀 Starting LoanApp Frontend Development Server..."
echo "================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the frontend directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Dependencies ready!"
echo ""
echo "🌟 Starting React development server..."
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔗 Backend should be running at: http://localhost:4000"
echo ""
echo "📋 Demo Accounts:"
echo "   Borrower: john.doe@example.com / SecurePassword123!"
echo "   Officer:  officer.smith@company.com / OfficerPass123!"
echo ""
echo "⏳ Starting server (this may take a moment)..."
echo "================================================="

# Start the development server
npm start
