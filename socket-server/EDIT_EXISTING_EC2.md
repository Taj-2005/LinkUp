# How to Edit Security Group for Existing EC2 Instance

## Quick Steps (2 minutes)

### Step 1: Go to EC2 Console

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Make sure you're in the correct region (where your instance is located)

### Step 2: Find Your Instance

1. Click **"Instances"** (left sidebar, under "Instances")
2. Find your instance named `linkup-socket-server` (or whatever you named it)
3. Click on the instance to select it

### Step 3: View Security Group

1. Look at the bottom panel (instance details)
2. Find the **"Security"** tab
3. You'll see **"Security groups"** listed
4. Click on the security group name (it's a clickable link)
   - Example: `sg-0abc123def456` or `linkup-socket-sg`

**OR**

1. In the instance details, scroll down to **"Security"** tab
2. You'll see your security group listed
3. Click directly on the security group ID (e.g., `sg-0abc123def456`)

### Step 4: Edit Inbound Rules

1. You're now viewing the security group details
2. Click on the **"Inbound rules"** tab
3. Click **"Edit inbound rules"** button (top right)

### Step 5: Update SSH Rule

1. Find the SSH rule in the list:
   - **Type**: SSH
   - **Protocol**: TCP
   - **Port range**: 22
   - **Source**: Currently shows your IP (e.g., `123.45.67.89/32`)

2. Click on the SSH rule row to edit it (or click the **"Edit"** button if available)

3. Change the **Source** field:
   - Click the dropdown or text field
   - Select **"Anywhere-IPv4"** 
   - OR type `0.0.0.0/0`
   - **Description**: (optional) "SSH access for GitHub Actions"

4. Click **"Save rules"** button (bottom right)

### Step 6: Verify

Your SSH rule should now show:
- **Type**: SSH
- **Protocol**: TCP
- **Port range**: 22
- **Source**: `0.0.0.0/0` (or "Anywhere-IPv4")
- **Description**: (if you added one)

---

## Visual Guide

```
EC2 Console
  └── Instances (left sidebar)
       └── [Click your instance]
            └── Bottom panel: Security tab
                 └── Security groups: [Click security group name]
                      └── Inbound rules tab
                           └── Edit inbound rules
                                └── Find SSH rule
                                     └── Change Source to 0.0.0.0/0
                                          └── Save rules
```

---

## Alternative Method: Via Security Groups Menu

1. Go to EC2 Console
2. Click **"Security Groups"** (left sidebar, under "Network & Security")
3. Find your security group (use the search box if needed)
4. Click on it
5. Go to **"Inbound rules"** tab
6. Click **"Edit inbound rules"**
7. Update SSH rule as described above

---

## Troubleshooting

### Can't find the security group?

1. Check which security group your instance is using:
   - Select your instance
   - Look at "Security" tab
   - Security groups will be listed there

### Multiple security groups?

- You can edit any of them, but make sure to allow SSH (port 22) in at least one
- If multiple security groups, you might need to check all of them

### Changes not saving?

- Make sure you clicked "Save rules" (not just close the window)
- Refresh the page to verify the change

---

## Test After Update

After updating the security group:

1. Wait a few seconds for the change to propagate
2. Go to GitHub → Actions
3. Re-run the failed workflow OR push a new commit
4. The deployment should now work!

---

## Security Note

✅ **This is safe because:**
- SSH requires your private key (stored in GitHub Secrets)
- No one can access without the key file
- Key-based authentication is secure even with open port 22

The security comes from the private key, not from IP restrictions.

