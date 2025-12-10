# Quick Start: Deploy Socket Server via GCP Console

This is a step-by-step guide for deploying your socket server using the **GCP Console web interface**.

## Prerequisites

1. Google Cloud Account (sign up at [console.cloud.google.com](https://console.cloud.google.com))
2. A GCP project created
3. Your socket server code ready

---

## Step-by-Step: Deploy to Cloud Run via Console

### Step 1: Enable Required APIs

1. Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search and enable:
   - **Cloud Run API**
   - **Cloud Build API**
   - **Container Registry API**
   - **Secret Manager API** (for storing secrets)

### Step 2: Store Secrets in Secret Manager

1. Go to [Secret Manager](https://console.cloud.google.com/security/secret-manager)
2. Click **"CREATE SECRET"**
3. Create these secrets:
   - **Name**: `mongodb-uri`
     - **Secret value**: Your MongoDB connection string
   - **Name**: `jwt-secret`
     - **Secret value**: Your JWT access secret
   - **Name**: `cors-origin`
     - **Secret value**: Your frontend URL (e.g., `https://yourdomain.com`)

### Step 3: Build Docker Image (Option A: Using Cloud Build)

1. Go to [Cloud Build > Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **"CREATE TRIGGER"**
3. Configure:
   - **Name**: `build-socket-server`
   - **Event**: Push to a branch
   - **Source**: Connect your repository (GitHub/GitLab)
   - **Configuration**: Cloud Build configuration file
   - **Location**: `socket-server/cloudbuild.yaml`
4. Click **"CREATE"**

**OR** Build manually:

1. Go to [Cloud Build > History](https://console.cloud.google.com/cloud-build/builds)
2. Click **"CREATE BUILD"**
3. Select **"Cloud Build configuration file"**
4. Upload or connect your repository
5. Set **Configuration file location**: `socket-server/cloudbuild.yaml`
6. Click **"RUN"**

### Step 4: Deploy to Cloud Run

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click **"CREATE SERVICE"**

#### Basic Settings:
- **Service name**: `linkup-socket-server`
- **Region**: Choose closest region (e.g., `us-central1`)
- **Deploy one revision from an existing container image**: 
  - Click **"SELECT"**
  - Choose your image: `gcr.io/YOUR-PROJECT-ID/linkup-socket-server:latest`
  - Or use **"Continuously deploy new revisions from a source repository"** to deploy from code

#### Container Settings:
- **Container port**: `3001`
- **CPU allocation**: `CPU is only allocated during request processing`
- **Memory**: `512 MiB`
- **Minimum instances**: `1` (to avoid cold starts)
- **Maximum instances**: `10`

#### Environment Variables:
Click **"ADD VARIABLE"** and add:
- `PORT` = `3001`
- `NODE_ENV` = `production`

#### Secrets:
Click **"ADD SECRET"** and add:
- **Secret**: `mongodb-uri` → **Version**: `latest` → **Variable name**: `MONGODB_URI`
- **Secret**: `jwt-secret` → **Version**: `latest` → **Variable name**: `JWT_ACCESS_SECRET`
- **Secret**: `cors-origin` → **Version**: `latest` → **Variable name**: `CORS_ORIGIN`

#### Networking:
- **Ingress**: `All traffic`
- **Authentication**: `Allow unauthenticated invocations` (or restrict if needed)

#### Advanced Settings (Optional):
- **Timeout**: `300 seconds`
- **Concurrency**: `80`
- **CPU**: `1`

4. Click **"CREATE"**

### Step 5: Get Your Service URL

After deployment:
1. You'll see your service in the Cloud Run list
2. Click on `linkup-socket-server`
3. Copy the **URL** (e.g., `https://linkup-socket-server-xxxxx-uc.a.run.app`)
4. This is your socket server URL!

---

## Alternative: Deploy from Source Code (Easier)

If you haven't built a Docker image yet:

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click **"CREATE SERVICE"**
3. Under **"Deploy"**, select **"Continuously deploy new revisions from a source repository"**
4. **Connect repository** (GitHub, GitLab, etc.)
5. Select your repository and branch
6. **Build type**: `Dockerfile`
7. **Dockerfile location**: `socket-server/Dockerfile`
8. **Directory**: `socket-server`
9. Configure the rest as above (secrets, environment variables, etc.)
10. Click **"CREATE"**

Cloud Build will automatically build and deploy your service!

---

## Step 6: Update Your Frontend

Update your Socket.IO client connection:

```typescript
// Example
const socket = io('https://linkup-socket-server-xxxxx-uc.a.run.app', {
  transports: ['websocket', 'polling'],
  // ... your other options
});
```

---

## Viewing Logs

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click on `linkup-socket-server`
3. Click the **"LOGS"** tab
4. View real-time logs

---

## Updating Your Deployment

### Update Environment Variables:
1. Go to your Cloud Run service
2. Click **"EDIT & DEPLOY NEW REVISION"**
3. Update environment variables or secrets
4. Click **"DEPLOY"**

### Redeploy from Code:
1. Push changes to your repository
2. If you set up continuous deployment, it will auto-deploy
3. Or manually trigger a new build in Cloud Build

---

## Monitoring

1. Go to [Cloud Monitoring](https://console.cloud.google.com/monitoring)
2. View metrics:
   - Request count
   - Latency
   - Error rate
   - Instance count
   - Memory/CPU usage

---

## Troubleshooting

### Service won't start:
- Check logs in Cloud Run
- Verify secrets are correctly set
- Check environment variables

### Can't connect from frontend:
- Verify CORS_ORIGIN matches your frontend URL
- Check firewall rules (Cloud Run handles this automatically)
- Ensure service allows unauthenticated invocations

### High latency:
- Increase minimum instances
- Increase memory allocation
- Check MongoDB connection

---

## Cost Estimate

Cloud Run pricing (approximate):
- **Free tier**: 2 million requests/month
- **After free tier**: ~$0.40 per million requests
- **CPU/Memory**: ~$0.00002400 per vCPU-second, ~$0.00000250 per GiB-second
- **Minimum instance**: ~$0.10 per hour per instance

For a small-medium app, expect **$5-20/month**.

---

## Next Steps

1. ✅ Set up a custom domain (optional)
2. ✅ Configure auto-scaling policies
3. ✅ Set up monitoring alerts
4. ✅ Enable Cloud CDN (if needed)
5. ✅ Set up CI/CD pipeline

---

## Quick Commands Reference

If you prefer CLI, here are the equivalent commands:

```bash
# Set project
gcloud config set project YOUR-PROJECT-ID

# Deploy from source
gcloud run deploy linkup-socket-server \
  --source socket-server \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3001 \
  --memory 512Mi \
  --min-instances 1 \
  --set-secrets="MONGODB_URI=mongodb-uri:latest,JWT_ACCESS_SECRET=jwt-secret:latest,CORS_ORIGIN=cors-origin:latest"
```

---

For more details, see `GCP_DEPLOYMENT.md` in this directory.



