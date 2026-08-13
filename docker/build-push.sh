#!/bin/bash
set -e

IMAGE_NAME="srgokuto/optiobra-full"
VERSION="${1:-latest}"

echo "Building OptiObra Docker image..."
docker build -t ${IMAGE_NAME}:${VERSION} -f Dockerfile .

echo "Pushing to Docker Hub..."
docker push ${IMAGE_NAME}:${VERSION}

echo "Done! Image available at ${IMAGE_NAME}:${VERSION}"
