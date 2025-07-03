#!/bin/bash

# Script de despliegue para snr.red
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
echo "🚀 Deploying snr.red to $ENVIRONMENT..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    echo "🔍 Checking dependencies..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Install with: npm install -g vercel"
        exit 1
    fi
    
    print_status "Dependencies checked"
}

# Build shared types
build_types() {
    echo "🔧 Building shared types..."
    cd packages/types
    npm run build
    cd ../..
    print_status "Types built successfully"
}

# Deploy backend to Linux server with PM2
deploy_backend() {
    echo "🖥️  Preparing backend for PM2 deployment..."
    cd apps/backend
    
    echo "Building backend..."
    npm run build
    
    print_warning "Backend built successfully. Manual deployment steps:"
    echo "   1. Upload apps/backend/ to your Linux server"
    echo "   2. Install PM2: npm install -g pm2"
    echo "   3. Install dependencies: npm ci --only=production"
    echo "   4. Configure .env with production values"
    echo "   5. Start with PM2: pm2 start ecosystem.config.js"
    echo "   6. Configure Apache virtual host"
    echo "   7. Enable SSL with Let's Encrypt"
    
    cd ../..
}

# Deploy frontend to Vercel
deploy_frontend() {
    echo "🌐 Deploying frontend to Vercel..."
    cd apps/frontend
    
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod
    else
        vercel
    fi
    
    print_status "Frontend deployed to Vercel"
    cd ../..
}

# Verify deployment
verify_deployment() {
    echo "🧪 Verifying deployment..."
    
    # Check backend health
    echo "Checking backend health..."
    if curl -f https://api.snr.red/health > /dev/null 2>&1; then
        print_status "Backend is healthy"
    else
        print_error "Backend health check failed"
    fi
    
    # Check frontend
    echo "Checking frontend..."
    if curl -f https://snr.red > /dev/null 2>&1; then
        print_status "Frontend is accessible"
    else
        print_error "Frontend is not accessible"
    fi
}

# Main deployment flow
main() {
    echo "🎯 Starting deployment for snr.red"
    echo "Environment: $ENVIRONMENT"
    echo ""
    
    check_dependencies
    build_types
    
    if [ "$ENVIRONMENT" = "production" ]; then
        deploy_backend
        deploy_frontend
        verify_deployment
    else
        echo "🧪 Development deployment"
        deploy_frontend
    fi
    
    echo ""
    print_status "Deployment completed!"
    echo ""
    echo "🌐 URLs:"
    echo "   Frontend: https://snr.red"
    echo "   Backend:  https://api.snr.red"
    echo "   Health:   https://api.snr.red/health"
    echo ""
    echo "📊 Next steps:"
    echo "   1. Test URL shortening functionality"
    echo "   2. Check analytics dashboard"
    echo "   3. Monitor logs for any issues"
    echo "   4. Set up monitoring and alerts"
}

# Run main function
main
