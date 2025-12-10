# Deploying Socket Server to Google Cloud Platform

This guide covers deploying your Socket.IO server to GCP using **Cloud Run** (recommended for simplicity) or **Compute Engine** (better for WebSocket support).

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud SDK (gcloud)**: Install from [cloud.google.com/sdk](https://cloud.google.com/sdk)
3. **Docker**: Install Docker Desktop or Docker Engine
4. **GCP Project**: Create a new project in the [GCP Console](https://console.cloud.google.com)

## Option 1: Deploy to Cloud Run (Recommended for Start)

Cloud Run is serverless and automatically scales, but has some limitations with WebSocket connections. Socket.IO will fall back to HTTP long-polling.

### Step 1: Enable Required APIs

```bash
# Set your project ID
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 2: Set Up Secrets (Recommended)

Store sensitive environment variables as secrets:

```bash
# Create secrets
echo -n "your-mongodb-connection-string" | gcloud secrets create mongodb-uri --data-file=-
echo -n "your-jwt-access-secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "https://your-frontend-domain.com" | gcloud secrets create cors-origin --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding mongodb-uri \
    --member="serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding jwt-secret \
    --member="serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding cors-origin \
    --member="serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### Step 3: Build and Deploy

**Method A: Using gcloud CLI (Quick)**

```bash
cd socket-server

# Build and deploy in one command
gcloud run deploy linkup-socket-server \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3001 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --set-secrets="MONGODB_URI=mongodb-uri:latest,JWT_ACCESS_SECRET=jwt-secret:latest,CORS_ORIGIN=cors-origin:latest" \
  --set-env-vars="PORT=3001,NODE_ENV=production"
```

**Method B: Using Docker (More Control)**

```bash
cd socket-server

# Build the Docker image
docker build -t gcr.io/$PROJECT_ID/linkup-socket-server:latest .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/linkup-socket-server:latest

# Deploy to Cloud Run
gcloud run deploy linkup-socket-server \
  --image gcr.io/$PROJECT_ID/linkup-socket-server:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3001 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --set-secrets="MONGODB_URI=mongodb-uri:latest,JWT_ACCESS_SECRET=jwt-secret:latest,CORS_ORIGIN=cors-origin:latest" \
  --set-env-vars="PORT=3001,NODE_ENV=production"
```

### Step 4: Get Your Service URL

After deployment, you'll get a URL like:
```
https://linkup-socket-server-xxxxx-uc.a.run.app
```

Update your frontend to use this URL for Socket.IO connections.

### Step 5: Update CORS Origin

Make sure your `CORS_ORIGIN` secret matches your frontend domain.

---

## Option 2: Deploy to Compute Engine (Better for WebSocket)

Compute Engine provides full WebSocket support and more control.

### Step 1: Create a VM Instance

```bash
# Create VM instance
gcloud compute instances create linkup-socket-server \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=cos-stable \
  --image-project=cos-cloud \
  --boot-disk-size=20GB \
  --tags=http-server,https-server
```

### Step 2: Set Up Firewall Rules

```bash
# Allow HTTP traffic
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server

# Allow your socket server port
gcloud compute firewall-rules create allow-socket-server \
  --allow tcp:3001 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server
```

### Step 3: Deploy Using Container-Optimized OS

SSH into the VM and set up Docker:

```bash
# SSH into the VM
gcloud compute ssh linkup-socket-server --zone=us-central1-a

# On the VM, create a startup script
sudo tee /etc/systemd/system/socket-server.service > /dev/null <<EOF
[Unit]
Description=LinkUp Socket Server
After=docker.service
Requires=docker.service

[Service]
Type=simple
Restart=always
ExecStart=/usr/bin/docker run --rm \
  --name linkup-socket-server \
  -p 3001:3001 \
  -e PORT=3001 \
  -e MONGODB_URI=your-mongodb-uri \
  -e JWT_ACCESS_SECRET=your-jwt-secret \
  -e CORS_ORIGIN=your-frontend-url \
  -e NODE_ENV=production \
  gcr.io/your-project-id/linkup-socket-server:latest

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable socket-server.service
sudo systemctl start socket-server.service
```

### Step 4: Set Up Load Balancer (Optional, for Production)

For production, set up a load balancer:

```bash
# Create a static IP
gcloud compute addresses create socket-server-ip --global

# Create a backend service
gcloud compute backend-services create socket-server-backend \
  --global \
  --protocol HTTP

# Add instance group to backend
gcloud compute backend-services add-backend socket-server-backend \
  --global \
  --instance-group=your-instance-group \
  --instance-group-zone=us-central1-a
```

---

## Option 3: Using Cloud Build (CI/CD)

For automated deployments, use Cloud Build:

### Step 1: Enable Cloud Build API

```bash
gcloud services enable cloudbuild.googleapis.com
```

### Step 2: Set Up Cloud Build Trigger

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Create Trigger"
3. Connect your repository (GitHub, GitLab, etc.)
4. Set configuration file to `socket-server/cloudbuild.yaml`
5. Save and test

### Step 3: Manual Build

```bash
cd socket-server
gcloud builds submit --config cloudbuild.yaml
```

---

## Environment Variables

Make sure to set these environment variables:

- `PORT`: Server port (default: 3001)
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_ACCESS_SECRET`: JWT secret (must match your main app)
- `CORS_ORIGIN`: Your frontend URL (e.g., `https://yourdomain.com`)
- `NODE_ENV`: Set to `production`
- `ADMIN_UI_USERNAME`: (Optional) Socket.IO Admin UI username
- `ADMIN_UI_PASSWORD`: (Optional) Socket.IO Admin UI password

---

## Updating Your Frontend

After deployment, update your frontend Socket.IO connection:

```typescript
// Example: src/lib/socket-helpers.ts
const socket = io('https://linkup-socket-server-xxxxx-uc.a.run.app', {
  transports: ['websocket', 'polling'], // Cloud Run may need polling fallback
  // ... other options
});
```

---

## Monitoring and Logs

### View Logs

```bash
# Cloud Run logs
gcloud run services logs read linkup-socket-server --region us-central1

# Compute Engine logs
gcloud compute instances get-serial-port-output linkup-socket-server --zone us-central1-a
```

### Set Up Monitoring

1. Go to [Cloud Monitoring](https://console.cloud.google.com/monitoring)
2. Create alerts for:
   - High error rates
   - High latency
   - Instance crashes
   - Memory/CPU usage

---

## Troubleshooting

### Cloud Run Issues

1. **WebSocket not working**: Cloud Run has limited WebSocket support. Socket.IO will automatically fall back to HTTP long-polling.

2. **Cold starts**: Set `--min-instances 1` to keep at least one instance warm.

3. **Timeout**: Increase timeout with `--timeout 300` (max 3600s).

### Compute Engine Issues

1. **Can't connect**: Check firewall rules and security groups.

2. **Service not starting**: Check logs with `journalctl -u socket-server.service -f`

3. **Port conflicts**: Make sure port 3001 is not used by another service.

---

## Cost Optimization

- **Cloud Run**: Pay per request, good for low-medium traffic
- **Compute Engine**: Fixed cost, better for high traffic
- Use Cloud Run for development, Compute Engine for production

---

## Security Best Practices

1. ✅ Use Secret Manager for sensitive data
2. ✅ Enable HTTPS (automatic with Cloud Run)
3. ✅ Set up VPC for Compute Engine
4. ✅ Use IAM roles with least privilege
5. ✅ Enable Cloud Armor for DDoS protection
6. ✅ Regularly update dependencies

---

## Next Steps

1. Set up a custom domain (optional)
2. Configure auto-scaling
3. Set up monitoring and alerts
4. Configure backup and disaster recovery
5. Set up CI/CD pipeline

For more details, visit the [GCP Documentation](https://cloud.google.com/docs).



