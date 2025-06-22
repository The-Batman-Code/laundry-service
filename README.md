# 🧺 Laundry Service Platform

A full-stack laundry service platform built with FastAPI (backend) and Next.js (frontend), deployed on Railway and Vercel respectively.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │    Database     │
│   (Next.js)     │───▶│    (FastAPI)     │───▶│   (Supabase)    │
│   Vercel        │    │    Railway       │    │   PostgreSQL    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Tech Stack

**Frontend:**
- Next.js 14 with TypeScript
- React 18
- Tailwind CSS
- React Calendar component
- Deployed on Vercel

**Backend:**
- FastAPI with Python 3.11+
- JWT Authentication
- Supabase PostgreSQL database
- Pydantic for data validation
- Deployed on Railway

**Database:**
- Supabase PostgreSQL
- Row Level Security (RLS)
- UUID primary keys
- JSONB for flexible data

## 🚀 Live Deployment

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://laundry-service-production-537a.up.railway.app`
- **API Documentation**: `https://laundry-service-production-537a.up.railway.app/docs`

## 📋 Features

### User Management
- User registration and authentication
- JWT token-based security
- Profile management

### Laundry Services
- Multiple service types (Regular, Bag, Shoes, Blanket, Dry Cleaning, Ironing)
- Dynamic pricing
- Service customization

### Booking System
- Schedule pickup requests
- Time slot selection
- Address management
- Special instructions

### Payment Processing
- Multiple payment methods
- Payment tracking
- Invoice generation

### Dashboard
- Order history
- Real-time status updates
- Invoice downloads

## 🛠️ Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn
- Git
- Supabase account

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd laundry_service/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   Create `.env` file in the backend directory:
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-anon-key

   # JWT Configuration
   SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters-long
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # Environment
   ENVIRONMENT=development

   # Optional
   FRONTEND_URL=http://localhost:4000
   ```

5. **Database setup**
   ```bash
   # Run the database schema
   python init_db.py
   
   # Or manually execute schema.sql in your Supabase SQL editor
   ```

6. **Start the backend server**
   ```bash
   # Development
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # Production
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

   Backend will be available at: `http://localhost:8000`
   API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd laundry_service/test-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:4000`

## 🚀 Production Deployment

### Backend Deployment (Railway)

1. **Prepare for deployment**
   - Ensure all code is committed to GitHub
   - Review `backend/requirements.txt` for dependencies
   - Check `backend/Procfile` for startup command

2. **Deploy to Railway**
   ```bash
   # Connect to Railway (one-time setup)
   railway login
   railway link
   
   # Deploy
   railway up
   ```

3. **Environment variables in Railway**
   Set these in Railway dashboard (`Settings > Environment Variables`):
   ```env
   ENVIRONMENT=production
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters-long
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

4. **Database initialization**
   - Railway will automatically run database initialization on first startup
   - Monitor logs to ensure successful initialization

### Frontend Deployment (Vercel)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `test-app`

2. **Configure build settings**
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "outputDirectory": ".next"
   }
   ```

3. **Environment variables in Vercel**
   ```env
   NEXT_PUBLIC_API_URL=https://laundry-service-production-537a.up.railway.app
   ```

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Preview deployments are created for pull requests

## 🗃️ Database Schema

### Core Tables

- **users**: User accounts and authentication
- **laundry_types**: Service types and pricing
- **pickup_requests**: Customer pickup requests
- **payment_methods**: Available payment options
- **payments**: Payment transactions
- **invoices**: Generated invoices

### Key Features

- **Row Level Security (RLS)**: Users can only access their own data
- **JSONB columns**: Flexible address and service item storage
- **UUID primary keys**: Scalable and secure identifiers
- **Automatic timestamps**: Created/updated tracking

## 🔧 API Endpoints

### Authentication
- `POST /token` - Login
- `POST /users` - Register
- `GET /users/me` - Get current user

### Services
- `GET /laundry-types` - Get service types
- `GET /time-slots` - Get available time slots

### Orders
- `POST /pickup-requests` - Create pickup request
- `GET /pickup-requests` - Get user's pickup requests
- `GET /pickup-requests/{id}` - Get specific pickup request

### Payments
- `GET /payment-methods` - Get payment methods
- `POST /payments` - Create payment
- `GET /payments/{id}` - Get payment details

### Invoices
- `GET /invoices` - Get user's invoices
- `GET /invoices/{id}` - Get specific invoice
- `GET /invoices/payment/{payment_id}` - Get invoice by payment

### System
- `GET /health` - Health check
- `GET /` - API info

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Row Level Security (RLS) in database
- CORS configuration for production
- Environment variable validation
- Input validation with Pydantic

## 🐛 Troubleshooting

### Common Issues

**Backend Issues:**
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check logs
railway logs  # For Railway deployment
uvicorn main:app --reload --log-level debug  # Local development
```

**Frontend Issues:**
```bash
# Check if frontend can reach backend
curl $NEXT_PUBLIC_API_URL/health

# Clear Next.js cache
rm -rf .next && npm run dev
```

**Database Issues:**
```bash
# Test database connection
python test_supabase.py

# Re-run database initialization
python init_db.py
```

### Environment Variables

**Backend (.env)**
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SECRET_KEY` (minimum 32 characters)
- `ALGORITHM=HS256`
- `ENVIRONMENT=development|production`

**Frontend (.env.local)**
- `NEXT_PUBLIC_API_URL`

## 📱 Testing

### Manual Testing

Test the following functionality:
- User registration and login
- Dashboard loading after authentication
- Service types displaying correctly
- Time slot availability
- Pickup request creation
- Payment processing
- Invoice generation
- Order history viewing

### API Testing

```bash
# Health check
curl https://laundry-service-production-537a.up.railway.app/health

# Get laundry types
curl https://laundry-service-production-537a.up.railway.app/laundry-types

# Login (replace with actual credentials)
curl -X POST "https://laundry-service-production-537a.up.railway.app/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review application logs
3. Check environment variable configuration
4. Verify database connectivity

---

**Happy laundering! 🧺✨** 