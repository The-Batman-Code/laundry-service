# Laundry Service Backend

This is the backend API for the Laundry Service application, built with FastAPI and Supabase.

## Setup

1. Create a `.env` file based on `.env.example` and add your Supabase credentials:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-anon-key
   SECRET_KEY=your-secret-key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up Supabase:
   - Create a new project in Supabase
   - Run the SQL commands in `schema.sql` in the Supabase SQL editor
   - Run the initialization script to populate reference data:
     ```bash
     python init_db.py
     ```

4. Run the API server:
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

### Authentication
- `POST /token` - Get access token (login)
- `POST /users` - Create a new user (register)
- `GET /users/me` - Get current user information

### Laundry Services
- `GET /laundry-types` - Get all laundry service types
- `GET /time-slots` - Get available time slots

### Pickup Requests
- `POST /pickup-requests` - Create a new pickup request
- `GET /pickup-requests` - Get all pickup requests for the current user
- `GET /pickup-requests/{pickup_id}` - Get a specific pickup request

### Payments
- `GET /payment-methods` - Get all payment methods
- `POST /payments` - Create a new payment

### Invoices
- `GET /invoices` - Get all invoices for the current user
- `GET /invoices/{invoice_id}` - Get a specific invoice

## Database Schema

The application uses the following tables in Supabase:

- `users` - User accounts
- `laundry_types` - Types of laundry services
- `pickup_requests` - Requests for laundry pickup
- `payment_methods` - Available payment methods
- `payments` - Payment records
- `invoices` - Invoices for completed payments

## Security

- JWT authentication for API endpoints
- Password hashing with bcrypt
- Row-level security in Supabase

## Project Checkpoints

### Backend
- [x] Set up FastAPI project structure
- [x] Configure Supabase integration
- [x] Implement JWT authentication
- [x] Create user registration and login endpoints
- [x] Implement laundry service type endpoints
- [x] Create pickup request endpoints
- [x] Implement payment and invoice endpoints
- [ ] Add unit tests for API endpoints
- [ ] Implement rate limiting for API endpoints

### Frontend
- [x] Set up Next.js project structure
- [x] Create authentication pages (login/register)
- [x] Implement dashboard layout
- [x] Create schedule pickup form
- [x] Add order history page
- [x] Implement profile settings page
- [x] Create invoice viewing functionality
- [x] Add clothing item lists for various laundry services
- [x] Fix total spent display on dashboard
- [x] Implement calendar date restriction for pickup requests
- [x] Fix hydration errors on home page
- [ ] Add responsive design improvements for mobile
- [ ] Implement payment integration

### Deployment
- [ ] Set up CI/CD pipeline
- [ ] Deploy backend to production server
- [ ] Deploy frontend to Vercel
- [ ] Configure custom domain
- [ ] Set up monitoring and logging

## Development Progress
- **2025-03-27**: Initial project setup and database schema creation
- **2025-03-28**: Implemented clothing item lists for various laundry services, fixed dashboard total spent, and resolved hydration errors
