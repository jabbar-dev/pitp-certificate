#!/bin/bash

echo "🚀 Setting up Exam Management System..."
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm $(npm --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi
echo "✅ Python $(python3 --version)"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found in PATH. Make sure MongoDB is installed and running."
else
    echo "✅ MongoDB found"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Python dependencies
echo "Installing Python dependencies..."
cd python-service
pip3 install -r requirements.txt
cd ..

# Create environment files
echo ""
echo "📝 Creating environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env (please update with your settings)"
else
    echo "⚠️  backend/.env already exists"
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env"
else
    echo "⚠️  .env already exists"
fi

# Create directories
echo ""
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads/csv
mkdir -p python-service/output
echo "✅ Directories created"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running (run 'mongod' in a separate terminal)"
echo "2. Update backend/.env with your MongoDB URI if needed"
echo "3. Create an admin user in MongoDB (see README.md)"
echo "4. Run the application:"
echo "   - Terminal 1: npm start (Frontend)"
echo "   - Terminal 2: cd backend && npm start (Backend)"
echo "   - Terminal 3: cd python-service && python3 app.py (Python service)"
echo ""
echo "Login at http://localhost:3000/login with:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
