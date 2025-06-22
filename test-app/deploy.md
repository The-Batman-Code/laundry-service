# Deployment Guide for Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Your code pushed to a GitHub repository

## Step-by-Step Deployment

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your repository containing the `test-app` folder

### 2. Configure Project Settings
1. **Framework Preset**: Next.js (should be auto-detected)
2. **Root Directory**: Set to `laundry_service/test-app` (if your repo contains the full project structure)
3. **Build Command**: `npm run build` (should be auto-detected)
4. **Output Directory**: `.next` (should be auto-detected)
5. **Install Command**: `npm install` (should be auto-detected)

### 3. Environment Variables
Add the following environment variable in Vercel:
- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://laundry-service-production-537a.up.railway.app`

### 4. Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at a Vercel URL (e.g., `your-app-name.vercel.app`)

### 5. Custom Domain (Optional)
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Automatic Deployments
- Every push to your main branch will trigger a new deployment
- Preview deployments are created for pull requests

## Troubleshooting
- Check the build logs in Vercel dashboard if deployment fails
- Ensure all environment variables are set correctly
- Verify that your backend API is accessible from the internet

## Testing
After deployment, test the following:
1. Homepage loads correctly
2. Registration/Login works
3. Dashboard is accessible after login
4. API calls to your Railway backend work
5. Invoice generation and viewing works 