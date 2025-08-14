#!/bin/bash

# Quick Deploy Script for Blog Chef
# This script helps you deploy to different platforms

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}    Blog Chef Deployment Tool    ${NC}"
    echo -e "${BLUE}=================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "No package.json found. Please run this script from the project root directory."
    exit 1
fi

print_header

echo "Choose deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Docker (Local/VPS)"
echo "3) Build only"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_info "Deploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_info "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        # Check environment variables
        if [ -z "$NEXTAUTH_SECRET" ]; then
            print_warning "NEXTAUTH_SECRET not set. Make sure to configure it in Vercel dashboard."
        fi
        
        print_info "Building project..."
        npm run build
        
        print_info "Deploying to Vercel..."
        vercel --prod
        
        print_success "Deployment to Vercel completed!"
        print_info "Don't forget to configure environment variables in Vercel dashboard:"
        echo "- NEXTAUTH_URL=https://your-domain.vercel.app"
        echo "- NEXTAUTH_SECRET=your-secret-key"
        echo "- MONGODB_URI=your-mongodb-connection-string"
        ;;
        
    2)
        print_info "Building Docker image..."
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed. Please install Docker first."
            exit 1
        fi
        
        # Build Docker image
        docker build -t blog-chef:latest .
        
        print_success "Docker image built successfully!"
        print_info "To run the container:"
        echo "docker run -p 3000:3000 -e NEXTAUTH_URL=http://localhost:3000 -e NEXTAUTH_SECRET=your-secret blog-chef:latest"
        
        print_info "Or use Docker Compose:"
        echo "docker-compose up -d"
        ;;
        
    3)
        print_info "Building project only..."
        npm run build
        print_success "Build completed successfully!"
        print_info "To start production server:"
        echo "npm run start:production"
        ;;
        
    4)
        print_info "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice. Please select 1-4."
        exit 1
        ;;
esac

echo ""
print_success "Deployment process completed!"
print_info "Visit the deployment checklist for post-deployment steps:"
echo "- Check DEPLOYMENT-CHECKLIST.md"
echo "- Test all functionality"
echo "- Configure monitoring"
echo "- Setup SSL certificate (if needed)"
