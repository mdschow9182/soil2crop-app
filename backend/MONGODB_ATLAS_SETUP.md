# MongoDB Atlas Setup Guide for Soil2Crop

## Current Issue
Your MongoDB connection is failing because the connection string contains placeholder credentials that need to be replaced with your actual MongoDB Atlas account information.

## Step-by-Step Solution

### Option 1: Use MongoDB Atlas (Recommended for Production)

#### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new cluster (Free M0 tier is sufficient)

#### Step 2: Configure Database User
1. In Atlas dashboard, click **Database Access** in left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create username and password (save these!)
5. Set user privileges to **Atlas admin** or **Read and write to any database**
6. Click **Add User**

#### Step 3: Whitelist Your IP Address
1. Click **Network Access** in left sidebar
2. Click **Add IP Address**
3. Choose one of these options:
   - **Allow Access from Anywhere**: Click this for development (adds `0.0.0.0/0`)
   - **Add Current IP Address**: For production security
4. Click **Confirm**

#### Step 4: Get Connection String
1. Click **Database** in left sidebar
2. Click **Connect** button on your cluster
3. Choose **Connect your application**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

#### Step 5: Update .env File
Replace the placeholder in your `.env` file:

**Current (placeholder):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soil2crop?retryWrites=true&w=majority
```

**Updated (with your credentials):**
```env
MONGODB_URI=mongodb+srv://your-actual-username:your-actual-password@cluster0.xxxxx.mongodb.net/soil2crop?retryWrites=true&w=majority
```

**Important:** Replace:
- `your-actual-username` with your Atlas username
- `your-actual-password` with your Atlas password
- `cluster0.xxxxx` with your actual cluster URL

#### Step 6: Verify Connection
Run the server:
```bash
cd backend
node server.js
```

You should see:
```
=================================
MongoDB Connected Successfully
Host: cluster0.xxxxx.mongodb.net
Database: soil2crop
Port: 27017
ReadyState: 1 (connected)
=================================
```

---

### Option 2: Use In-Memory Database (Quick Testing)

If you want to test without MongoDB setup:

1. Edit `.env` file:
   ```env
   USE_MEMORY_DB=true
   ```

2. Restart server:
   ```bash
   node server.js
   ```

You'll see:
```
=================================
⚠️  RUNNING IN MEMORY DATABASE MODE
MongoDB connection disabled
Data will be stored temporarily in RAM
=================================
```

**Note:** Data will be lost when server restarts.

---

### Option 3: Use Local MongoDB (Development)

If you have MongoDB installed locally:

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)

2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Or use mongod directly
   mongod --dbpath "C:\data\db"
   ```

3. Update `.env`:
   ```env
   USE_MEMORY_DB=false
   MONGODB_URI=mongodb://localhost:27017/soil2crop?retryWrites=true&w=majority
   ```

4. Restart server

---

## Troubleshooting

### Error: "authentication failed"
- Double-check username and password in connection string
- Ensure special characters in password are URL-encoded
- Example: `@` becomes `%40`, `#` becomes `%23`

### Error: "IP address not whitelisted"
- Go to Atlas → Network Access
- Add your current IP address or allow all IPs (development only)

### Error: "Cannot connect to cluster"
- Verify cluster is running in Atlas dashboard
- Check internet connection
- Ensure firewall allows outbound connections to MongoDB

### Error still occurs
- Check `.env` file is saved correctly
- Restart the Node.js server
- Look at detailed error message in console

---

## Security Best Practices

1. **Never commit `.env` file** to Git (it's in `.gitignore`)
2. **Use environment variables** in production
3. **Create separate database users** for dev/staging/production
4. **Restrict IP whitelist** in production
5. **Use strong passwords** for database users

---

## Quick Reference

### Current Configuration
```env
USE_MEMORY_DB=false
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soil2crop?retryWrites=true&w=majority
```

### Test Connection
```bash
curl http://localhost:5000/api/test-db
```

Expected response shows MongoDB connection status and readyState.

---

## Need Help?

1. Check MongoDB Atlas documentation: https://docs.atlas.mongodb.com/
2. Review Mongoose docs: https://mongoosejs.com/docs/connections.html
3. Inspect server logs for detailed error messages
