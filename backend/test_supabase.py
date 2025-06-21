import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
print(f"Supabase URL: {supabase_url}")
print(f"Supabase Key (first 10 chars): {supabase_key[:10]}...")

try:
    supabase: Client = create_client(supabase_url, supabase_key)
    print("Supabase client created successfully")
    
    # Try to query the users table
    try:
        response = supabase.table("users").select("count", count="exact").execute()
        print(f"Users count: {response.count}")
    except Exception as e:
        print(f"Error querying users table: {str(e)}")
    
    # Try to create a test user
    try:
        test_user = {
            "email": "test@example.com",
            "full_name": "Test User",
            "phone_number": "1234567890",
            "password": "hashed_password_here"
        }
        response = supabase.table("users").insert(test_user).execute()
        print(f"User creation response: {response.data}")
    except Exception as e:
        print(f"Error creating test user: {str(e)}")
        
except Exception as e:
    print(f"Error creating Supabase client: {str(e)}")
