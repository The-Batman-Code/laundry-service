# Backend Deployment Guide

## Railway Deployment

### 1. Environment Variables to Set in Railway Dashboard

```bash
# Environment
ENVIRONMENT=production

# Supabase Configuration (use your existing values)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 2. Deployment Steps

1. **Connect GitHub Repository**
   - Go to Railway dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository and the `laundry_service/backend` folder

2. **Set Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add all the environment variables listed above

3. **Deploy**
   - Railway will automatically detect your Python app
   - It will use the `Procfile` or `railway.json` configuration
   - Your app will be available at `https://your-app-name.up.railway.app`

### 3. Health Check

Once deployed, test your API:
- Health check: `https://your-app-name.up.railway.app/health`
- API docs: `https://your-app-name.up.railway.app/docs`
- Root endpoint: `https://your-app-name.up.railway.app/`

### 4. Important Notes

- Railway automatically sets the `PORT` environment variable
- The health check endpoint `/health` is configured for Railway monitoring
- CORS is configured to allow Vercel and Railway domains
- Make sure your Supabase project allows connections from Railway's IPs

### 5. Frontend Configuration

Once deployed, you'll get a Railway URL like:
`https://your-app-name.up.railway.app`

Use this URL in your frontend environment variables:
```bash
NEXT_PUBLIC_API_URL=https://your-app-name.up.railway.app
```

## Troubleshooting

### Common Issues:

1. **Database Connection Issues**
   - Check your Supabase URL and key are correct
   - Ensure Supabase project is not paused
   - Verify RLS policies are disabled (as per your init_db.py)

2. **CORS Issues**
   - Make sure your frontend domain is added to CORS origins
   - Check the regex pattern for Vercel domains

3. **Environment Variables**
   - Double-check all required environment variables are set
   - Ensure SECRET_KEY is at least 32 characters long

### Logs:
- Check Railway logs in the dashboard
- Use the health endpoint to verify service status
- Check Supabase logs for database issues 