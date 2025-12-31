# Local n8n Development Instance

This document describes how to run a local n8n instance for development and testing with Claude Code skills.

## Quick Start

```bash
# Start n8n (auto-creates admin account on first run)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop (keeps data)
docker-compose down

# Stop and DELETE all data (fresh start)
docker-compose down -v && rm -rf n8n-data
```

## Known Credentials

These credentials are automatically created on first start:

| Field | Value |
|-------|-------|
| **URL** | http://localhost:5678 |
| **Email** | `admin@localhost.dev` |
| **Password** | `LocalDev123!` |
| **API Key** | See `./.n8n-api-key` file |

### API Endpoints

| Endpoint | URL |
|----------|-----|
| Web UI | http://localhost:5678 |
| REST API | http://localhost:5678/api/v1 |
| Webhooks | http://localhost:5678/webhook |
| Health Check | http://localhost:5678/healthz |

## Environment Variables for Claude Skills

After starting the instance, set these environment variables for the Claude Code skills:

```bash
# Option 1: Export manually
export N8N_INSTANCE_URL=http://localhost:5678
export N8N_API_KEY=$(cat .n8n-api-key)

# Option 2: Create .env file
cat > .env << EOF
N8N_INSTANCE_URL=http://localhost:5678
N8N_API_KEY=$(cat .n8n-api-key)
EOF
```

## How It Works

1. **First Start**: When you run `docker-compose up -d` for the first time:
   - n8n container starts and initializes SQLite database
   - Init container waits for n8n to be healthy
   - Init container creates admin account with known credentials
   - Init container creates API key and saves to `./.n8n-api-key`

2. **Subsequent Starts**: The init container detects existing setup and skips account creation (idempotent).

3. **Data Persistence**:
   - n8n data stored in Docker named volume `n8n-local-data`
   - API key written to `./.n8n-api-key` file in project directory

## Fresh Start

To completely reset the instance:

```bash
# Stop containers and remove volumes
docker-compose down -v

# Remove API key file
rm -f .n8n-api-key

# Start fresh
docker-compose up -d
```

A new API key will be generated and saved to `./.n8n-api-key`.

## Troubleshooting

### API Key Not Found

If `.n8n-api-key` doesn't exist after startup:

1. Check init container logs: `docker-compose logs n8n-init`
2. Manually run init: `docker-compose run --rm n8n-init`
3. Or create API key manually in n8n UI (Settings → API)

### Init Container Keeps Restarting

The init container is configured with `restart: "no"` and should exit after setup. If it keeps appearing in `docker ps`, check logs for errors.

### Port Already in Use

If port 5678 is busy:

```bash
# Find what's using the port
netstat -ano | findstr :5678  # Windows
lsof -i :5678                  # Linux/Mac

# Or change the port in docker-compose.yml:
ports:
  - "5679:5678"  # Use 5679 instead
```

## Security Notes

⚠️ **These credentials are for LOCAL DEVELOPMENT ONLY**

- Do not use these credentials in production
- Do not commit `.n8n-api-key` file to version control
- The JWT secret is hardcoded and not secure for production use

For production deployments, see [n8n documentation](https://docs.n8n.io/hosting/).
