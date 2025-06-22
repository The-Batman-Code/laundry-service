# 🧺 Laundry Service App

A full-stack laundry pickup and delivery service application built with FastAPI (backend) and Next.js (frontend).

## 🚀 Features

- **User Authentication** - Secure login/register with JWT
- **Service Booking** - Schedule laundry pickup with multiple service types
- **Real-time Pricing** - Dynamic pricing based on items and quantities
- **Payment Processing** - Multiple payment methods including cash on delivery
- **Invoice Generation** - Automatic invoice creation and management
- **Order Tracking** - Track pickup and delivery status
- **Admin Dashboard** - Comprehensive user dashboard

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Supabase** - PostgreSQL database with real-time features
- **JWT Authentication** - Secure token-based auth
- **Pydantic** - Data validation and serialization
- **Gunicorn + Uvicorn** - Production ASGI server

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern React patterns

## 📁 Project Structure

```
laundry_service/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application file
│   ├── requirements.txt    # Python dependencies
│   ├── schema.sql          # Database schema
│   ├── init_db.py         # Database initialization
│   ├── Procfile           # Railway deployment config
│   └── DEPLOYMENT.md      # Deployment guide
├── test-app/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and API client
│   │   └── types/        # TypeScript definitions
│   ├── package.json
│   └── next.config.js
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Supabase account

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd laundry_service/backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Initialize database**
   ```bash
   python init_db.py
   ```

5. **Run the server**
   ```bash
   uvicorn main:app --reload
   ```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd laundry_service/test-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

Frontend will be available at `http://localhost:3000`

## 🌐 Deployment

### Backend (Railway)
- See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for detailed instructions
- Environment variables required: `SUPABASE_URL`, `SUPABASE_KEY`, `SECRET_KEY`

### Frontend (Vercel)
- Connect your GitHub repo to Vercel
- Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
- Automatic deployments on push

## 🎯 API Endpoints

### Authentication
- `POST /token` - Login
- `POST /users` - Register
- `GET /users/me` - Get current user

### Services
- `GET /laundry-types` - Get service types
- `GET /time-slots` - Get available time slots
- `GET /payment-methods` - Get payment methods

### Orders
- `POST /pickup-requests` - Create pickup request
- `GET /pickup-requests` - Get user's orders
- `POST /payments` - Process payment
- `GET /invoices` - Get user's invoices

### Health
- `GET /health` - Health check endpoint
- `GET /` - API information

## 🧪 Service Types

- **Regular Laundry** - Wash, dry, and fold
- **Laundry Bag** - Bulk service up to 10kg
- **Shoes Cleaning** - Professional shoe cleaning
- **Blanket/Comforter** - Large item cleaning
- **Dry Cleaning** - Delicate fabric cleaning
- **Ironing Service** - Professional pressing

## 💳 Payment Methods

- Credit Card
- PayPal
- Cash on Delivery

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- SQL injection prevention

## 📱 Mobile Responsive

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Issues & Support

If you encounter any issues or have questions:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Include steps to reproduce the problem

## 🚀 Future Enhancements

- [ ] Real-time order tracking
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Admin panel for service providers
- [ ] Integration with delivery services
- [ ] Customer reviews and ratings
- [ ] Loyalty program
- [ ] Multi-language support

---

Made with ❤️ for efficient laundry management
