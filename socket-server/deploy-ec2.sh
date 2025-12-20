#!/bin/bash

# Manual EC2 Deployment Script
# Run this script on your EC2 instance for manual deployment
# Note: GitHub Actions handles automatic deployment, this is for manual use only

set -e

# Configuration - UPDATE THESE VALUES
DOCKERHUB_USERNAME="your-dockerhub-username"
IMAGE_NAME="linkup-socket-server"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying LinkUp Socket Server to EC2 (Manual)...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Installing Docker...${NC}"
    sudo apt update
    sudo apt install -y docker.io
    sudo usermod -aG docker $USER
    echo -e "${YELLOW}⚠️  Please log out and log back in, then run this script again.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found.${NC}"
    echo -e "${YELLOW}Please create .env file with required environment variables.${NC}"
    exit 1
fi

# Stop and remove existing container if it exists
if [ "$(docker ps -aq -f name=linkup-socket)" ]; then
    echo -e "${YELLOW}🛑 Stopping existing container...${NC}"
    docker stop linkup-socket || true
    docker rm linkup-socket || true
fi

# Pull latest image from Docker Hub
echo -e "${GREEN}📥 Pulling latest Docker image...${NC}"
docker pull ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest

# Run container
echo -e "${GREEN}🚀 Starting container...${NC}"
docker run -d \
  --name linkup-socket \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file .env \
  ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest

# Wait a moment for container to start
sleep 5

# Check if container is running
if [ "$(docker ps -q -f name=linkup-socket)" ]; then
    echo -e "${GREEN}✅ Container is running!${NC}"
    echo -e "${GREEN}📊 Container status:${NC}"
    docker ps -f name=linkup-socket
    echo ""
    echo -e "${GREEN}📋 View logs with: docker logs -f linkup-socket${NC}"
    echo -e "${GREEN}🔍 Health check: curl http://localhost:3001/health${NC}"
else
    echo -e "${RED}❌ Container failed to start. Check logs with: docker logs linkup-socket${NC}"
    exit 1
fi

