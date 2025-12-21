# How to Add GitHub Secrets

## Step-by-Step Instructions

### 1. Go to Your GitHub Repository

1. Open your repository in GitHub (e.g., `https://github.com/your-username/your-repo`)

### 2. Navigate to Settings

1. Click on the **"Settings"** tab at the top of your repository
   - It's usually the last tab in the navigation bar
   - If you don't see it, make sure you're the repository owner or have admin access

### 3. Go to Secrets

1. In the left sidebar, look for **"Secrets and variables"**
2. Click on it to expand
3. Click on **"Actions"**

   **Full path:** `Settings` → `Secrets and variables` → `Actions`

### 4. Add Each Secret

1. Click the **"New repository secret"** button (top right, green button)

2. For each secret:
   - **Name**: Enter the exact secret name (see list below)
   - **Secret**: Paste the value
   - Click **"Add secret"**

3. Repeat for all 11 secrets

---

## Complete List of Secrets to Add

Add these secrets one by one:

### Required Secrets

1. **`AWS_ACCESS_KEY_ID`**
   - Value: Your AWS Access Key ID
   - Get from: AWS IAM Console → Users → Your User → Security credentials

2. **`AWS_SECRET_ACCESS_KEY`**
   - Value: Your AWS Secret Access Key
   - Get from: Same place as above (shown only once when created)

3. **`DOCKERHUB_USERNAME`**
   - Value: Your Docker Hub username
   - Example: `myusername`

4. **`DOCKERHUB_TOKEN`**
   - Value: Docker Hub Access Token
   - Get from: Docker Hub → Account Settings → Security → New Access Token

5. **`EC2_HOST`**
   - Value: Your EC2 instance public IP or domain
   - Example: `54.123.45.67` or `socket.yourdomain.com`

6. **`EC2_USER`**
   - Value: `ubuntu`
   - (This is the default username for Ubuntu AMI)

7. **`EC2_SSH_KEY`**
   - Value: **Full content** of your `.pem` key file
   - Open your `.pem` file in a text editor
   - Copy everything including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`
   - Paste the entire content here

8. **`MONGODB_URI`**
   - Value: Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

9. **`JWT_ACCESS_SECRET`**
   - Value: Your JWT secret key (must match your main app)
   - Example: `your-super-secret-jwt-key-here`

10. **`CORS_ORIGIN`**
    - Value: Your frontend URL
    - Example: `https://your-frontend-app.com` or `http://localhost:3000` for development

### Optional Secrets

11. **`ADMIN_UI_USERNAME`**
    - Value: Username for Socket.IO Admin UI
    - Example: `admin`
    - Can leave empty if not using Socket.IO Admin UI

12. **`ADMIN_UI_PASSWORD`**
    - Value: Password for Socket.IO Admin UI
    - Example: `secure-password-123`
    - Can leave empty if not using Socket.IO Admin UI

---

## Visual Guide

```
GitHub Repository
  ├── Code
  ├── Issues
  ├── Pull requests
  ├── Actions
  └── Settings  ← Click here
       ├── General
       ├── Access
       ├── Secrets and variables  ← Click here
       │    └── Actions  ← Click here
       │         └── [New repository secret]  ← Click this button
       │              └── Name: AWS_ACCESS_KEY_ID
       │              └── Secret: [paste your value]
       │              └── [Add secret]
       └── ...
```

---

## Important Notes

### ⚠️ For EC2_SSH_KEY:

The `.pem` file content should look like this:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
(many lines of encoded key)
...
-----END RSA PRIVATE KEY-----
```

**Copy the ENTIRE content**, including the BEGIN and END lines.

### ✅ After Adding All Secrets:

1. Your secrets list should show all 11-12 secrets
2. Secrets are encrypted and **cannot be viewed** after saving (you can only update or delete)
3. Secrets are available to your GitHub Actions workflows

---

## Verify Secrets Are Added

1. Go back to: `Settings` → `Secrets and variables` → `Actions`
2. You should see all your secrets listed
3. Each secret shows only the name (values are hidden for security)

---

## Test Your Setup

After adding all secrets:

1. Make a small change in `socket-server/` directory
2. Commit and push:
   ```bash
   git add socket-server/
   git commit -m "Test deployment"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub
4. Watch the workflow run
5. If it fails, check the logs - common issues:
   - Wrong secret name (must match exactly)
   - Invalid credentials
   - EC2 not accessible

---

## Troubleshooting

**Can't see Settings tab?**
- Make sure you're the repository owner or have admin access
- Check repository permissions

**Secret not working in workflow?**
- Verify the name matches exactly (case-sensitive)
- Check if you added it to the correct repository
- Make sure the value is correct (no extra spaces)

**EC2_SSH_KEY not working?**
- Make sure you copied the ENTIRE .pem file content
- Include the BEGIN and END lines
- No extra spaces or line breaks at the start/end

