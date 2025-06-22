import os

from dotenv import load_dotenv
from supabase import Client, create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)


def init_db() -> None:
    print("Initializing database...")

    # Create laundry types
    laundry_types = [
        {
            "id": "regular",
            "name": "Regular Laundry",
            "price": 159.9,
            "description": "Wash, dry, and fold service for everyday clothes",
        },
        {
            "id": "bag",
            "name": "Laundry Bag",
            "price": 249.9,
            "description": "Fill a bag with as many clothes as possible (up to 10kg)",
        },
        {
            "id": "shoes",
            "name": "Shoes Cleaning",
            "price": 129.9,
            "description": "Professional cleaning for all types of shoes",
        },
        {
            "id": "blanket",
            "name": "Blanket/Comforter",
            "price": 199.9,
            "description": "Cleaning service for blankets, comforters, and duvets",
        },
        {
            "id": "dry_cleaning",
            "name": "Dry Cleaning",
            "price": 299.9,
            "description": "Professional dry cleaning for delicate fabrics",
        },
        {
            "id": "ironing",
            "name": "Ironing Service",
            "price": 149.9,
            "description": "Professional ironing service for your clothes",
        },
    ]

    # Create payment methods
    payment_methods = [
        {
            "id": "credit_card",
            "name": "Credit Card",
            "description": "Pay with Visa, Mastercard, or American Express",
        },
        {
            "id": "paypal",
            "name": "PayPal",
            "description": "Pay using your PayPal account",
        },
        {
            "id": "cash",
            "name": "Cash",
            "description": "Pay with cash on pickup",
        },
    ]

    try:
        # Create tables if they don't exist
        print("Creating tables if they don't exist...")

        # Create users table
        try:
            # Check if users table exists by trying to query it
            supabase.table("users").select("count", count="exact").execute()
        except Exception:
            print("Creating users table...")
            # Create users table using SQL
            supabase.table("users").execute_sql("""
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    email TEXT UNIQUE NOT NULL,
                    full_name TEXT NOT NULL,
                    phone_number TEXT NOT NULL,
                    password TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)

        # Create pickup_requests table
        try:
            # Check if pickup_requests table exists by trying to query it
            supabase.table("pickup_requests").select("count").execute()
        except Exception:
            print("Creating pickup_requests table...")
            # Use direct SQL execution via Supabase RPC or raw SQL
            # Create pickup_requests table with updated schema
            print(
                "Note: Please run the following SQL manually in your Supabase SQL editor:"
            )
            print("""
                CREATE TABLE IF NOT EXISTS pickup_requests (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id UUID NOT NULL REFERENCES users(id),
                    address JSONB NOT NULL,
                    time_slot_id TEXT NOT NULL,
                    service_type_ids TEXT[] NOT NULL DEFAULT '{}',
                    service_items JSONB NOT NULL DEFAULT '{}',
                    special_instructions TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)

        # Create payments table
        try:
            # Check if payments table exists by trying to query it
            supabase.table("payments").select("count", count="exact").execute()
        except Exception:
            print("Creating payments table...")
            # Create payments table using SQL
            supabase.table("payments").execute_sql("""
                CREATE TABLE IF NOT EXISTS payments (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id UUID NOT NULL REFERENCES users(id),
                    pickup_request_id UUID NOT NULL REFERENCES pickup_requests(id),
                    payment_method_id TEXT NOT NULL,
                    amount NUMERIC(10,2) NOT NULL,
                    status TEXT DEFAULT 'completed',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)

        # Create invoices table
        try:
            # Check if invoices table exists by trying to query it
            supabase.table("invoices").select("count", count="exact").execute()
        except Exception:
            print("Creating invoices table...")
            # Create invoices table using SQL
            supabase.table("invoices").execute_sql("""
                CREATE TABLE IF NOT EXISTS invoices (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id UUID NOT NULL REFERENCES users(id),
                    pickup_request_id UUID NOT NULL REFERENCES pickup_requests(id),
                    payment_id UUID NOT NULL REFERENCES payments(id),
                    amount NUMERIC(10,2) NOT NULL,
                    status TEXT DEFAULT 'issued',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    estimated_delivery TIMESTAMP WITH TIME ZONE NOT NULL
                );
            """)

        # Disable Row Level Security (RLS) on all tables
        print("Configuring Row Level Security (RLS)...")

        # Disable RLS on users table
        supabase.table("users").execute_sql("""
            ALTER TABLE users DISABLE ROW LEVEL SECURITY;
        """)

        # Disable RLS on laundry_types table
        supabase.table("laundry_types").execute_sql("""
            ALTER TABLE laundry_types DISABLE ROW LEVEL SECURITY;
        """)

        # Disable RLS on pickup_requests table
        supabase.table("pickup_requests").execute_sql("""
            ALTER TABLE pickup_requests DISABLE ROW LEVEL SECURITY;
        """)

        # Disable RLS on payments table
        supabase.table("payments").execute_sql("""
            ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
        """)

        # Disable RLS on invoices table
        supabase.table("invoices").execute_sql("""
            ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
        """)

        # Disable RLS on payment_methods table
        supabase.table("payment_methods").execute_sql("""
            ALTER TABLE payment_methods DISABLE ROW LEVEL SECURITY;
        """)

        # Insert laundry types
        print("Adding laundry types...")
        for laundry_type in laundry_types:
            # Check if it already exists
            response = (
                supabase.table("laundry_types")
                .select("*")
                .eq("id", laundry_type["id"])
                .execute()
            )
            if not response.data or len(response.data) == 0:
                supabase.table("laundry_types").insert(laundry_type).execute()

        # Insert payment methods
        print("Adding payment methods...")
        for payment_method in payment_methods:
            # Check if it already exists
            response = (
                supabase.table("payment_methods")
                .select("*")
                .eq("id", payment_method["id"])
                .execute()
            )
            if not response.data or len(response.data) == 0:
                supabase.table("payment_methods").insert(payment_method).execute()

        print("Database initialization completed successfully!")

    except Exception as e:
        print(f"Error initializing database: {e}")


if __name__ == "__main__":
    init_db()
