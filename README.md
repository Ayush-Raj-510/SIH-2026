# SAT-SA — Docker / Offline Deployment

This package contains the SAT-SA React/Vite dashboard plus the FastAPI analytics backend and PostgreSQL database.

## Run with Docker

Prerequisite: Docker Desktop with the Linux/WSL2 engine running.

```powershell
docker compose build
docker compose up -d
docker compose ps
```

Open the dashboard:

http://localhost:3000

Backend health:

http://localhost:3000/api/v1/health

Direct backend:

http://localhost:8000/api/v1/health

Stop:

```powershell
docker compose down
```

## Important: first build vs. air-gapped runtime

The first `docker compose build` needs access to package registries to download Node/Python dependencies and Docker base images unless those layers/images are already cached.

After a successful build, export the images for transfer to an offline computer:

```powershell
docker save -o sat-sa-images.tar sat-sa-frontend:latest sat-sa-backend:latest postgres:16-alpine
```

On the offline computer, copy this file and `deployment/docker-compose.images.yml`, then run:

```powershell
docker load -i sat-sa-images.tar
docker compose -f deployment/docker-compose.images.yml up -d
```

Open http://localhost:3000.

## Architecture

Browser -> Nginx/React -> FastAPI -> PostgreSQL

The existing prototype also contains local TypeScript analytics, synthetic data generation, in-memory SQLite simulation, cryptographic utilities, and the Isolation Forest implementation used by the UI. The FastAPI service exposes the backend analytics endpoint included in the prototype.

No Google Fonts are loaded at runtime, so the dashboard does not require internet access after the container images have been built/transferred.

## Troubleshooting

If Docker reports `dockerDesktopLinuxEngine` or "failed to connect to the Docker API", start Docker Desktop and wait until its Linux engine is running, then retry.

If you changed source code, rebuild the images before exporting them:

```powershell
docker compose build
docker compose up -d
```


### Parallel Docker deployment

This prototype uses host ports 3001 (frontend) and 8001 (backend) and unique container names, so it can run alongside another SAT-SA deployment using ports 3000/8000.
