# Environment Variables Fix Guide

## 🔍 Issues Found in Your .env.local

Based on your current `.env.local` file, I found these issues:

### 1. NEXT_PUBLIC_SUPABASE_ANON_KEY
**Current value:** `sb_publishable_SDIByFGjkYOiEN0bSs3uNw__1kuIa3z`
**Problem:** This looks like a Clerk key, not a Supabase key. Supabase anon keys are JWT tokens that start with `eyJ`.

### 2. SUPABASE_SERVICE_ROLE_KEY  
**Current value:** `yeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
**Problem:** Starts with `yeyJ` instead of `eyJ` - likely a copy-paste error (extra 'y' at the beginning).

## ✅ How to Fix

### Step 1: Get Correct Values from Supabase

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. You'll see three important values:

   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY` (should start with `eyJ`)
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY` (should start with `eyJ`)

### Step 2: Update .env.local

Replace your current values with the correct ones:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hlrhdinnybifgbrzonkf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmhkaW5ueWJpZmdicnpvbmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTMzMzMsImV4cCI6MjA4MjA4OTMzM30.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmhkaW5ueWJpZmdicnpvbmtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUxMzMzMywiZXhwIjoyMDgyMDg5MzMzfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important Notes:**
- The anon key should be LONG (hundreds of characters) and start with `eyJ`
- The service_role key should also be LONG and start with `eyJ`
- Make sure there are NO extra characters at the beginning
- Make sure there are NO line breaks in the middle of the keys

### Step 3: Restart Your Dev Server

After updating `.env.local`:
1. Stop your dev server (Ctrl+C)
2. Start it again: `npm run dev`

### Step 4: Verify

The middleware warning should disappear. If you still see it, check:
- No extra spaces around the `=` sign
- No quotes around the values (unless they contain spaces)
- File is named exactly `.env.local` (not `.env.local.txt`)

## 🔒 Security Note

- Never commit `.env.local` to git (it should be in `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security - keep it secret!
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in client-side code


