# 🚀 Nihongo Hub — Digital Ocean Deployment Guide

## Architecture Overview

```
Internet
   │
   ▼
[Digital Ocean Droplet] ←── Let's Encrypt SSL (Certbot)
   │
   ├── Nginx (port 80/443) — reverse proxy
   │      ├── /api/*       → Spring Boot :8080
   │      ├── /oauth2/*    → Spring Boot :8080
   │      └── /*           → React Frontend (Nginx) :80
   │
   ├── Spring Boot container (:8080)
   └── React + Nginx container (:80)
         ↓
[Digital Ocean Managed MySQL] (port 25060)
```

---

## Prerequisites

- ✅ A domain name pointed at your Droplet IP
- ✅ Digital Ocean account
- ✅ Google OAuth app credentials
- ✅ Facebook OAuth app credentials
- ✅ Zoom Server-to-Server OAuth app (optional — auto-mocked if not set)

---

## Step 1: Create Digital Ocean Resources

### 1a. Create Droplet
```bash
# Recommended specs: $12/mo Basic Droplet
# Ubuntu 22.04 LTS, 2 vCPU, 2 GB RAM
# Region: closest to your students
```

### 1b. Create Managed MySQL Database
1. Go to **Databases → Create Database Cluster**
2. Engine: **MySQL 8**
3. Plan: **$15/mo Basic** (1GB RAM)
4. Allow your Droplet's IP in the Trusted Sources
5. Note: **Host**, **Port (25060)**, **Username (doadmin)**, **Password**

### 1c. Create a Database for the App
```sql
CREATE DATABASE nihongo_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Step 2: Prepare Your Droplet

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Install Docker + Docker Compose
apt-get update
apt-get install -y docker.io docker-compose-plugin git curl

# Enable Docker on boot
systemctl enable --now docker

# Install Certbot (Let's Encrypt)
apt-get install -y certbot
```

---

## Step 3: Clone & Configure

```bash
# Clone your repository
git clone https://github.com/your-username/nihongo-hub.git
cd nihongo-hub

# Create your .env from template
cp .env.example .env
nano .env   # Fill in all values
```

Fill in `.env`:
| Variable | Where to get it |
|---|---|
| `DB_HOST` | Digital Ocean Managed MySQL → Connection Details |
| `DB_PASSWORD` | Managed MySQL password |
| `JWT_SECRET` | `openssl rand -base64 64` |
| `GOOGLE_CLIENT_ID/SECRET` | [Google Cloud Console](https://console.cloud.google.com) |
| `FACEBOOK_CLIENT_ID/SECRET` | [Meta Developers](https://developers.facebook.com) |
| `ZOOM_*` | [Zoom Marketplace](https://marketplace.zoom.us) |

---

## Step 4: Configure Nginx Domain

```bash
# Edit nginx.conf — replace YOUR_DOMAIN.COM with your actual domain
sed -i 's/YOUR_DOMAIN.COM/yourdomain.com/g' nginx/nginx.conf
```

---

## Step 5: Get SSL Certificate

```bash
# Stop nginx if running
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Get Let's Encrypt certificate
certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --agree-tos \
  --non-interactive \
  --email your-email@gmail.com

# Auto-renew (certbot cron is set automatically)
```

---

## Step 6: Configure OAuth Redirect URIs

### Google Cloud Console
1. Go to **APIs & Services → Credentials → Your OAuth Client**
2. Authorized redirect URIs → Add:
   ```
   https://yourdomain.com/login/oauth2/code/google
   ```

### Facebook Developer Portal
1. Go to **Your App → Facebook Login → Settings**
2. Valid OAuth Redirect URIs → Add:
   ```
   https://yourdomain.com/login/oauth2/code/facebook
   ```

### Zoom Webhook (optional)
1. Go to **Zoom Marketplace → Your App → Feature → Event Subscriptions**
2. Notification URL: `https://yourdomain.com/api/webhooks/zoom`

---

## Step 7: Build & Deploy

```bash
# Build Docker images
docker compose -f docker-compose.prod.yml build

# Start all services
docker compose -f docker-compose.prod.yml --env-file .env up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View backend logs
docker logs nihongo-backend -f

# View nginx logs
docker logs nihongo-nginx -f
```

---

## Step 8: Verify Deployment

```bash
# Health check
curl https://yourdomain.com/api/auth/ping
# Expected: pong

# Database connectivity
docker exec nihongo-backend wget -qO- http://localhost:8080/actuator/health
```

1. Visit `https://yourdomain.com` → Landing page loads
2. Click **Login with Google** → OAuth flow completes
3. Login with admin: `admin@yourdomain.com` / `Admin@123!`
4. Create a session → Zoom meeting auto-generates

---

## Updates & Redeployment

```bash
# Pull latest code
git pull

# Rebuild only changed services
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d --no-deps backend

# Zero-downtime rolling update
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## Monitoring & Maintenance

```bash
# Database backups (run weekly via cron)
# Digital Ocean Managed MySQL → Backups tab (automatic daily backups included)

# Check container resource usage
docker stats

# Prune old images
docker image prune -f

# View all logs
docker compose -f docker-compose.prod.yml logs --tail=100 -f
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Backend won't start | Check DB connection — ensure Droplet IP is in MySQL Trusted Sources |
| OAuth redirect fails | Verify redirect URI in Google/Facebook matches exactly |
| 502 Bad Gateway | Backend still starting up — wait 60s and retry |
| Zoom returns mock URLs | Add real Zoom credentials to `.env` |
| Certificate error | Re-run certbot; check domain DNS points to Droplet |

---

## Local Development (No Docker)

```bash
# Backend
cd backend
# Set environment variables in application.yml or export them
mvn spring-boot:run

# Frontend (requires Node.js 18+)
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local: VITE_BACKEND_URL=http://localhost:8080
npm run dev
# Open: http://localhost:5173
```

> **Admin credentials (local):** `admin@nihongo.com` / `Admin@123!`
