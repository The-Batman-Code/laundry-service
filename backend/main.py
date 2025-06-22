import logging
import os
from datetime import datetime, timedelta
from typing import Optional

import requests
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from supabase import Client, create_client

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Environment validation
def validate_environment():
    """Validate required environment variables"""
    required_vars = {
        "SUPABASE_URL": os.getenv("SUPABASE_URL"),
        "SUPABASE_KEY": os.getenv("SUPABASE_KEY"),
        "SECRET_KEY": os.getenv("SECRET_KEY"),
        "ALGORITHM": os.getenv("ALGORITHM", "HS256"),
    }

    missing_vars = [var for var, value in required_vars.items() if not value]
    if missing_vars:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing_vars)}",
        )

    # Validate SECRET_KEY length
    if len(required_vars["SECRET_KEY"]) < 32:
        raise ValueError("SECRET_KEY must be at least 32 characters long")

    return required_vars


# Validate environment on startup
env_vars = validate_environment()

# Initialize FastAPI app
app = FastAPI(
    title="Laundry Service API",
    description="API for Laundry Service Application",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None,
)


# Startup event handler
@app.on_event("startup")
async def startup_event() -> None:
    """Initialize application on startup"""
    logger.info("🚀 Starting Laundry Service API...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")

    # Initialize database data if needed
    try:
        # Check if laundry_types table has data
        response = supabase.table("laundry_types").select("*").limit(1).execute()

        if not response.data or len(response.data) == 0:
            logger.info("Initializing laundry types...")

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

            for laundry_type in laundry_types:
                try:
                    supabase.table("laundry_types").insert(laundry_type).execute()
                except Exception as e:
                    logger.debug(
                        f"Laundry type {laundry_type['name']} might already exist: {e}",
                    )

        # Check if payment_methods table has data
        response = supabase.table("payment_methods").select("*").limit(1).execute()

        if not response.data or len(response.data) == 0:
            logger.info("Initializing payment methods...")

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

            for payment_method in payment_methods:
                try:
                    supabase.table("payment_methods").insert(payment_method).execute()
                except Exception as e:
                    logger.debug(
                        f"Payment method {payment_method['name']} might already exist: {e}",
                    )

        logger.info("✅ Database initialization completed!")

    except Exception as e:
        logger.warning(f"Database initialization failed (app will continue): {e}")

    logger.info("🎉 Laundry Service API started successfully!")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Cleanup on shutdown"""
    logger.info("👋 Shutting down Laundry Service API...")


# Configure CORS - Updated for Railway deployment
def get_cors_origins():
    """Get CORS origins based on environment"""
    origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:4000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:4000",
        "http://localhost:8000",
    ]

    # Add production origins
    if os.getenv("ENVIRONMENT") == "production":
        production_origins = [
            "https://*.vercel.app",
            "https://*.railway.app",
            "https://*.netlify.app",
        ]
        # Add custom domain if provided
        custom_domain = os.getenv("FRONTEND_URL")
        if custom_domain:
            origins.append(custom_domain)
        origins.extend(production_origins)

    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_origin_regex=r"https://.*\.(vercel|railway|netlify)\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize Supabase client with error handling
try:
    supabase: Client = create_client(env_vars["SUPABASE_URL"], env_vars["SUPABASE_KEY"])
    logger.info("Supabase client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}")
    raise

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = env_vars["SECRET_KEY"]
ALGORITHM = env_vars["ALGORITHM"]
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
    service_type_ids: list[str]  # Will be stored as JSONB array in database
    service_items: dict[str, dict[str, int]]  # serviceTypeId -> itemId -> quantity
    special_instructions: Optional[str] = None


class PickupRequestCreate(BaseModel):
    address: Address
    time_slot_id: str
    service_type_ids: list[str]  # Will be stored as JSONB array in database
    service_items: dict[str, dict[str, int]]  # serviceTypeId -> itemId -> quantity
    special_instructions: Optional[str] = None


class PickupRequestResponse(BaseModel):
    id: str
    user_id: str
    address: Address
    time_slot_id: str
    service_type_ids: list[str]  # Will be stored as JSONB array in database
    service_items: dict[str, dict[str, int]]  # serviceTypeId -> itemId -> quantity
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
    service_items: Optional[dict[str, dict[str, int]]] = None
    itemized_breakdown: Optional[list[dict]] = None


# Helper functions
def get_user_by_email(email: str):
    try:
        response = supabase.table("users").select("*").eq("email", email).execute()
        return response.data[0] if response.data and len(response.data) > 0 else None
    except Exception as e:
        logger.error(f"Error in get_user_by_email: {str(e)}")
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
    if not SECRET_KEY or not ALGORITHM:
        raise ValueError("SECRET_KEY and ALGORITHM must be set")
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        logger.debug(f"Validating token: {token[:10]}...")
        if not SECRET_KEY or not ALGORITHM:
            raise ValueError("SECRET_KEY and ALGORITHM must be set")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            logger.debug("Email is None in token")
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError as e:
        logger.debug(f"JWT Error: {str(e)}")
        raise credentials_exception

    if token_data.email is None:
        logger.debug("Email is None in token_data")
        raise credentials_exception

    user = get_user_by_email(token_data.email)
    if user is None:
        logger.debug(f"User not found for email: {token_data.email}")
        raise credentials_exception

    return User(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        phone_number=user["phone_number"],
        created_at=user["created_at"],
    )


# Routes
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    # Get user from Supabase
    user = get_user_by_email(form_data.username)

    if not user:
        logger.error(f"User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user["password"]):
        logger.error(f"Invalid password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires,
    )
    logger.debug(
        f"Generated token for user {form_data.username}: {access_token[:10]}...",
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/users", response_model=User)
async def create_user(user: UserCreate):
    logger.info(f"Received registration request for email: {user.email}")
    try:
        # Check if user already exists
        existing_user = get_user_by_email(user.email)
        if existing_user:
            logger.warning(f"User with email {user.email} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Hash the password
        hashed_password = get_password_hash(user.password)

        # Create user in Supabase
        user_data = {
            "email": user.email,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "password": hashed_password,
            "created_at": datetime.utcnow().isoformat(),
        }

        logger.debug(f"Inserting user data into Supabase: {user_data}")

        # Try with the regular client
        try:
            response = supabase.table("users").insert(user_data).execute()
            logger.debug(f"Supabase response: {response}")
        except Exception as insert_error:
            logger.error(
                f"Error inserting user with regular client: {str(insert_error)}",
            )
            # Try direct SQL approach as fallback
            try:
                # Create user with auth.sign_up
                auth_response = supabase.auth.sign_up(
                    {
                        "email": user.email,
                        "password": user.password,
                        "options": {
                            "data": {
                                "full_name": user.full_name,
                                "phone_number": user.phone_number,
                            },
                        },
                    },
                )
                logger.debug(f"Auth signup response: {auth_response}")

                # If auth signup worked, create a user record
                if auth_response.user and auth_response.user.id:
                    user_data["id"] = auth_response.user.id
                    response = supabase.table("users").insert(user_data).execute()
                    logger.debug(f"Supabase response after auth signup: {response}")
                else:
                    raise Exception("Auth signup did not return a user")
            except Exception as auth_error:
                logger.error(f"Error with auth signup approach: {str(auth_error)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create user: {str(auth_error)}",
                )

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user",
            )

        created_user = response.data[0]
        logger.info(f"User created successfully: {created_user}")
        return User(**created_user)
    except Exception as e:
        logger.error(f"Error in create_user: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}",
        )


@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/laundry-types", response_model=list[LaundryServiceType])
async def get_laundry_types():
    response = supabase.table("laundry_types").select("*").execute()
    return response.data


@app.get("/time-slots", response_model=list[TimeSlot])
async def get_time_slots(date: Optional[str] = None):
    # Generate time slots for a specific date or the next 7 days
    slots = []
    today = datetime.now()

    if date:
        # Return hourly slots for specific date
        try:
            selected_date = datetime.strptime(date, "%Y-%m-%d")
            # Only allow dates within the next 7 days
            if (
                selected_date.date() < today.date()
                or selected_date.date() > (today + timedelta(days=7)).date()
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Date must be within the next 7 days",
                )

            date_str = selected_date.strftime("%Y-%m-%d")
            day_name = selected_date.strftime("%A")
            formatted_date = selected_date.strftime("%b %d")

            # Generate hourly slots from 9 AM to 6 PM
            time_slots = [
                ("09:00", "9:00 AM"),
                ("10:00", "10:00 AM"),
                ("11:00", "11:00 AM"),
                ("12:00", "12:00 PM"),
                ("13:00", "1:00 PM"),
                ("14:00", "2:00 PM"),
                ("15:00", "3:00 PM"),
                ("16:00", "4:00 PM"),
                ("17:00", "5:00 PM"),
                ("18:00", "6:00 PM"),
            ]

            for time_24, time_12 in time_slots:
                slots.append(
                    {
                        "id": f"{date_str}-{time_24}",
                        "date": date_str,
                        "display_date": f"{day_name}, {formatted_date}",
                        "time": time_12,
                    },
                )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD",
            )
    else:
        # Return slots for the next 7 days (backward compatibility)
        for i in range(1, 8):
            current_date = today + timedelta(days=i)
            date_str = current_date.strftime("%Y-%m-%d")
            day_name = current_date.strftime("%A")
            formatted_date = current_date.strftime("%b %d")

            # Morning slot
            slots.append(
                {
                    "id": f"{date_str}-morning",
                    "date": date_str,
                    "display_date": f"{day_name}, {formatted_date}",
                    "time": "Morning (9:00 AM - 12:00 PM)",
                },
            )

            # Afternoon slot
            slots.append(
                {
                    "id": f"{date_str}-afternoon",
                    "date": date_str,
                    "display_date": f"{day_name}, {formatted_date}",
                    "time": "Afternoon (1:00 PM - 5:00 PM)",
                },
            )

    return slots


@app.post("/pickup-requests", response_model=PickupRequestResponse)
async def create_pickup_request(
    request: PickupRequestCreate,
    current_user: User = Depends(get_current_user),
):
    # Create pickup request in Supabase
    pickup_data = {
        "user_id": current_user.id,
        "address": request.address.dict(),
        "time_slot_id": request.time_slot_id,
        "service_type_ids": request.service_type_ids,
        "service_items": request.service_items,
        "special_instructions": request.special_instructions,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }

    logger.debug(f"Creating pickup request with data: {pickup_data}")

    try:
        # First try with the normal method
        response = supabase.table("pickup_requests").insert(pickup_data).execute()
        logger.info(f"Pickup request created successfully: {response.data[0]}")
        return PickupRequestResponse(**response.data[0])
    except Exception as e:
        logger.error(f"Error with normal method: {str(e)}")
        try:
            # Try alternative method with REST API
            url = f"{os.getenv('SUPABASE_URL')}/rest/v1/pickup_requests"
            headers = {
                "apikey": os.getenv("SUPABASE_KEY"),
                "Authorization": f"Bearer {os.getenv('SUPABASE_KEY')}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            }

            response = requests.post(url, headers=headers, json=pickup_data)

            if response.status_code == 201:
                result = response.json()[0]
                logger.debug(
                    f"Pickup request created successfully with REST API: {result}",
                )
                return PickupRequestResponse(**result)
            else:
                logger.error(
                    f"Error with REST API: {response.status_code} - {response.text}",
                )
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create pickup request: {response.text}",
                )
        except Exception as e2:
            logger.error(f"Error with alternative method: {str(e2)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create pickup request: {str(e)} | {str(e2)}",
            )


@app.get("/pickup-requests", response_model=list[PickupRequestResponse])
async def get_user_pickup_requests(current_user: User = Depends(get_current_user)):
    response = (
        supabase.table("pickup_requests")
        .select("*")
        .eq("user_id", current_user.id)
        .execute()
    )
    return response.data


@app.get("/pickup-requests/{pickup_id}", response_model=PickupRequestResponse)
async def get_pickup_request(
    pickup_id: str,
    current_user: User = Depends(get_current_user),
):
    response = (
        supabase.table("pickup_requests").select("*").eq("id", pickup_id).execute()
    )

    if not response.data or len(response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pickup request not found",
        )

    pickup = response.data[0]

    # Ensure the user owns this pickup request
    if pickup["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this pickup request",
        )

    return PickupRequestResponse(**pickup)


@app.get("/payment-methods", response_model=list[PaymentMethod])
async def get_payment_methods():
    response = supabase.table("payment_methods").select("*").execute()
    return response.data


# Define pricing structure as constants
SERVICE_ITEM_PRICES = {
    "regular": {
        "tshirt": {"name": "T-Shirt", "price": 25},
        "shirt": {"name": "Shirt", "price": 35},
        "jeans": {"name": "Jeans", "price": 45},
        "lowers": {"name": "Lowers/Pants", "price": 40},
        "underwear": {"name": "Underwear", "price": 15},
        "socks": {"name": "Socks", "price": 10},
    },
    "bag": {
        "small_bag": {"name": "Small Bag (up to 5kg)", "price": 150},
        "medium_bag": {"name": "Medium Bag (up to 8kg)", "price": 200},
        "large_bag": {"name": "Large Bag (up to 10kg)", "price": 249.9},
    },
    "shoes": {
        "sneakers": {"name": "Sneakers", "price": 80},
        "formal_shoes": {"name": "Formal Shoes", "price": 90},
        "boots": {"name": "Boots", "price": 100},
        "sandals": {"name": "Sandals", "price": 60},
    },
    "blanket": {
        "single_blanket": {"name": "Single Blanket", "price": 120},
        "double_blanket": {"name": "Double Blanket", "price": 180},
        "comforter": {"name": "Comforter", "price": 199.9},
        "duvet": {"name": "Duvet", "price": 220},
    },
    "dry_cleaning": {
        "suit": {"name": "Suit (2-piece)", "price": 200},
        "dress": {"name": "Dress", "price": 150},
        "coat": {"name": "Coat/Jacket", "price": 180},
        "saree": {"name": "Saree", "price": 120},
        "curtains": {"name": "Curtains", "price": 100},
    },
    "ironing": {
        "tshirt_iron": {"name": "T-Shirt", "price": 15},
        "shirt_iron": {"name": "Shirt", "price": 20},
        "jeans_iron": {"name": "Jeans", "price": 25},
        "dress_iron": {"name": "Dress", "price": 30},
        "saree_iron": {"name": "Saree", "price": 40},
    },
}

SERVICE_TYPE_NAMES = {
    "regular": "Regular Laundry",
    "bag": "Bag Service",
    "shoes": "Shoes Cleaning",
    "blanket": "Blanket/Comforter",
    "dry_cleaning": "Dry Cleaning",
    "ironing": "Ironing",
}


def generate_itemized_breakdown(service_items: dict[str, dict[str, int]]) -> list[dict]:
    """Generate itemized breakdown for invoice display"""
    breakdown = []

    for service_type_id, items in service_items.items():
        if service_type_id in SERVICE_ITEM_PRICES:
            service_name = SERVICE_TYPE_NAMES.get(service_type_id, service_type_id)

            for item_id, quantity in items.items():
                if item_id in SERVICE_ITEM_PRICES[service_type_id]:
                    item_info = SERVICE_ITEM_PRICES[service_type_id][item_id]
                    item_name = item_info["name"]
                    item_price = item_info["price"]
                    item_total = item_price * quantity

                    breakdown.append(
                        {
                            "service_type": service_name,
                            "item_name": item_name,
                            "quantity": quantity,
                            "unit_price": item_price,
                            "total_price": item_total,
                        },
                    )

    return breakdown


def calculate_pickup_total(service_items: dict[str, dict[str, int]]) -> float:
    """Calculate total amount from service items with proper pricing"""

    total = 0.0
    logger.debug(f"Calculating total for service_items: {service_items}")

    for service_type_id, items in service_items.items():
        if service_type_id in SERVICE_ITEM_PRICES:
            for item_id, quantity in items.items():
                if item_id in SERVICE_ITEM_PRICES[service_type_id]:
                    item_price = SERVICE_ITEM_PRICES[service_type_id][item_id]["price"]
                    item_total = item_price * quantity
                    total += item_total
                    logger.debug(
                        f"Service: {service_type_id}, Item: {item_id}, Qty: {quantity}, Price: {item_price}, Total: {item_total}",
                    )
                else:
                    logger.debug(
                        f"Warning: Unknown item {item_id} in service {service_type_id}",
                    )
        else:
            logger.warning(f"Warning: Unknown service type {service_type_id}")

    logger.debug(f"Calculated subtotal: {total}")
    return total


@app.post("/payments", response_model=Payment)
async def create_payment(
    payment: PaymentCreate,
    current_user: User = Depends(get_current_user),
):
    try:
        # Verify pickup request belongs to user
        pickup_response = (
            supabase.table("pickup_requests")
            .select("*")
            .eq("id", payment.pickup_request_id)
            .execute()
        )

        if not pickup_response.data or len(pickup_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pickup request not found",
            )

        pickup = pickup_response.data[0]
        if pickup["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create payment for this pickup request",
            )

        # Calculate the correct total from service_items
        service_items = pickup.get("service_items", {})
        calculated_subtotal = calculate_pickup_total(service_items)
        calculated_total_with_tax = calculated_subtotal * 1.08  # Add 8% tax

        logger.debug(f"Frontend sent amount: {payment.amount}")
        logger.debug(f"Backend calculated subtotal: {calculated_subtotal}")
        logger.debug(f"Backend calculated total with tax: {calculated_total_with_tax}")

        # Use the backend calculated amount for accuracy
        final_amount = calculated_total_with_tax

        # Create payment in Supabase
        payment_data = {
            "pickup_request_id": payment.pickup_request_id,
            "payment_method_id": payment.payment_method_id,
            "amount": final_amount,  # Use calculated amount
            "user_id": current_user.id,
            "status": "completed" if payment.payment_method_id != "cash" else "pending",
            "created_at": datetime.utcnow().isoformat(),
        }

        # Direct insert with updated RLS policy
        response = supabase.table("payments").insert(payment_data).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payment",
            )

        payment_result = response.data[0]

        # Update pickup request status - for cash on delivery, mark as confirmed instead of paid
        pickup_status = "paid" if payment.payment_method_id != "cash" else "confirmed"
        supabase.table("pickup_requests").update({"status": pickup_status}).eq(
            "id",
            payment.pickup_request_id,
        ).execute()

        # Create invoice with calculated amount
        estimated_delivery = datetime.now() + timedelta(days=2)
        invoice_data = {
            "pickup_request_id": payment.pickup_request_id,
            "payment_id": payment_result["id"],
            "user_id": current_user.id,
            "amount": final_amount,  # Use calculated amount
            "status": "issued",
            "created_at": datetime.utcnow().isoformat(),
            "estimated_delivery": estimated_delivery.isoformat(),
        }

        supabase.table("invoices").insert(invoice_data).execute()

        return Payment(**payment_result)
    except Exception as e:
        logger.error(f"Error in create_payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment processing failed. Please try again later.",
        )


@app.get("/payments/{payment_id}", response_model=Payment)
async def get_payment(
    payment_id: str,
    current_user: User = Depends(get_current_user),
):
    try:
        response = supabase.table("payments").select("*").eq("id", payment_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found",
            )

        payment = response.data[0]

        # Check if the payment belongs to the current user
        if payment["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this payment",
            )

        return Payment(**payment)
    except Exception as e:
        logger.error(f"Error in get_payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve payment information",
        )


@app.get("/invoices", response_model=list[Invoice])
async def get_user_invoices(current_user: User = Depends(get_current_user)):
    response = (
        supabase.table("invoices").select("*").eq("user_id", current_user.id).execute()
    )
    return response.data


@app.get("/invoices/payment/{payment_id}", response_model=Invoice)
async def get_invoice_by_payment_id(
    payment_id: str,
    current_user: User = Depends(get_current_user),
):
    try:
        # Find the invoice associated with the payment
        response = (
            supabase.table("invoices")
            .select("*")
            .eq("payment_id", payment_id)
            .execute()
        )

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found for this payment",
            )

        invoice = response.data[0]

        # Ensure the user owns this invoice
        if invoice["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this invoice",
            )

        # Get pickup request to fetch service items
        pickup_response = (
            supabase.table("pickup_requests")
            .select("*")
            .eq("id", invoice["pickup_request_id"])
            .execute()
        )

        if pickup_response.data and len(pickup_response.data) > 0:
            pickup = pickup_response.data[0]
            service_items = pickup.get("service_items", {})
            itemized_breakdown = generate_itemized_breakdown(service_items)

            invoice_data = {
                **invoice,
                "service_items": service_items,
                "itemized_breakdown": itemized_breakdown,
            }
            return Invoice(**invoice_data)

        return Invoice(**invoice)
    except Exception as e:
        logger.error(f"Error in get_invoice_by_payment_id: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve invoice information",
        )


@app.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
):
    response = supabase.table("invoices").select("*").eq("id", invoice_id).execute()

    if not response.data or len(response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    invoice = response.data[0]

    # Ensure the user owns this invoice
    if invoice["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this invoice",
        )

    # Get pickup request to fetch service items
    pickup_response = (
        supabase.table("pickup_requests")
        .select("*")
        .eq("id", invoice["pickup_request_id"])
        .execute()
    )

    if pickup_response.data and len(pickup_response.data) > 0:
        pickup = pickup_response.data[0]
        service_items = pickup.get("service_items", {})
        itemized_breakdown = generate_itemized_breakdown(service_items)

        invoice_data = {
            **invoice,
            "service_items": service_items,
            "itemized_breakdown": itemized_breakdown,
        }
        return Invoice(**invoice_data)

    return Invoice(**invoice)


# Health check endpoint for deployment monitoring
@app.get("/health")
async def health_check():
    """
    Health check endpoint for Railway/deployment monitoring
    Returns API status and database connectivity
    """
    try:
        # Test database connection with timeout
        response = supabase.table("laundry_types").select("*").limit(1).execute()
        db_status = "healthy" if response.data is not None else "unhealthy"

        health_data = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "database": db_status,
            "environment": os.getenv("ENVIRONMENT", "development"),
            "services": {
                "supabase": "connected" if db_status == "healthy" else "disconnected",
                "auth": "operational",
                "payments": "operational",
            },
        }

        logger.info(f"Health check passed: {health_data}")
        return health_data

    except Exception as e:
        error_data = {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "error": str(e),
            "environment": os.getenv("ENVIRONMENT", "development"),
            "services": {
                "supabase": "disconnected",
                "auth": "unknown",
                "payments": "unknown",
            },
        }

        logger.error(f"Health check failed: {error_data}")
        return error_data


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with API information
    """
    return {
        "message": "Welcome to the Laundry Service API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "health": "/health",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }


# Run the application
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
