# Docker Setup Guide

This project is fully containerized and can be run using Docker.

## Quick Start with Docker Compose

The easiest way to run the application is using Docker Compose:

```bash
docker-compose up -d
```

The application will be available at `http://localhost:8999`

To stop the application:

```bash
docker-compose down
```

## Building the Docker Image

To build the Docker image manually:

```bash
docker build -t discord-lyrics-status:latest .
```

## Running with Docker

### Basic Usage

```bash
docker run -p 8999:8999 discord-lyrics-status:latest
```

### With Environment Variables

```bash
docker run -p 8999:8999 \
  -e NODE_ENV=production \
  discord-lyrics-status:latest
```

### With Volume Mount (for persistent data)

```bash
docker run -p 8999:8999 \
  -v $(pwd)/data:/app/data \
  discord-lyrics-status:latest
```

## Docker Architecture

The Dockerfile uses a **multi-stage build** approach:

1. **Builder Stage**: Compiles TypeScript code from `src/` to `dist/`
2. **Runtime Stage**: Runs the compiled application with only production dependencies

Benefits:
- Smaller final image size (no build tools included)
- Better security (non-root user)
- Alpine Linux for minimal footprint

## Environment Variables

Configure these environment variables as needed:

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | production | Node.js environment setting |

## Port Configuration

- **Default Port**: 8999 (WebSocket & REST API)

To use a different port:

```bash
docker run -p 9000:8999 discord-lyrics-status:latest
```

## Troubleshooting

### View Logs

```bash
docker-compose logs -f
```

Or with docker run:

```bash
docker logs -f container_name
```

### Rebuild Image

```bash
docker-compose build --no-cache
```

### Interactive Shell

```bash
docker run -it discord-lyrics-status:latest sh
```

## Security Notes

- The container runs as a non-root user (`nodejs`)
- Uses Alpine Linux for a minimal attack surface
- Production dependencies only in runtime stage
