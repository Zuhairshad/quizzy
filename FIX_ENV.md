# Fix Environment Variables

## Issue
Your `.env.local` file might have line breaks in the middle of the environment variable values, which causes Next.js to not read them correctly.

## Solution

Make sure your `.env.local` file has each variable on a **single line** with **no line breaks**. Here's the correct format:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hlrhdinnybifgbrzonkf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmhkaW5ueWJpZmdicnpvbmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTMzMzMsImV4cCI6MjA4MjA4OTMzM30.kg3sZiK4m3Dh8PYhHvndNzbqQLfS_PSk6Mj5y43nB84
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmhkaW5ueWJpZmdicnpvbmtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUxMzMzMywiZXhwIjoyMDgyMDg5MzMzfQ.J3HbBf-WRO-2wmj64h91IZ62WshQ0BmwLgUVMevl7RY
RESEND_API_KEY=rre_XpmLFXYA_NMtakZTA1JMNDcHDQiwCjS8d
```

**Important:**
- Each variable must be on ONE line
- No line breaks in the middle of values
- No trailing spaces
- Restart dev server after fixing

## After Fixing

1. Save the file
2. Stop dev server (Ctrl+C)
3. Delete `.next` folder: `Remove-Item -Recurse -Force .next`
4. Start dev server: `npm run dev`


