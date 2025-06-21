# Laundry Service Application

A full-stack web application for a laundry service business that allows users to create accounts, schedule pickups, select laundry types, make payments, and receive invoices.

## Tech Stack

### Frontend
- **Next.js**: React framework for building the user interface
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For styling

### Backend
- **FastAPI**: Python-based API framework
- **Supabase**: Database and authentication
- **JWT**: For secure authentication
- **SQLite**: For local development database

## Features

1. **User Authentication**
   - User registration
   - User login
   - Profile management
   - JWT-based authentication

2. **Laundry Service**
   - Schedule pickup with address input
   - Select pickup time slots
   - Choose laundry type (regular, bag, shoes, blanket, dry cleaning)
   - Special instructions

3. **Payment Processing**
   - Multiple payment methods (credit card, PayPal, cash)
   - Order summary
   - Invoice generation

4. **Order Management**
   - View order history
   - Track current orders
   - Estimated delivery times

## Project Structure

```
laundry_service/
├── frontend/             # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   ├── components/   # Reusable UI components
│   │   ├── lib/          # Utility functions and hooks
│   │   └── styles/       # Global styles
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
│
├── backend/              # FastAPI backend
│   ├── main.py           # Main FastAPI application
│   ├── init_db.py        # Database initialization script
│   ├── schema.sql        # Database schema for Supabase
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Environment variables template
│
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Python 3.8 or higher
- Supabase account

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd laundry_service/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd laundry_service/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and add your Supabase credentials.

5. Set up the database in Supabase:
   - Create a new project in Supabase
   - Run the SQL commands in `schema.sql` in the Supabase SQL editor
   - Run the initialization script to populate reference data:
     ```bash
     python init_db.py
     ```

6. Run the API server:
   ```bash
   uvicorn main:app --reload
   ```

7. The API will be available at [http://localhost:8000](http://localhost:8000).

## API Documentation

Once the backend is running, you can access the API documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

## Current Implementation Status

- ✅ User registration UI
- ✅ User login UI
- ✅ Dashboard UI
- ✅ Schedule pickup flow
- ✅ Payment processing UI
- ✅ Invoice generation
- ✅ Backend API implementation
- ✅ Database schema
- ✅ Authentication with JWT
- ⬜ Integration of frontend with backend
- ⬜ Real payment processing
- ⬜ Admin dashboard

## License

This project is licensed under the MIT License.
