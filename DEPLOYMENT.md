# Deployment Guide

## Environment Variables

Add the following to Vercel environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend (for email)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_from_email
```

## Database Setup

1. Create a new Supabase project
2. Run the following SQL scripts in Supabase SQL Editor:
   - `/supabase/schema.sql` (existing quiz tables)
   - `/supabase/analytics-and-leaderboard-schema.sql` (new analytics & leaderboard tables)

3. Verify tables exist:
   - `quiz_analytics`
   - `question_analytics`
   - `leaderboard`

## Vercel Deployment

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd quiz-app
vercel

# Add environment variables when prompted
# Or add them in Vercel dashboard

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `https://github.com/Zuhairshad/quizzy.git`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `quiz-app`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. Add Environment Variables (Settings → Environment Variables)
6. Click "Deploy"

## Post-Deployment

1. **Test all features:**
   - Complete a quiz
   - Check analytics dashboard (`/analytics`)
   - View leaderboard (`/leaderboard`)

2. **Monitor:**
   - Check Vercel logs for errors
   - Check Supabase logs for database issues

3. **Custom Domain (optional):**
   - Go to Vercel project settings
   - Add custom domain
   - Update DNS records

## Troubleshooting

**Build Errors:**
- Ensure all dependencies are in `package.json`
- Run `npm install` locally first
- Check Next.js version compatibility

**Database Errors:**
- Verify Supabase environment variables
- Check database connection in Supabase dashboard
- Ensure tables are created correctly

**Analytics Not Working:**
- Check browser console for API errors
- Verify `/api/analytics` route is accessible
- Check Supabase table permissions

## Performance Optimization

- Enable Vercel Analytics
- Use Vercel Image Optimization
- Monitor Core Web Vitals
- Set up caching for quiz data if needed
