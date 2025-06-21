from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import requests

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Laundry Service API",
    description="API for Laundry Service Application",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https?://.*",  # Allow all origins with a regex pattern
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")  # Use anon key as originally configured
supabase: Client = create_client(supabase_url, supabase_key)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LaundryServiceType(BaseModel):
    id: str
    name: str
    price: float
    description: str

class Address(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str
    instructions: Optional[str] = None

class TimeSlot(BaseModel):
    id: str
    date: str
    time: str
    display_date: str

class PickupRequest(BaseModel):
    user_id: str
    address: Address
    time_slot_id: str
    service_type_id: str
    special_instructions: Optional[str] = None

class PickupRequestCreate(BaseModel):
    address: Address
    time_slot_id: str
    service_type_id: str
    special_instructions: Optional[str] = None

class PickupRequestResponse(BaseModel):
    id: str
    user_id: str
    address: Address
    time_slot_id: str
    service_type_id: str
    special_instructions: Optional[str] = None
    status: str
    created_at: datetime

class PaymentMethod(BaseModel):
    id: str
    name: str
    description: str

class PaymentCreate(BaseModel):
    pickup_request_id: str
    payment_method_id: str
    amount: float

class Payment(PaymentCreate):
    id: str
    user_id: str
    status: str
    created_at: datetime

class Invoice(BaseModel):
    id: str
    pickup_request_id: str
    payment_id: str
    user_id: str
    amount: float
    status: str
    created_at: datetime
    estimated_delivery: datetime
    payment_method: Optional[str] = None

# Helper functions
def get_user_by_email(email: str):
    try:
        response = supabase.table("users").select("*").eq("email", email).execute()
        return response.data[0] if response.data and len(response.data) > 0 else None
    except Exception as e:
        print(f"Error in get_user_by_email: {str(e)}")
        return None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"Validating token: {token[:10]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            print("Email is None in token")
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError as e:
        print(f"JWT Error: {str(e)}")
        raise credentials_exception
    
    user = get_user_by_email(token_data.email)
    if user is None:
        print(f"User not found for email: {token_data.email}")
        raise credentials_exception
    
    return User(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        phone_number=user["phone_number"],
        created_at=user["created_at"]
    )

# Routes
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    print(f"Login attempt for user: {form_data.username}")
    # Get user from Supabase
    user = get_user_by_email(form_data.username)
    
    if not user:
        print(f"User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user["password"]):
        print(f"Invalid password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    print(f"Generated token for user {form_data.username}: {access_token[:10]}...")
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users", response_model=User)
async def create_user(user: UserCreate):
    print(f"Received registration request for email: {user.email}")
    try:
        # Check if user already exists
        existing_user = get_user_by_email(user.email)
        if existing_user:
            print(f"User with email {user.email} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = get_password_hash(user.password)
        
        # Create user in Supabase
        user_data = {
            "email": user.email,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "password": hashed_password,
            "created_at": datetime.utcnow().isoformat()
        }
        
        print(f"Inserting user data into Supabase: {user_data}")
        
        # Try with the regular client
        try:
            response = supabase.table("users").insert(user_data).execute()
            print(f"Supabase response: {response}")
        except Exception as insert_error:
            print(f"Error inserting user with regular client: {str(insert_error)}")
            # Try direct SQL approach as fallback
            try:
                # Create user with auth.sign_up
                auth_response = supabase.auth.sign_up({
                    "email": user.email,
                    "password": user.password,
                    "options": {
                        "data": {
                            "full_name": user.full_name,
                            "phone_number": user.phone_number
                        }
                    }
                })
                print(f"Auth signup response: {auth_response}")
                
                # If auth signup worked, create a user record
                if auth_response.user and auth_response.user.id:
                    user_data["id"] = auth_response.user.id
                    response = supabase.table("users").insert(user_data).execute()
                    print(f"Supabase response after auth signup: {response}")
                else:
                    raise Exception("Auth signup did not return a user")
            except Exception as auth_error:
                print(f"Error with auth signup approach: {str(auth_error)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create user: {str(auth_error)}"
                )
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        created_user = response.data[0]
        print(f"User created successfully: {created_user}")
        return User(**created_user)
    except Exception as e:
        print(f"Error in create_user: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/laundry-types", response_model=List[LaundryServiceType])
async def get_laundry_types():
    response = supabase.table("laundry_types").select("*").execute()
    return response.data

@app.get("/time-slots", response_model=List[TimeSlot])
async def get_time_slots():
    # Generate time slots for the next 7 days
    slots = []
    today = datetime.now()
    
    for i in range(1, 8):
        date = today + timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        day_name = date.strftime("%A")
        formatted_date = date.strftime("%b %d")
        
        # Morning slot
        slots.append({
            "id": f"{date_str}-morning",
            "date": date_str,
            "display_date": f"{day_name}, {formatted_date}",
            "time": "Morning (9:00 AM - 12:00 PM)"
        })
        
        # Afternoon slot
        slots.append({
            "id": f"{date_str}-afternoon",
            "date": date_str,
            "display_date": f"{day_name}, {formatted_date}",
            "time": "Afternoon (1:00 PM - 5:00 PM)"
        })
    
    return slots

@app.post("/pickup-requests", response_model=PickupRequestResponse)
async def create_pickup_request(
    request: PickupRequestCreate,
    current_user: User = Depends(get_current_user)
):
    # Create pickup request in Supabase
    pickup_data = {
        "user_id": current_user.id,
        "address": request.address.dict(),
        "time_slot_id": request.time_slot_id,
        "service_type_id": request.service_type_id,
        "special_instructions": request.special_instructions,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    
    print(f"Creating pickup request with data: {pickup_data}")
    
    try:
        # First try with the normal method
        response = supabase.table("pickup_requests").insert(pickup_data).execute()
        print(f"Pickup request created successfully: {response.data[0]}")
        return PickupRequestResponse(**response.data[0])
    except Exception as e:
        print(f"Error with normal method: {str(e)}")
        try:
            # Try alternative method with REST API
            url = f"{os.getenv('SUPABASE_URL')}/rest/v1/pickup_requests"
            headers = {
                "apikey": os.getenv("SUPABASE_KEY"),
                "Authorization": f"Bearer {os.getenv('SUPABASE_KEY')}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            response = requests.post(url, headers=headers, json=pickup_data)
            
            if response.status_code == 201:
                result = response.json()[0]
                print(f"Pickup request created successfully with REST API: {result}")
                return PickupRequestResponse(**result)
            else:
                print(f"Error with REST API: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create pickup request: {response.text}"
                )
        except Exception as e2:
            print(f"Error with alternative method: {str(e2)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create pickup request: {str(e)} | {str(e2)}"
            )

@app.get("/pickup-requests", response_model=List[PickupRequestResponse])
async def get_user_pickup_requests(current_user: User = Depends(get_current_user)):
    response = supabase.table("pickup_requests").select("*").eq("user_id", current_user.id).execute()
    return response.data

@app.get("/pickup-requests/{pickup_id}", response_model=PickupRequestResponse)
async def get_pickup_request(
    pickup_id: str,
    current_user: User = Depends(get_current_user)
):
    response = supabase.table("pickup_requests").select("*").eq("id", pickup_id).execute()
    
    if not response.data or len(response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pickup request not found"
        )
    
    pickup = response.data[0]
    
    # Ensure the user owns this pickup request
    if pickup["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this pickup request"
        )
    
    return PickupRequestResponse(**pickup)

@app.get("/payment-methods", response_model=List[PaymentMethod])
async def get_payment_methods():
    response = supabase.table("payment_methods").select("*").execute()
    return response.data

@app.post("/payments", response_model=Payment)
async def create_payment(
    payment: PaymentCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        # Verify pickup request belongs to user
        pickup_response = supabase.table("pickup_requests").select("*").eq("id", payment.pickup_request_id).execute()
        
        if not pickup_response.data or len(pickup_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pickup request not found"
            )
        
        pickup = pickup_response.data[0]
        if pickup["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create payment for this pickup request"
            )
        
        # Create payment in Supabase
        payment_data = {
            "pickup_request_id": payment.pickup_request_id,
            "payment_method_id": payment.payment_method_id,
            "amount": payment.amount,
            "user_id": current_user.id,
            "status": "completed" if payment.payment_method_id != "cash" else "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Direct insert with updated RLS policy
        response = supabase.table("payments").insert(payment_data).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payment"
            )
        
        payment_result = response.data[0]
        
        # Update pickup request status - for cash on delivery, mark as confirmed instead of paid
        pickup_status = "paid" if payment.payment_method_id != "cash" else "confirmed"
        supabase.table("pickup_requests").update({"status": pickup_status}).eq("id", payment.pickup_request_id).execute()
        
        # Create invoice
        estimated_delivery = datetime.now() + timedelta(days=2)
        invoice_data = {
            "pickup_request_id": payment.pickup_request_id,
            "payment_id": payment_result["id"],
            "user_id": current_user.id,
            "amount": payment.amount,
            "status": "issued",
            "created_at": datetime.utcnow().isoformat(),
            "estimated_delivery": estimated_delivery.isoformat()
        }
        
        supabase.table("invoices").insert(invoice_data).execute()
        
        return Payment(**payment_result)
    except Exception as e:
        print(f"Error in create_payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment processing failed. Please try again later."
        )

@app.get("/payments/{payment_id}", response_model=Payment)
async def get_payment(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        response = supabase.table("payments").select("*").eq("id", payment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        payment = response.data[0]
        
        # Check if the payment belongs to the current user
        if payment["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this payment"
            )
        
        return Payment(**payment)
    except Exception as e:
        print(f"Error in get_payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve payment information"
        )

@app.get("/invoices", response_model=List[Invoice])
async def get_user_invoices(current_user: User = Depends(get_current_user)):
    response = supabase.table("invoices").select("*").eq("user_id", current_user.id).execute()
    return response.data

@app.get("/invoices/payment/{payment_id}", response_model=Invoice)
async def get_invoice_by_payment_id(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        # Find the invoice associated with the payment
        response = supabase.table("invoices").select("*").eq("payment_id", payment_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found for this payment"
            )
        
        invoice = response.data[0]
        
        # Ensure the user owns this invoice
        if invoice["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this invoice"
            )
        
        return Invoice(**invoice)
    except Exception as e:
        print(f"Error in get_invoice_by_payment_id: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve invoice information"
        )

@app.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user)
):
    response = supabase.table("invoices").select("*").eq("id", invoice_id).execute()
    
    if not response.data or len(response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice = response.data[0]
    
    # Ensure the user owns this invoice
    if invoice["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this invoice"
        )
    
    return Invoice(**invoice)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Laundry Service API"}

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
