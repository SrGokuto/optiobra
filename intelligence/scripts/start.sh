#!/bin/bash
# Quick start script for OptiObra Intelligence Engine

set -e

echo "=== OptiObra Intelligence Engine ==="
echo ""

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not available"
    exit 1
fi

# Check for model file
MODEL_DIR="../models"
MODEL_FILE="$MODEL_DIR/qwen3-8b-q4_k_m.gguf"

if [ ! -f "$MODEL_FILE" ]; then
    echo "Warning: Model file not found at $MODEL_FILE"
    echo "The engine will start in MOCK mode."
    echo ""
    echo "To use a real model:"
    echo "  1. Download Qwen 3 8B GGUF Q4_K_M"
    echo "  2. Place it at: $MODEL_FILE"
    echo ""
    export USE_MOCK=true
fi

echo "Starting services..."
docker compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 5

# Health check
echo ""
echo "Running health check..."
HEALTH=$(curl -s http://localhost:8000/api/v1/health 2>/dev/null || echo '{"status":"starting"}')
echo "Health: $HEALTH"

echo ""
echo "=== Services started ==="
echo "  Intelligence Engine: http://localhost:8000"
echo "  LLM Server:         http://localhost:8080"
echo "  API Docs:           http://localhost:8000/docs"
echo ""
echo "To stop: docker compose down"
