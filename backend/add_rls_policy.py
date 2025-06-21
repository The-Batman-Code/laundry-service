import os
from dotenv import load_dotenv
import requests
import json

# Load environment variables
load_dotenv()

def add_rls_policy():
    print("Adding permissive RLS policy for pickup_requests table...")
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")  # Use service key for admin privileges
    
    if not supabase_url or not supabase_key:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables are not set.")
        return
    
    # First, enable RLS on the table (if it's not already enabled)
    enable_rls_query = """
    ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;
    """
    
    # Then, create a policy that allows all operations for all users
    create_policy_query = """
    CREATE POLICY "Allow all operations for all users" 
    ON pickup_requests 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);
    """
    
    # Headers for authentication
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }
    
    try:
        # Make the API request to enable RLS
        print("Enabling RLS...")
        response = requests.post(
            f"{supabase_url}/rest/v1/",
            headers=headers,
            data=json.dumps({"query": enable_rls_query})
        )
        print(f"Response: {response.status_code} - {response.text}")
        
        # Make the API request to create the policy
        print("Creating permissive policy...")
        response = requests.post(
            f"{supabase_url}/rest/v1/",
            headers=headers,
            data=json.dumps({"query": create_policy_query})
        )
        print(f"Response: {response.status_code} - {response.text}")
        
        print("RLS policy setup completed.")
    except Exception as e:
        print(f"Error setting up RLS policy: {str(e)}")

if __name__ == "__main__":
    add_rls_policy()
