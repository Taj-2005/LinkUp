# EC2 Deployment Guide with GitHub Actions CI/CD

Complete guide to deploy LinkUp Socket Server to AWS EC2 with automated deployments via GitHub Actions.

## Cost
- **Free for 12 months** (AWS Free Tier: t3.micro)
- **After free tier**: ~$8-10/month

---

## Prerequisites

1. AWS Account ([Create one](https://aws.amazon.com/))
2. Docker Hub account ([Create one](https://hub.docker.com/) - free)
3. GitHub repository
4. Your MongoDB connection string
5. Your JWT secret (must match main app)

---

## Step 1: Create EC2 Instance

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **"Launch Instance"**
3. Configure:
   - **Name**: `linkup-socket-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance type**: `t3.micro` (Free tier eligible)
   - **Key pair**: 
     - Click "Create new key pair"
     - Name: `linkup-socket-key`
     - Type: RSA
     - Format: `.pem`
     - **Download and save the key file securely!**
   - **Network settings**: 
     - Click "Edit"
     - **Security group**: Create new security group
     - **Name**: `linkup-socket-sg`
     - **Allow inbound**:
       - SSH (22) from "My IP"
       - Custom TCP port 3001 from "Anywhere-IPv4" (0.0.0.0/0)
   - **Storage**: 8GB gp3 (free tier: 30GB total)
4. Click **"Launch Instance"**
5. Wait for instance to be running
6. Note your **Instance Public IP** or set up an **Elastic IP** (recommended)

---

## Step 2: Set Up EC2 Instance

### 2.1 Connect to EC2

```bash
# Make key file executable (Linux/Mac)
chmod 400 linkup-socket-key.pem

# Connect via SSH
ssh -i linkup-socket-key.pem ubuntu@YOUR_EC2_IP
```

### 2.2 Install Docker

```bash
# Update system
sudo apt update

# Install Docker
sudo apt install -y docker.io docker-compose

# Add current user to docker group
sudo usermod -aG docker ubuntu

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version

# Log out and log back in for group changes to take effect
exit
```

Reconnect via SSH:
```bash
ssh -i linkup-socket-key.pem ubuntu@YOUR_EC2_IP
```

### 2.3 Verify Docker

```bash
docker run hello-world
```

---

## Step 3: Set Up GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `DOCKERHUB_USERNAME` | Your Docker Hub username | `your-username` |
| `DOCKERHUB_TOKEN` | Docker Hub access token | Create at https://hub.docker.com/settings/security |
| `EC2_HOST` | EC2 instance IP or domain | `54.123.45.67` or `socket.yourdomain.com` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Full content of your .pem key file | Copy entire content of `linkup-socket-key.pem` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_ACCESS_SECRET` | JWT secret (must match main app) | `your-secret-key` |
| `CORS_ORIGIN` | Frontend URL | `https://your-frontend.com` |
| `ADMIN_UI_USERNAME` | Socket.IO Admin username (optional) | `admin` |
| `ADMIN_UI_PASSWORD` | Socket.IO Admin password (optional) | `secure-password` |

### How to Get AWS Credentials:

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Your username** → **Security credentials**
3. Click **"Create access key"**
4. Select **"Command Line Interface (CLI)"**
5. Download or copy the keys

### How to Get Docker Hub Token:

1. Go to [Docker Hub](https://hub.docker.com/)
2. Click your profile → **Account Settings** → **Security**
3. Click **"New Access Token"**
4. Name it: `github-actions`
5. Copy the token (you'll only see it once!)

---

## Step 4: Set Up GitHub Actions Workflow

The workflow file is already created at `.github/workflows/deploy-socket-server.yml`

Make sure it exists and is correct. The workflow will:
1. Build Docker image on code push
2. Push to Docker Hub
3. Deploy to EC2 via SSH
4. Run health check

---

## Step 5: First Deployment

### Option A: Automatic (via GitHub Actions)

1. Push your code to the `main` branch:
```bash
git add .
git commit -m "Setup EC2 deployment"
git push origin main
```

2. Go to GitHub → **Actions** tab
3. Watch the workflow run
4. Check if deployment succeeds

### Option B: Manual (First Time Only)

If you want to test manually first:

```bash
# On your local machine
cd socket-server

# Build and push Docker image
docker build -t YOUR_DOCKERHUB_USERNAME/linkup-socket-server:latest .
docker login
docker push YOUR_DOCKERHUB_USERNAME/linkup-socket-server:latest

# On EC2 (via SSH)
ssh -i linkup-socket-key.pem ubuntu@YOUR_EC2_IP

# Create .env file
cat > .env <<EOF
PORT=3001
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-frontend.com
EOF

# Pull and run container
docker pull YOUR_DOCKERHUB_USERNAME/linkup-socket-server:latest
docker run -d \
  --name linkup-socket \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file .env \
  YOUR_DOCKERHUB_USERNAME/linkup-socket-server:latest
```

---

## Step 6: Verify Deployment

1. **Check container is running:**
```bash
ssh -i linkup-socket-key.pem ubuntu@YOUR_EC2_IP
docker ps
```

2. **Check logs:**
```bash
docker logs linkup-socket
```

3. **Health check:**
```bash
curl http://YOUR_EC2_IP:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-..."}
```

4. **Update frontend** to use:
```
NEXT_PUBLIC_SOCKET_URL=http://YOUR_EC2_IP:3001
```

---

## Step 7: Set Up Domain (Optional)

### 7.1 Get Elastic IP (Recommended)

1. Go to EC2 Console → **Elastic IPs**
2. Click **"Allocate Elastic IP address"**
3. Click **"Allocate"**
4. Select the IP → **Actions** → **Associate Elastic IP address**
5. Select your instance → **Associate**

### 7.2 Point Domain to EC2

1. In your DNS provider, add A record:
   - **Name**: `socket` (or subdomain of choice)
   - **Type**: `A`
   - **Value**: Your Elastic IP
   - **TTL**: 300

2. Update `EC2_HOST` secret in GitHub to your domain
3. Update `CORS_ORIGIN` to include your socket domain

---

## Automatic Deployments

After setup, every push to `main` branch will:
1. ✅ Build Docker image
2. ✅ Push to Docker Hub
3. ✅ Deploy to EC2
4. ✅ Restart container with new image

**No manual steps needed!**

---

## Troubleshooting

### Deployment Fails in GitHub Actions

1. **Check SSH key format**: Make sure EC2_SSH_KEY secret has entire key file content
2. **Check EC2 security group**: Port 22 (SSH) must be accessible from GitHub Actions IPs
3. **Check EC2_SSH_KEY**: Ensure it's the correct key for your instance

### Container Won't Start

```bash
# SSH into EC2
ssh -i linkup-socket-key.pem ubuntu@YOUR_EC2_IP

# Check logs
docker logs linkup-socket

# Common issues:
# - MongoDB connection failed → Check MONGODB_URI
# - Port already in use → Stop existing container: docker stop linkup-socket
# - Missing env vars → Check .env file
```

### Can't Connect from Frontend

1. **Check security group**: Port 3001 must be open (0.0.0.0/0)
2. **Check CORS_ORIGIN**: Must match your frontend URL exactly
3. **Check firewall**: EC2 should allow inbound on port 3001

### Container Keeps Restarting

```bash
# Check logs
docker logs linkup-socket

# Common causes:
# - MongoDB connection issues
# - Invalid JWT_SECRET
# - Port conflicts
```

---

## Manual Commands (Useful for Debugging)

```bash
# SSH into EC2
ssh -i linkup-socket-key.pem ubuntu@YOUR_EC2_IP

# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View logs
docker logs linkup-socket
docker logs -f linkup-socket  # Follow logs

# Stop container
docker stop linkup-socket

# Start container
docker start linkup-socket

# Remove container
docker rm linkup-socket

# Pull latest image
docker pull YOUR_DOCKERHUB_USERNAME/linkup-socket-server:latest

# Restart container with new image
docker stop linkup-socket
docker rm linkup-socket
docker run -d --name linkup-socket --restart unless-stopped -p 3001:3001 --env-file .env YOUR_DOCKERHUB_USERNAME/linkup-socket-server:latest
```

---

## Security Best Practices

1. ✅ **Restrict SSH access**: Only allow your IP in security group
2. ✅ **Use Elastic IP**: Prevents IP changes
3. ✅ **Rotate secrets regularly**: Update GitHub secrets periodically
4. ✅ **Monitor logs**: Set up CloudWatch or similar
5. ✅ **Keep system updated**: Run `sudo apt update && sudo apt upgrade` regularly
6. ✅ **Use HTTPS**: Set up reverse proxy (nginx) with SSL for production

---

## Next Steps

- [ ] Set up monitoring (CloudWatch)
- [ ] Configure auto-scaling (if needed)
- [ ] Set up SSL/HTTPS (nginx + Let's Encrypt)
- [ ] Configure backups
- [ ] Set up staging environment

