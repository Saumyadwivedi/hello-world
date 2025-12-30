from fastapi import FastAPI, APIRouter, HTTPException, Request, Header, Response, UploadFile, File, Form, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import gridfs
from bson import ObjectId
import base64
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# GridFS setup (synchronous client for file operations)
from pymongo import MongoClient
sync_client = MongoClient(mongo_url)
sync_db = sync_client[os.environ['DB_NAME']]
grid_fs = gridfs.GridFS(sync_db)

# Stripe setup
stripe_api_key = os.environ.get('STRIPE_API_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============= MODELS =============

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "user"  # admin, society_admin, user, seller
    society_id: Optional[str] = None
    created_at: str

class SessionData(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None

class Society(BaseModel):
    society_id: str
    name: str
    address: str
    city: str
    state: str
    pincode: str
    description: Optional[str] = None
    contact_name: str
    contact_phone: str
    status: str = "pending"  # pending, approved, rejected
    created_by: str
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    created_at: str

class SocietyCreate(BaseModel):
    name: str
    address: str
    city: str
    state: str
    pincode: str
    description: Optional[str] = None
    contact_name: str
    contact_phone: str

class Seller(BaseModel):
    seller_id: str
    user_id: str
    society_id: str
    business_name: str
    aadhar_number: str
    fssai_number: str
    aadhar_doc_id: Optional[str] = None
    fssai_doc_id: Optional[str] = None
    status: str = "pending"  # pending, approved, rejected
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    created_at: str

class FoodItem(BaseModel):
    item_id: str
    seller_id: str
    society_id: str
    name: str
    description: Optional[str] = None
    price: float
    food_type: str  # veg, non-veg, jain
    image_url: Optional[str] = None
    available: bool = True
    created_at: str

class FoodItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    food_type: str
    image_url: Optional[str] = None
    available: bool = True

class OrderItem(BaseModel):
    item_id: str
    name: str
    price: float
    quantity: int

class Order(BaseModel):
    order_id: str
    user_id: str
    seller_id: str
    society_id: str
    items: List[OrderItem]
    total_amount: float
    payment_status: str = "pending"  # pending, paid, failed
    payment_session_id: Optional[str] = None
    status: str = "pending"  # pending, confirmed, preparing, ready, delivered, cancelled
    created_at: str

class OrderCreate(BaseModel):
    seller_id: str
    items: List[OrderItem]

class PaymentTransaction(BaseModel):
    transaction_id: str
    session_id: str
    order_id: Optional[str] = None
    user_id: str
    amount: float
    currency: str
    payment_status: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: str

# ============= AUTH MIDDLEWARE =============

async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> User:
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    session_token = request.cookies.get("session_token")
    
    if not session_token and authorization:
        if authorization.startswith("Bearer "):
            session_token = authorization[7:]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

# ============= AUTH ROUTES =============

@api_router.post("/auth/session")
async def create_session(request: Request):
    data = await request.json()
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Get user data from Emergent Auth
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        ) as response:
            if response.status != 200:
                raise HTTPException(status_code=400, detail="Invalid session_id")
            
            auth_data = await response.json()
    
    # Check if user exists
    user_doc = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if user_doc:
        user_id = user_doc["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": auth_data["name"], "picture": auth_data["picture"]}}
        )
    else:
        # Create new user (default role is 'user')
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        
        # Check if this is the first user (make them admin)
        user_count = await db.users.count_documents({})
        role = "admin" if user_count == 0 else "user"
        
        await db.users.insert_one({
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "role": role,
            "society_id": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Create session
    session_token = auth_data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Get updated user
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "session_token": session_token,
        "user": user_doc
    }

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie("session_token")
    return {"message": "Logged out successfully"}


# ============= EMAIL/PASSWORD AUTH MODELS =============

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ============= EMAIL/PASSWORD AUTH ROUTES =============

@api_router.post("/auth/signup")
async def signup(signup_data: SignupRequest):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": signup_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = bcrypt.hashpw(signup_data.password.encode('utf-8'), bcrypt.gensalt())
    
    # Create new user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    # Check if this is the first user (make them admin)
    user_count = await db.users.count_documents({})
    role = "admin" if user_count == 0 else "user"
    
    await db.users.insert_one({
        "user_id": user_id,
        "email": signup_data.email,
        "name": signup_data.name,
        "password_hash": password_hash.decode('utf-8'),
        "picture": None,
        "role": role,
        "society_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Get user without password hash
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    return {
        "session_token": session_token,
        "user": user_doc
    }

@api_router.post("/auth/login")
async def login(login_data: LoginRequest):
    # Find user
    user_doc = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if user has password (might be OAuth only user)
    if "password_hash" not in user_doc:
        raise HTTPException(status_code=401, detail="Please use Google login for this account")
    
    # Verify password
    if not bcrypt.checkpw(login_data.password.encode('utf-8'), user_doc["password_hash"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Remove password hash from response
    user_doc.pop("password_hash", None)
    
    return {
        "session_token": session_token,
        "user": user_doc
    }


# ============= SOCIETY ROUTES =============

@api_router.post("/societies", response_model=Society)
async def create_society(society_data: SocietyCreate, current_user: User = Depends(get_current_user)):
    society_id = f"society_{uuid.uuid4().hex[:12]}"
    
    society_dict = society_data.model_dump()
    society_dict.update({
        "society_id": society_id,
        "status": "pending",
        "created_by": current_user.user_id,
        "approved_by": None,
        "approved_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    await db.societies.insert_one(society_dict)
    
    return Society(**society_dict)

@api_router.get("/societies", response_model=List[Society])
async def list_societies(current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        societies = await db.societies.find({}, {"_id": 0}).to_list(1000)
    elif current_user.society_id:
        societies = await db.societies.find({"society_id": current_user.society_id}, {"_id": 0}).to_list(1000)
    else:
        # Users not in a society can see all approved societies
        societies = await db.societies.find({"status": "approved"}, {"_id": 0}).to_list(1000)
    
    return societies

@api_router.get("/societies/{society_id}", response_model=Society)
async def get_society(society_id: str):
    society = await db.societies.find_one({"society_id": society_id}, {"_id": 0})
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")
    return Society(**society)

@api_router.patch("/societies/{society_id}/approve")
async def approve_society(society_id: str, status: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can approve societies")
    
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.societies.update_one(
        {"society_id": society_id},
        {"$set": {
            "status": status,
            "approved_by": current_user.user_id,
            "approved_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Society not found")
    
    return {"message": f"Society {status} successfully"}

@api_router.post("/societies/{society_id}/join")
async def join_society(society_id: str, role: str, current_user: User = Depends(get_current_user)):
    # Verify society exists and is approved
    society = await db.societies.find_one({"society_id": society_id, "status": "approved"}, {"_id": 0})
    if not society:
        raise HTTPException(status_code=404, detail="Society not found or not approved")
    
    if role not in ["user", "society_admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Update user's society and role
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {"society_id": society_id, "role": role}}
    )
    
    return {"message": "Joined society successfully"}

# ============= SELLER ROUTES =============

@api_router.post("/sellers")
async def register_seller(
    business_name: str = Form(...),
    aadhar_number: str = Form(...),
    fssai_number: str = Form(...),
    aadhar_doc: UploadFile = File(...),
    fssai_doc: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not current_user.society_id:
        raise HTTPException(status_code=400, detail="You must join a society first")
    
    # Store documents in GridFS
    aadhar_content = await aadhar_doc.read()
    fssai_content = await fssai_doc.read()
    
    aadhar_id = grid_fs.put(aadhar_content, filename=aadhar_doc.filename)
    fssai_id = grid_fs.put(fssai_content, filename=fssai_doc.filename)
    
    seller_id = f"seller_{uuid.uuid4().hex[:12]}"
    
    seller_dict = {
        "seller_id": seller_id,
        "user_id": current_user.user_id,
        "society_id": current_user.society_id,
        "business_name": business_name,
        "aadhar_number": aadhar_number,
        "fssai_number": fssai_number,
        "aadhar_doc_id": str(aadhar_id),
        "fssai_doc_id": str(fssai_id),
        "status": "pending",
        "approved_by": None,
        "approved_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.sellers.insert_one(seller_dict)
    
    return {"message": "Seller registration submitted", "seller_id": seller_id}

@api_router.get("/sellers", response_model=List[Seller])
async def list_sellers(current_user: User = Depends(get_current_user)):
    query = {}
    
    if current_user.role == "society_admin":
        query["society_id"] = current_user.society_id
    elif current_user.role != "admin":
        query["society_id"] = current_user.society_id
        query["status"] = "approved"
    
    sellers = await db.sellers.find(query, {"_id": 0}).to_list(1000)
    return sellers

@api_router.get("/sellers/{seller_id}", response_model=Seller)
async def get_seller(seller_id: str):
    seller = await db.sellers.find_one({"seller_id": seller_id}, {"_id": 0})
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    return Seller(**seller)

@api_router.patch("/sellers/{seller_id}/approve")
async def approve_seller(seller_id: str, status: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "society_admin" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only society admins can approve sellers")
    
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    seller = await db.sellers.find_one({"seller_id": seller_id}, {"_id": 0})
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    if current_user.role == "society_admin" and seller["society_id"] != current_user.society_id:
        raise HTTPException(status_code=403, detail="Can only approve sellers in your society")
    
    await db.sellers.update_one(
        {"seller_id": seller_id},
        {"$set": {
            "status": status,
            "approved_by": current_user.user_id,
            "approved_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # If approved, update user role to seller
    if status == "approved":
        await db.users.update_one(
            {"user_id": seller["user_id"]},
            {"$set": {"role": "seller"}}
        )
    
    return {"message": f"Seller {status} successfully"}

# ============= FOOD ITEM ROUTES =============

@api_router.post("/food-items", response_model=FoodItem)
async def create_food_item(item_data: FoodItemCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can create food items")
    
    # Get seller info
    seller = await db.sellers.find_one({"user_id": current_user.user_id, "status": "approved"}, {"_id": 0})
    if not seller:
        raise HTTPException(status_code=403, detail="You must be an approved seller")
    
    item_id = f"item_{uuid.uuid4().hex[:12]}"
    
    item_dict = item_data.model_dump()
    item_dict.update({
        "item_id": item_id,
        "seller_id": seller["seller_id"],
        "society_id": seller["society_id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    await db.food_items.insert_one(item_dict)
    
    return FoodItem(**item_dict)

@api_router.get("/food-items", response_model=List[FoodItem])
async def list_food_items(
    society_id: Optional[str] = None,
    food_type: Optional[str] = None,
    seller_id: Optional[str] = None
):
    query = {"available": True}
    
    if society_id:
        query["society_id"] = society_id
    if food_type:
        query["food_type"] = food_type
    if seller_id:
        query["seller_id"] = seller_id
    
    items = await db.food_items.find(query, {"_id": 0}).to_list(1000)
    return items

@api_router.get("/food-items/{item_id}", response_model=FoodItem)
async def get_food_item(item_id: str):
    item = await db.food_items.find_one({"item_id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Food item not found")
    return FoodItem(**item)

@api_router.patch("/food-items/{item_id}", response_model=FoodItem)
async def update_food_item(item_id: str, item_data: FoodItemCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can update food items")
    
    seller = await db.sellers.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if not seller:
        raise HTTPException(status_code=403, detail="Seller not found")
    
    item = await db.food_items.find_one({"item_id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Food item not found")
    
    if item["seller_id"] != seller["seller_id"]:
        raise HTTPException(status_code=403, detail="You can only update your own items")
    
    update_dict = item_data.model_dump()
    await db.food_items.update_one({"item_id": item_id}, {"$set": update_dict})
    
    updated_item = await db.food_items.find_one({"item_id": item_id}, {"_id": 0})
    return FoodItem(**updated_item)

@api_router.delete("/food-items/{item_id}")
async def delete_food_item(item_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can delete food items")
    
    seller = await db.sellers.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if not seller:
        raise HTTPException(status_code=403, detail="Seller not found")
    
    item = await db.food_items.find_one({"item_id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Food item not found")
    
    if item["seller_id"] != seller["seller_id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own items")
    
    await db.food_items.delete_one({"item_id": item_id})
    return {"message": "Food item deleted successfully"}

# ============= ORDER ROUTES =============

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    if not current_user.society_id:
        raise HTTPException(status_code=400, detail="You must join a society to place orders")
    
    # Verify seller exists and items belong to seller
    seller = await db.sellers.find_one({"seller_id": order_data.seller_id}, {"_id": 0})
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    # Calculate total
    total = sum(item.price * item.quantity for item in order_data.items)
    
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    
    order_dict = {
        "order_id": order_id,
        "user_id": current_user.user_id,
        "seller_id": order_data.seller_id,
        "society_id": current_user.society_id,
        "items": [item.model_dump() for item in order_data.items],
        "total_amount": total,
        "payment_status": "pending",
        "payment_session_id": None,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_dict)
    
    return Order(**order_dict)

@api_router.get("/orders", response_model=List[Order])
async def list_orders(current_user: User = Depends(get_current_user)):
    if current_user.role == "seller":
        seller = await db.sellers.find_one({"user_id": current_user.user_id}, {"_id": 0})
        if seller:
            orders = await db.orders.find({"seller_id": seller["seller_id"]}, {"_id": 0}).to_list(1000)
        else:
            orders = []
    else:
        orders = await db.orders.find({"user_id": current_user.user_id}, {"_id": 0}).to_list(1000)
    
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify access
    if current_user.role == "seller":
        seller = await db.sellers.find_one({"user_id": current_user.user_id}, {"_id": 0})
        if not seller or order["seller_id"] != seller["seller_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
    elif order["user_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Order(**order)

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can update order status")
    
    if status not in ["confirmed", "preparing", "ready", "delivered", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    seller = await db.sellers.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if not seller:
        raise HTTPException(status_code=403, detail="Seller not found")
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["seller_id"] != seller["seller_id"]:
        raise HTTPException(status_code=403, detail="You can only update your own orders")
    
    await db.orders.update_one({"order_id": order_id}, {"$set": {"status": status}})
    
    return {"message": "Order status updated successfully"}

# ============= PAYMENT ROUTES =============

@api_router.post("/payments/checkout")
async def create_checkout(request: Request, order_id: str, current_user: User = Depends(get_current_user)):
    # Get order
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["user_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if order["payment_status"] == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")
    
    # Get host URL from request
    body = await request.json()
    host_url = body.get("host_url")
    
    if not host_url:
        raise HTTPException(status_code=400, detail="host_url required")
    
    # Create Stripe checkout
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    success_url = f"{host_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/payment/cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=order["total_amount"],
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": order_id,
            "user_id": current_user.user_id
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction
    transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
    await db.payment_transactions.insert_one({
        "transaction_id": transaction_id,
        "session_id": session.session_id,
        "order_id": order_id,
        "user_id": current_user.user_id,
        "amount": order["total_amount"],
        "currency": "usd",
        "payment_status": "pending",
        "metadata": {"order_id": order_id},
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Update order with session ID
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"payment_session_id": session.session_id}}
    )
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def check_payment_status(session_id: str, current_user: User = Depends(get_current_user)):
    # Check if already processed
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["payment_status"] == "paid":
        return {"status": "paid", "order_id": transaction.get("order_id")}
    
    # Get status from Stripe
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    status = await stripe_checkout.get_checkout_status(session_id)
    
    if status.payment_status == "paid" and transaction["payment_status"] != "paid":
        # Update transaction
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid"}}
        )
        
        # Update order
        order_id = transaction.get("order_id")
        if order_id:
            await db.orders.update_one(
                {"order_id": order_id},
                {"$set": {"payment_status": "paid", "status": "confirmed"}}
            )
    
    return {"status": status.payment_status, "order_id": transaction.get("order_id")}

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            # Update transaction and order
            transaction = await db.payment_transactions.find_one({"session_id": webhook_response.session_id}, {"_id": 0})
            
            if transaction and transaction["payment_status"] != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "paid"}}
                )
                
                order_id = transaction.get("order_id")
                if order_id:
                    await db.orders.update_one(
                        {"order_id": order_id},
                        {"$set": {"payment_status": "paid", "status": "confirmed"}}
                    )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ============= ADMIN ROUTES =============

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_societies = await db.societies.count_documents({})
    pending_societies = await db.societies.count_documents({"status": "pending"})
    total_sellers = await db.sellers.count_documents({})
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    
    return {
        "total_societies": total_societies,
        "pending_societies": pending_societies,
        "total_sellers": total_sellers,
        "total_users": total_users,
        "total_orders": total_orders
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()