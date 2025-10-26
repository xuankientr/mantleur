# RENDER ENVIRONMENT SETUP GUIDE

## 🎯 Required Environment Variables

You need to add these 2 environment variables on Render Dashboard:

### 1. DATABASE_URL (Supabase PostgreSQL)

```
DATABASE_URL=postgresql://postgres.xgbylmnkwqzsacszkpkt:KP7FsNR2FO5XAyPQ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**Where to add:**
- Render Dashboard → Your Web Service → Environment tab
- Click "Add Environment Variable"
- Key: `DATABASE_URL`
- Value: (paste the connection string above)

---

### 2. JWT_SECRET (Keep existing or update)

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Where to add:**
- Render Dashboard → Your Web Service → Environment tab
- Key: `JWT_SECRET`
- Value: (use existing or generate new secret)

---

## 📋 Step-by-Step Instructions

### Step 1: Open Render Dashboard
1. Go to https://dashboard.render.com
2. Login to your account
3. Find your backend service (e.g., "mantleur" or "mantleur-backend")

### Step 2: Navigate to Environment Tab
1. Click on your service
2. Click on "Environment" tab in the left sidebar

### Step 3: Update DATABASE_URL
1. Find existing `DATABASE_URL` variable
2. Click "Edit" button
3. Replace the value with:
```
postgresql://postgres.xgbylmnkwqzsacszkpkt:KP7FsNR2FO5XAyPQ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```
4. Click "Save Changes"

### Step 4: Verify JWT_SECRET
1. Check if `JWT_SECRET` exists
2. If not, add it with value: `your-super-secret-jwt-key-change-this-in-production`
3. Save changes

### Step 5: Manual Deploy
1. After updating environment variables
2. Go to "Manual Deploy" tab
3. Click "Deploy latest commit"
4. Wait for deployment to complete (2-3 minutes)

---

## ✅ Current Backend Status

**Backend is still using Prisma (not Supabase SDK):**
- ✅ Prisma ORM with Supabase PostgreSQL connection
- ✅ Graceful shutdown handling
- ✅ Connection retry logic
- ✅ Health checks
- ✅ Stable database connection

**Why Prisma?**
- More control over database queries
- Type-safe database operations
- Better for complex business logic
- Direct PostgreSQL connection

---

## 🔄 Migration Options (Future)

### Option 1: Keep Prisma (Recommended)
**Pros:**
- Better for backend operations
- Type safety
- More control
- Currently working

**Cons:**
- Requires deployment for database changes

### Option 2: Migrate to Supabase SDK
**Pros:**
- Real-time updates
- Edge functions support
- Simpler queries

**Cons:**
- Less control
- Need to rewrite all database calls
- More complex migration

---

## 🧪 Testing Connection

After deploying, test the connection:

### Backend Health Check:
```bash
curl https://mantleur.onrender.com/api/health
```

### Expected Response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 📝 Environment Variables Summary

### Backend (Render):
```env
DATABASE_URL=postgresql://postgres.xgbylmnkwqzsacszkpkt:KP7FsNR2FO5XAyPQ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://mantleur-frontend.vercel.app
VNP_TMN_CODE=7DZ9914S
VNP_HASH_SECRET=2R7SDKR0VZ7ERVSK6TWM51F5T0CDBRO2
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=https://mantleur.onrender.com/api/payments/return
FRONTEND_URL=https://mantleur-frontend.vercel.app
```

### Frontend (Vercel):
```env
VITE_API_URL=https://mantleur.onrender.com
VITE_SUPABASE_URL=https://xgbylmnkwqzsacszkpkt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Next Steps

1. ✅ Add DATABASE_URL to Render environment
2. ✅ Verify JWT_SECRET exists
3. ✅ Manual deploy backend
4. ✅ Test connection
5. ✅ Monitor logs for errors
