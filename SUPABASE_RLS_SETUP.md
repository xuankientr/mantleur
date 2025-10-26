# SUPABASE RLS (Row Level Security) SETUP

## 🔒 Why Enable RLS?
- **Security**: Users can only access their own data
- **Data Protection**: Prevents unauthorized access
- **Compliance**: Meets security best practices

## 📋 Enable RLS for Tables

Go to Supabase Dashboard → Table Editor → Select table → Enable RLS

### Users Table Policies:
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Policy: Anyone can read public profiles (for viewing other users)
CREATE POLICY "Anyone can read public profiles"
ON users FOR SELECT
USING (true);
```

### Streams Table Policies:
```sql
-- Enable RLS
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read streams
CREATE POLICY "Anyone can read streams"
ON streams FOR SELECT
USING (true);

-- Policy: Streamers can create own streams
CREATE POLICY "Streamers can create own streams"
ON streams FOR INSERT
WITH CHECK (auth.uid() = "streamerId");

-- Policy: Streamers can update own streams
CREATE POLICY "Streamers can update own streams"
ON streams FOR UPDATE
USING (auth.uid() = "streamerId");
```

### Follows Table Policies:
```sql
-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage own follows
CREATE POLICY "Users can manage own follows"
ON follows FOR ALL
USING (auth.uid() = "followerId");
```

### Donations Table Policies:
```sql
-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read own donations (sent)
CREATE POLICY "Users can read own donations sent"
ON donations FOR SELECT
USING (auth.uid() = "donorId");

-- Policy: Users can read donations received
CREATE POLICY "Users can read donations received"
ON donations FOR SELECT
USING (auth.uid() = "streamerId");

-- Policy: Users can create donations
CREATE POLICY "Users can create donations"
ON donations FOR INSERT
WITH CHECK (auth.uid() = "donorId");
```

## 🧪 Test RLS Policies

### Test as User 1:
```javascript
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', 'user-1-id');

// Should return user-1's data
```

### Test as User 2:
```javascript
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', 'user-1-id');

// Should return error: permission denied (if RLS is working)
```

## ✅ Summary

**Current Setup:**
- ✅ Frontend uses ANON_KEY (correct)
- ✅ RLS should be enabled for security
- ✅ Backend uses Prisma (no Supabase key needed)

**Security Best Practices:**
1. Always enable RLS on Supabase tables
2. Use ANON_KEY in frontend only
3. Use SERVICE_ROLE_KEY in backend only (if needed)
4. Never commit SERVICE_ROLE_KEY to git
5. Test RLS policies after enabling

