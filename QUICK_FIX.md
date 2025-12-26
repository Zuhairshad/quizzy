# Quick Fix for Environment Variables Issue

## The Problem
Next.js middleware is not reading environment variables from `.env.local` even though they're set correctly.

## Solutions (Try in Order)

### Solution 1: Restart Dev Server
1. **Stop** the dev server: Press `Ctrl+C` in the terminal
2. **Delete** the `.next` cache folder:
   ```powershell
   Remove-Item -Recurse -Force .next
   ```
3. **Restart** the dev server:
   ```bash
   npm run dev
   ```

### Solution 2: Verify .env.local Format
Make sure your `.env.local` file has:
- Each variable on a **single line** (no line breaks)
- No extra spaces before/after `=`
- No quotes around values (unless needed)

### Solution 3: Check File Location
Ensure `.env.local` is in the **root directory** (same folder as `package.json`), not in a subdirectory.

### Solution 4: Verify Variables Are Loaded
Visit `http://localhost:3000/test-env` after restarting to see if variables are loaded.

## Why This Happens
Next.js middleware runs at the Edge Runtime and loads environment variables at build/start time. If you change `.env.local` while the server is running, it won't pick up the changes until you restart.

## If Still Not Working
The middleware warning is **non-blocking** - your app will still work, but authentication in middleware won't function. The login/signup pages will still work because they use the client-side Supabase client which reads env vars correctly.


