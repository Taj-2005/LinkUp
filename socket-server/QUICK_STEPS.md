# Quick Setup Steps - EC2 + GitHub Actions

## 🎯 Goal
Deploy socket server to AWS EC2 with automatic deployments via GitHub Actions.

## ⏱️ Time: ~30 minutes

---

## Step 1: Create EC2 Instance (5 min)

1. Go to [EC2 Console](https://console.aws.amazon.com/ec2/)
2. **Launch Instance**
   - Name: `linkup-socket-server`
   - AMI: Ubuntu 22.04 LTS
   - Type: `t3.micro` (Free tier)
   - Key pair: Create new → Download `.pem` file
   - Security group: Allow SSH (22) from My IP + Port 3001 from Anywhere
3. **Launch** → Note the **Public IP**

---

## Step 2: Setup EC2 (5 min)

```bash
# Connect to EC2
chmod 400 linkup-socket-key.pem
ssh -i linkup-socket-key.pem ubuntu@YOUR_EC2_IP

# Install Docker
sudo apt update
sudo apt install -y docker.io
sudo usermod -aG docker ubuntu
sudo systemctl enable docker

# Exit and reconnect
exit
ssh -i linkup-socket-key.pem ubuntu@YOUR_EC2_IP

# Verify Docker
docker run hello-world
```

---

## Step 3: Get AWS & Docker Hub Credentials (5 min)

### AWS Credentials:
1. [IAM Console](https://console.aws.amazon.com/iam/) → Users → Your user
2. Security credentials → Create access key → Download

### Docker Hub Token:
1. [Docker Hub](https://hub.docker.com/) → Account Settings → Security
2. New Access Token → Copy token

---

## Step 4: Add GitHub Secrets (5 min)

GitHub Repo → **Settings** → **Secrets and variables** → **Actions** → **New secret**

Add these 11 secrets:

| Name | Value |
|------|-------|
| `AWS_ACCESS_KEY_ID` | From Step 3 |
| `AWS_SECRET_ACCESS_KEY` | From Step 3 |
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub token from Step 3 |
| `EC2_HOST` | Your EC2 public IP |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | **Full content** of your `.pem` file |
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_ACCESS_SECRET` | Your JWT secret (match main app) |
| `CORS_ORIGIN` | Your frontend URL (e.g., `https://your-app.com`) |
| `ADMIN_UI_USERNAME` | `admin` (optional) |
| `ADMIN_UI_PASSWORD` | Your password (optional) |

---

## Step 5: Deploy! (5 min)

```bash
# Push code to trigger deployment
git add .
git commit -m "Setup EC2 deployment"
git push origin main
```

Go to GitHub → **Actions** tab → Watch deployment run ✅

---

## Step 6: Verify (5 min)

```bash
# Test health endpoint
curl http://YOUR_EC2_IP:3001/health

# Should return: {"status":"ok","timestamp":"..."}
```

Update your frontend:
```
NEXT_PUBLIC_SOCKET_URL=http://YOUR_EC2_IP:3001
```

---

## ✅ Done!

Every push to `main` will automatically deploy to EC2.

## 🔍 Troubleshooting

**Deployment fails?**
- Check GitHub Actions logs
- Verify all secrets are correct
- Check EC2 security group allows port 22 from GitHub IPs

**Container not running?**
```bash
ssh -i linkup-socket-key.pem ubuntu@YOUR_EC2_IP
docker logs linkup-socket
```

**Can't connect from frontend?**
- Check security group allows port 3001 from anywhere
- Verify CORS_ORIGIN matches your frontend URL

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

