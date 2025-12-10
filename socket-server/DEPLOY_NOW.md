# 🚀 Deploy Socket Server to GCP - Step by Step

Your socket server is **READY** for deployment! Follow these steps:

## ✅ Pre-Deployment Checklist

Before deploying, make sure you have:
- [x] Socket server code (✅ Ready)
- [x] Dockerfile (✅ Created)
- [ ] GCP account
- [ ] MongoDB connection string
- [ ] JWT secret (same as your main app)
- [ ] Frontend URL for CORS

---

## 📋 Step-by-Step Deployment (GCP Console)

### **STEP 1: Create/Select GCP Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Click **"NEW PROJECT"** (or select existing)
4. Enter project name: `linkup-socket-server`
5. Click **"CREATE"**
6. Wait for project creation, then select it

---

### **STEP 2: Enable Required APIs**

1. Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search and enable each of these (click "ENABLE" for each):
   - **Cloud Run API**
   - **Cloud Build API** 
   - **Container Registry API**
   - **Secret Manager API**

> ⏱️ This takes 1-2 minutes per API

---

### **STEP 3: Store Secrets in Secret Manager**

1. Go to [Secret Manager](https://console.cloud.google.com/security/secret-manager)
2. Click **"CREATE SECRET"** button

   **Secret 1: MongoDB URI**
   - **Name**: `mongodb-uri`
   - **Secret value**: Paste your MongoDB connection string
     - Example: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
   - Click **"CREATE SECRET"**

   **Secret 2: JWT Secret**
   - Click **"CREATE SECRET"** again
   - **Name**: `jwt-secret`
   - **Secret value**: Your JWT access secret (must match your main app)
   - Click **"CREATE SECRET"**

   **Secret 3: CORS Origin**
   - Click **"CREATE SECRET"** again
   - **Name**: `cors-origin`
   - **Secret value**: Your frontend URL
     - Example: `https://yourdomain.com` or `https://your-app.vercel.app`
   - Click **"CREATE SECRET"**

> ✅ You should now have 3 secrets: `mongodb-uri`, `jwt-secret`, `cors-origin`

---

### **STEP 4: Grant Cloud Run Access to Secrets**

1. Still in Secret Manager, click on **`mongodb-uri`**
2. Click **"PERMISSIONS"** tab
3. Click **"ADD PRINCIPAL"**
4. In **"New principals"**, paste:
   ```
   serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com
   ```
   > Replace `PROJECT_NUMBER` with your project number (find it in project settings)
5. Select role: **"Secret Manager Secret Accessor"**
6. Click **"SAVE"**
7. Repeat steps 1-6 for `jwt-secret` and `cors-origin`

> 💡 **Quick way**: Go to [IAM & Admin > IAM](https://console.cloud.google.com/iam-admin/iam) and add the role to the Compute Engine service account

---

### **STEP 5: Deploy to Cloud Run**

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click **"CREATE SERVICE"** button (top of page)

#### **Basic Configuration:**
- **Service name**: `linkup-socket-server`
- **Region**: Choose closest to you (e.g., `us-central1`, `us-east1`)
- **Deploy one revision from an existing container image**: Leave unchecked
- **Continuously deploy new revisions from a source repository**: ✅ **CHECK THIS**
   - Click **"SET UP WITH CLOUD BUILD"**
   - **Repository**: Connect your GitHub/GitLab (or use **"CLOUD SOURCE REPOSITORIES"**)
   - **Branch**: `main` (or your default branch)
   - **Build type**: **"Dockerfile"**
   - **Dockerfile location**: `socket-server/Dockerfile`
   - **Directory**: `socket-server`

   **OR** if you prefer to build manually first:
   - Select **"Deploy one revision from an existing container image"**
   - We'll build the image in the next step

#### **Container Settings:**
- **Container port**: `3001`
- **CPU allocation**: ✅ **"CPU is only allocated during request processing"**
- **Memory**: `512 MiB`
- **Minimum instances**: `1` (prevents cold starts)
- **Maximum instances**: `10` (adjust based on traffic)

#### **Environment Variables:**
Click **"ADD VARIABLE"** and add:
- **Name**: `PORT` → **Value**: `3001`
- **Name**: `NODE_ENV` → **Value**: `production`

#### **Secrets:**
Click **"ADD SECRET"** and add each:

1. **Secret**: `mongodb-uri`
   - **Version**: `latest`
   - **Variable name**: `MONGODB_URI`
   - Click **"ADD SECRET"**

2. **Secret**: `jwt-secret`
   - **Version**: `latest`
   - **Variable name**: `JWT_ACCESS_SECRET`
   - Click **"ADD SECRET"**

3. **Secret**: `cors-origin`
   - **Version**: `latest`
   - **Variable name**: `CORS_ORIGIN`
   - Click **"ADD SECRET"**

#### **Networking:**
- **Ingress**: **"All traffic"**
- **Authentication**: ✅ **"Allow unauthenticated invocations"** (or restrict if needed)

#### **Advanced (Optional):**
- **Timeout**: `300 seconds`
- **Concurrency**: `80`
- **CPU**: `1`

4. Click **"CREATE"** button (bottom of page)

> ⏱️ Deployment takes 3-5 minutes. Cloud Build will build your Docker image and deploy it.

---

### **STEP 6: Get Your Service URL**

1. Wait for deployment to complete (you'll see a green checkmark)
2. You'll be redirected to your service page
3. At the top, you'll see a **URL** like:
   ```
   https://linkup-socket-server-xxxxx-uc.a.run.app
   ```
4. **Copy this URL** - this is your socket server URL!

---

### **STEP 7: Test Your Deployment**

1. Open a new browser tab
2. Go to: `https://YOUR-SERVICE-URL/health`
3. You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-..."
   }
   ```

✅ If you see this, your server is running!

---

### **STEP 8: Update Your Frontend**

Update your Socket.IO client connection in your frontend code:

**Find your socket connection file** (likely `src/lib/socket-helpers.ts` or similar):

```typescript
// Replace localhost with your Cloud Run URL
const socket = io('https://linkup-socket-server-xxxxx-uc.a.run.app', {
  transports: ['websocket', 'polling'], // Important: include polling for Cloud Run
  path: '/socket.io',
  // ... your other options
});
```

**Important**: Make sure to include `'polling'` in transports array because Cloud Run has limited WebSocket support.

---

### **STEP 9: View Logs (Optional)**

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click on `linkup-socket-server`
3. Click **"LOGS"** tab
4. View real-time logs from your server

---

## 🎉 You're Done!

Your socket server is now deployed and running on GCP Cloud Run!

---

## 🔄 Updating Your Deployment

When you make changes to your socket server:

1. Push changes to your repository
2. If you set up continuous deployment, it will auto-deploy
3. Or go to Cloud Run → Click your service → **"EDIT & DEPLOY NEW REVISION"**

---

## 🐛 Troubleshooting

### Service won't start:
- Check **LOGS** tab in Cloud Run
- Verify all secrets are correctly set
- Check environment variables

### Can't connect from frontend:
- Verify `CORS_ORIGIN` secret matches your frontend URL exactly
- Check that service allows unauthenticated invocations
- Make sure frontend uses `https://` (not `http://`)

### High latency:
- Increase minimum instances to 2-3
- Increase memory to 1GiB
- Check MongoDB connection

### WebSocket issues:
- Cloud Run has limited WebSocket support
- Socket.IO will automatically fall back to HTTP long-polling
- This is normal and works fine!

---

## 💰 Cost Estimate

- **Free tier**: 2 million requests/month
- **After free tier**: ~$0.40 per million requests
- **Minimum instance**: ~$0.10/hour = ~$7/month
- **Total**: ~$10-15/month for small-medium traffic

---

## 📞 Need Help?

- Check logs in Cloud Run
- Review `GCP_DEPLOYMENT.md` for advanced options
- Check [GCP Documentation](https://cloud.google.com/run/docs)

---

**Next**: Update your frontend to use the new socket server URL!

