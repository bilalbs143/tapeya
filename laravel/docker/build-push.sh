#!/bin/bash

# Load environment variables from .env.docker file
if [ -f .env.docker ]; then
  echo "Loading environment variables from .env.docker file..."
  export $(grep -v '^#' .env.docker | xargs)
  echo "Loaded environment variables from .env.docker"
else
  echo "Warning: .env.docker file not found! Using default values."
fi

# Extract VERSION from environment or use default
if [ -z "$VERSION" ]; then
  VERSION="1.0.0"
  echo "No version specified, defaulting to: $VERSION"
fi

# Set default template if not specified
if [ -z "$NEXT_PUBLIC_TEMPLATE" ]; then
  NEXT_PUBLIC_TEMPLATE="template1"
  echo "No template specified, defaulting to: $NEXT_PUBLIC_TEMPLATE"
fi

# Set default API base URL if not specified
if [ -z "$NEXT_PUBLIC_API_BASE_URL" ]; then
  NEXT_PUBLIC_API_BASE_URL="https://prod.api.kokobet777.com/api/v1"
  echo "No API base URL specified, using default"
fi

# Set default Pusher key if not specified
if [ -z "$NEXT_PUBLIC_PUSHER_KEY" ]; then
  NEXT_PUBLIC_PUSHER_KEY="2cf18b53197fc0f8f10c"
  echo "No Pusher key specified, using default"
fi

# Set default Pusher cluster if not specified
if [ -z "$NEXT_PUBLIC_PUSHER_CLUSTER" ]; then
  NEXT_PUBLIC_PUSHER_CLUSTER="ap1"
  echo "No Pusher cluster specified, using default"
fi

# Export variables so they're available to Docker Compose
export VERSION=$VERSION
export NEXT_PUBLIC_TEMPLATE=$NEXT_PUBLIC_TEMPLATE
export NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
export NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY
export NEXT_PUBLIC_PUSHER_CLUSTER=$NEXT_PUBLIC_PUSHER_CLUSTER

echo "VERSION=$VERSION" >> $GITHUB_OUTPUT
echo "Using VERSION: $VERSION"
echo "Using NEXT_PUBLIC_TEMPLATE: $NEXT_PUBLIC_TEMPLATE"
echo "Using NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"
echo "Using NEXT_PUBLIC_PUSHER_KEY: $NEXT_PUBLIC_PUSHER_KEY"
echo "Using NEXT_PUBLIC_PUSHER_CLUSTER: $NEXT_PUBLIC_PUSHER_CLUSTER"

echo "Building Docker images with template: $NEXT_PUBLIC_TEMPLATE..."
docker-compose build

echo "Pushing Docker images..."
docker-compose push

echo "Build and push completed successfully!"
