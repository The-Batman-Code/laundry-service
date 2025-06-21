-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create laundry_types table
CREATE TABLE IF NOT EXISTS public.laundry_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL
);

-- Create pickup_requests table
CREATE TABLE IF NOT EXISTS public.pickup_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    address JSONB NOT NULL,
    time_slot_id TEXT NOT NULL,
    service_type_id TEXT NOT NULL REFERENCES public.laundry_types(id),
    special_instructions TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pickup_request_id UUID NOT NULL REFERENCES public.pickup_requests(id),
    payment_method_id TEXT NOT NULL REFERENCES public.payment_methods(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pickup_request_id UUID NOT NULL REFERENCES public.pickup_requests(id),
    payment_id UUID NOT NULL REFERENCES public.payments(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_delivery TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create RLS (Row Level Security) policies
-- Users can only access their own data
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_policy ON public.users
    USING (auth.uid() = id);

ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY pickup_requests_policy ON public.pickup_requests
    USING (auth.uid() = user_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_policy ON public.payments
    USING (auth.uid() = user_id);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoices_policy ON public.invoices
    USING (auth.uid() = user_id);

-- Allow public access to laundry_types and payment_methods
ALTER TABLE public.laundry_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY laundry_types_policy ON public.laundry_types
    USING (true);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_methods_policy ON public.payment_methods
    USING (true);
