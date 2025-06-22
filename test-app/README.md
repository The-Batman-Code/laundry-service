# Laundry Service Frontend

A Next.js frontend application for the Laundry Service platform.

## Features

- User authentication (login/register)
- Dashboard with order management
- Schedule pickup requests
- Invoice generation and viewing
- Responsive design with Tailwind CSS

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (defaults to production Railway URL)

## Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:4000](http://localhost:4000) in your browser.

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set the environment variable:
   - `NEXT_PUBLIC_API_URL`: `https://laundry-service-production-537a.up.railway.app`
3. Deploy automatically on push to main branch

### Manual Build

```bash
npm run build
npm run start
```

## Backend

The frontend connects to the backend deployed at:
`https://laundry-service-production-537a.up.railway.app`

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- React Calendar component 