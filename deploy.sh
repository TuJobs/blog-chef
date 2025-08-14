#!/bin/bash

# Deploy Blog Chef to VPS/Server
# Make this file executable: chmod +x deploy.sh

set -e

echo "🚀 Deploying Blog Chef..."

# Configuration
APP_NAME="blog-chef"
IMAGE_NAME="blog-chef:latest"
CONTAINER_NAME="blog-chef-app"
PORT="3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is not installed. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

print_status "Checking system requirements..."

# Create necessary directories
print_status "Creating directories..."
mkdir -p data
mkdir -p public/uploads
mkdir -p logs

# Set proper permissions
chmod 755 data
chmod 755 public/uploads
chmod 755 logs

# Pull latest code (if using Git)
if [ -d ".git" ]; then
    print_status "Pulling latest code..."
    git pull origin main
fi

# Build the Docker image
print_status "Building Docker image..."
docker build -t $IMAGE_NAME .

# Stop and remove existing container
print_status "Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Start the application with Docker Compose
print_status "Starting application..."
if [ -f "docker-compose.yml" ]; then
    docker-compose down
    docker-compose up -d
else
    # Run with Docker if no compose file
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:3000 \
        -v $(pwd)/data:/app/data \
        -v $(pwd)/public/uploads:/app/public/uploads \
        -e NODE_ENV=production \
        -e NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000} \
        -e NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-your-secret-key} \
        --restart unless-stopped \
        $IMAGE_NAME
fi

# Wait for application to start
print_status "Waiting for application to start..."
sleep 10

# Health check
print_status "Performing health check..."
if curl -f -s http://localhost:$PORT/api/health > /dev/null; then
    print_status "Application is running successfully!"
    print_status "Access your blog at: http://localhost:$PORT"
else
    print_error "Health check failed. Please check the logs:"
    echo "docker logs $CONTAINER_NAME"
    exit 1
fi

# Show running containers
print_status "Running containers:"
docker ps --filter name=$APP_NAME

# Clean up old images
print_status "Cleaning up old images..."
docker image prune -f

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Useful commands:"
echo "  View logs: docker logs -f $CONTAINER_NAME"
echo "  Stop app:  docker stop $CONTAINER_NAME"
echo "  Start app: docker start $CONTAINER_NAME"
echo "  Restart:   docker restart $CONTAINER_NAME"
echo ""
