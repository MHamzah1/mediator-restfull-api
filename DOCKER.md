# 🐳 Docker Setup - Mediator RESTful API

Panduan lengkap untuk menjalankan Mediator RESTful API menggunakan Docker.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

## 🚀 Quick Start

### Mode 1: Production dengan Neon.tech (Recommended)

Gunakan mode ini jika kamu sudah punya database di Neon.tech:

```bash
# 1. Copy file .env
cp .env.example .env

# 2. Edit .env dan masukkan kredensial Neon.tech kamu
nano .env  # atau gunakan editor lain

# 3. Build dan jalankan
docker-compose up -d --build

# 4. Cek logs
docker-compose logs -f api
```

### Mode 2: Development dengan Neon.tech + Hot Reload

```bash
# 1. Pastikan .env sudah terisi dengan kredensial Neon.tech

# 2. Jalankan development mode
docker-compose -f docker-compose.dev.yml up --build

# 3. API akan auto-reload ketika ada perubahan code
```

### Mode 3: Full Local (PostgreSQL + API dalam Docker)

```bash
# Jalankan dengan profile local-db
docker-compose -f docker-compose.dev.yml --profile local-db up api-local --build

# Ini akan menjalankan:
# - PostgreSQL container (port 5432)
# - API container dengan hot reload (port 3000)
# - pgAdmin untuk manage database (port 5050)
```

## 📁 File Structure

```
├── Dockerfile           # Production image (multi-stage build)
├── Dockerfile.dev       # Development image (with hot reload)
├── docker-compose.yml   # Production setup (Neon.tech)
├── docker-compose.dev.yml # Development setup
├── .dockerignore        # Files to exclude from build
├── .env.example         # Environment template
└── .env                 # Your actual config (tidak di-commit)
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` / `production` |
| `PORT` | API port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Secret key untuk JWT | `your-secret-key` |
| `JWT_EXPIRE_IN` | JWT expiration | `1d` |
| `ENABLE_SWAGGER` | Enable Swagger docs | `true` |

## 📝 Common Commands

### Build & Run

```bash
# Production
docker-compose up -d --build

# Development dengan Neon.tech
docker-compose -f docker-compose.dev.yml up --build

# Development dengan Local PostgreSQL
docker-compose -f docker-compose.dev.yml --profile local-db up api-local --build
```

### Logs & Monitoring

```bash
# Lihat logs semua container
docker-compose logs -f

# Lihat logs API saja
docker-compose logs -f api

# Cek status container
docker-compose ps
```

### Stop & Cleanup

```bash
# Stop containers
docker-compose down

# Stop dan hapus volumes (⚠️ data akan hilang)
docker-compose down -v

# Hapus semua images yang tidak terpakai
docker system prune -a
```

### Database Management

```bash
# Akses PostgreSQL CLI (local mode)
docker exec -it mediator-postgres-dev psql -U mediator -d mediator_db

# Backup database
docker exec mediator-postgres-dev pg_dump -U mediator mediator_db > backup.sql

# Restore database
docker exec -i mediator-postgres-dev psql -U mediator mediator_db < backup.sql
```

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3000 | - |
| Swagger Docs | http://localhost:3000/api/docs | - |
| pgAdmin (local mode) | http://localhost:5050 | admin@mediator.com / admin123 |

### pgAdmin Setup (untuk connect ke Neon.tech)

1. Buka http://localhost:5050
2. Login dengan kredensial di atas
3. Add New Server:
   - **General > Name**: Neon Mediator
   - **Connection > Host**: `ep-polished-firefly-ad4uv1q6-pooler.c-2.us-east-1.aws.neon.tech`
   - **Connection > Port**: `5432`
   - **Connection > Database**: `neondb`
   - **Connection > Username**: `neondb_owner`
   - **Connection > Password**: (dari .env)
   - **SSL > SSL Mode**: `Require`

## 🔍 Troubleshooting

### Container tidak bisa start

```bash
# Cek logs untuk error
docker-compose logs api

# Rebuild tanpa cache
docker-compose build --no-cache
```

### Database connection error

```bash
# Pastikan DATABASE_URL sudah benar
echo $DATABASE_URL

# Test koneksi (untuk local PostgreSQL)
docker exec mediator-postgres-dev pg_isready
```

### Port sudah digunakan

```bash
# Cek port yang digunakan
lsof -i :3000
lsof -i :5432

# Ganti port di .env atau docker-compose
PORT=3001
```

### Permission denied

```bash
# Fix permission untuk node_modules
sudo chown -R $USER:$USER .
```

## 🏗️ Production Deployment

### Build production image

```bash
docker build -t mediator-api:latest .
```

### Push ke registry

```bash
# Docker Hub
docker tag mediator-api:latest username/mediator-api:latest
docker push username/mediator-api:latest

# GitHub Container Registry
docker tag mediator-api:latest ghcr.io/username/mediator-api:latest
docker push ghcr.io/username/mediator-api:latest
```

### Deploy dengan Docker Swarm / Kubernetes

```bash
# Docker Swarm
docker stack deploy -c docker-compose.yml mediator

# Kubernetes (convert docker-compose)
kompose convert -f docker-compose.yml
kubectl apply -f .
```

## 📊 Health Check

API menyediakan health check endpoint:

```bash
# Check API health
curl http://localhost:3000

# Docker health status
docker inspect --format='{{.State.Health.Status}}' mediator-api
```

---

💡 **Tips**: Untuk development, gunakan `docker-compose -f docker-compose.dev.yml up` agar mendapatkan hot reload. Perubahan code akan langsung ter-reflect tanpa rebuild.
