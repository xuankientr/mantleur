# SUPABASE INTEGRATION GUIDE

## 📋 Overview
This guide explains how to use Supabase JS SDK for database operations instead of HTTP API calls for better connection stability with Render.

## 🎯 Why Supabase SDK?
- **Better Connection Stability**: Direct PostgreSQL connection without HTTP middleware
- **Real-time Updates**: Subscribe to database changes
- **Offline Support**: Built-in offline synchronization
- **Faster Queries**: Direct database queries
- **Better Error Handling**: Native error handling from Supabase

## 📦 Installation

```bash
cd frontend
npm install @supabase/supabase-js
```

## 🔧 Configuration

### Environment Variables
Add to `frontend/env.local`:

```env
VITE_SUPABASE_URL=https://xgbylmnkwqzsacszkpkt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Next Steps

See `frontend/src/utils/supabaseClient.js` for implementation examples.

