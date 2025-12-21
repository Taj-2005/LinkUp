# Fix SSH Access for GitHub Actions

## Problem
GitHub Actions workflow fails with SSH connection errors because EC2 security group only allows SSH from your IP.

## Solution
Allow SSH from anywhere (0.0.0.0/0) - this is still secure because SSH uses key-based authentication.

---

## Quick Fix (2 minutes)

### Method 1: Via Your EC2 Instance (Easiest)

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **"Instances"** (left sidebar)
3. **Click on your running instance** to select it
4. Look at bottom panel → **"Security"** tab
5. Click on your **security group name** (it's a clickable link)
6. Go to **"Inbound rules"** tab
7. Click **"Edit inbound rules"**

### Method 2: Via Security Groups Menu

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **"Security Groups"** (left sidebar)
3. Find your security group (e.g., `linkup-socket-sg`)
4. Click on it to select
5. Go to **"Inbound rules"** tab
6. Click **"Edit inbound rules"**

**See [EDIT_EXISTING_EC2.md](./EDIT_EXISTING_EC2.md) for detailed step-by-step guide.**

### Step 2: Update SSH Rule

1. Find the SSH rule (Type: SSH, Port: 22)
2. Click **"Edit"** or modify the existing rule
3. Change **Source** from "My IP" to **"Anywhere-IPv4"** (0.0.0.0/0)
4. Click **"Save rules"**

### Step 3: Verify

Your SSH rule should now look like:
- **Type**: SSH
- **Protocol**: TCP
- **Port range**: 22
- **Source**: 0.0.0.0/0 (Anywhere-IPv4)
- **Description**: SSH access

---

## Why is this safe?

✅ **Key-based authentication**: Only someone with your private key (.pem file) can access
✅ **No password login**: SSH is configured to use keys only by default on Ubuntu
✅ **Your key is secret**: Stored securely in GitHub Secrets, never exposed

**Think of it like this:**
- Your house key (private key) is unique
- Anyone can try the door (port 22 is open)
- But only your key works (authentication required)

---

## Test the Fix

After updating the security group:

1. Go to GitHub → **Actions** tab
2. Find the failed workflow run
3. Click **"Re-run jobs"** → **"Re-run failed jobs"**
4. Or push a new commit to trigger a new deployment

The workflow should now successfully connect to your EC2 instance.

---

## Alternative: Restrict SSH to Specific IPs (Advanced)

If you want extra security, you can:

1. **Use GitHub's IP ranges**: 
   - GitHub publishes their IP ranges, but they change frequently
   - Requires updating security group rules regularly
   - Not recommended for automated deployments

2. **Use a bastion host**:
   - More complex setup
   - Additional cost
   - Overkill for simple deployments

3. **Use AWS Systems Manager Session Manager**:
   - Requires additional setup
   - More complex workflow
   - No additional cost

**For most use cases, allowing SSH from anywhere with key-based auth is the right balance of security and simplicity.**

