#!/bin/bash

# FireNewsDashboard Deployment Script

set -e

echo "🔥 FireNewsDashboard Deployment Script"
echo "======================================"

# Function to show usage
show_usage() {
    echo "Usage: $0 [local|prod|stop-local|stop-prod|logs-local|logs-prod]"
    echo ""
    echo "Commands:"
    echo "  local       - Start local development environment (ports 8000, 3000)"
    echo "  prod        - Start production environment (ports 9500, 3500)"
    echo "  stop-local  - Stop local environment"
    echo "  stop-prod   - Stop production environment"
    echo "  logs-local  - Show local environment logs"
    echo "  logs-prod   - Show production environment logs"
    echo "  status      - Show status of all containers"
    echo ""
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start local environment
start_local() {
    echo "🚀 Starting local development environment..."
    check_docker
    docker-compose down
    docker-compose up --build -d
    echo "✅ Local environment started!"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend:  http://localhost:8000"
    echo "🗄️  Database: localhost:33306"
}

# Function to start production environment
start_prod() {
    echo "🚀 Starting production environment..."
    check_docker
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up --build -d
    echo "✅ Production environment started!"
    echo "📱 Frontend: http://localhost:3500"
    echo "🔧 Backend:  http://localhost:9500"
    echo "🗄️  Database: localhost:33306"
}

# Function to stop local environment
stop_local() {
    echo "🛑 Stopping local environment..."
    docker-compose down
    echo "✅ Local environment stopped!"
}

# Function to stop production environment
stop_prod() {
    echo "🛑 Stopping production environment..."
    docker-compose -f docker-compose.prod.yml down
    echo "✅ Production environment stopped!"
}

# Function to show logs
show_logs() {
    local env=$1
    if [ "$env" = "local" ]; then
        echo "📋 Local environment logs:"
        docker-compose logs -f
    else
        echo "📋 Production environment logs:"
        docker-compose -f docker-compose.prod.yml logs -f
    fi
}

# Function to show status
show_status() {
    echo "📊 Container Status:"
    echo ""
    echo "Local Environment:"
    docker-compose ps
    echo ""
    echo "Production Environment:"
    docker-compose -f docker-compose.prod.yml ps
}

# Main script logic
case "$1" in
    "local")
        start_local
        ;;
    "prod")
        start_prod
        ;;
    "stop-local")
        stop_local
        ;;
    "stop-prod")
        stop_prod
        ;;
    "logs-local")
        show_logs "local"
        ;;
    "logs-prod")
        show_logs "prod"
        ;;
    "status")
        show_status
        ;;
    *)
        show_usage
        exit 1
        ;;
esac 