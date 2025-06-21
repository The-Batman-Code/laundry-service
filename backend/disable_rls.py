import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def disable_rls():
    print("Disabling Row Level Security (RLS) for pickup_requests table...")
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")  # Use service key for admin privileges
    
    if not supabase_url or not supabase_key:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables are not set.")
        return
    
    # SQL query to disable RLS
    sql_query = "ALTER TABLE pickup_requests DISABLE ROW LEVEL SECURITY;"
    
    # Construct the REST API URL for SQL query
    api_url = f"{supabase_url}/rest/v1/rpc/execute_sql"
    
    # Headers for authentication
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }
    
    # Request payload
    payload = {
        "query": sql_query
    }
    
    try:
        # Make the API request
        response = requests.post(api_url, headers=headers, json=payload)
        
        # Check if the request was successful
        if response.status_code == 200:
            print("Successfully disabled RLS for pickup_requests table.")
        else:
            print(f"Error disabling RLS. Status code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error disabling RLS: {str(e)}")

if __name__ == "__main__":
    disable_rls()
