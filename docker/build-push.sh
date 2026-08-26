#!/bin/bash
set -e

TARGET="${1:-full}"
VERSION="${2:-latest}"

build_push() {
    local name="$1"
    local file="$2"
    echo "Building OptiObra ${name} Docker image..."
    docker build -t "${name}:${VERSION}" -f "$file" .
    echo "Pushing to Docker Hub..."
    docker push "${name}:${VERSION}"
    echo "Done! Image available at ${name}:${VERSION}"
}

case "$TARGET" in
    full)
        build_push "srgokuto/optiobra-full" "Dockerfile"
        ;;
    backend)
        build_push "srgokuto/optiobra-backend" "docker/Dockerfile.backend"
        ;;
    all)
        build_push "srgokuto/optiobra-full" "Dockerfile"
        build_push "srgokuto/optiobra-backend" "docker/Dockerfile.backend"
        ;;
    *)
        echo "Usage: $0 {full|backend|all} [version]"
        exit 1
        ;;
esac
