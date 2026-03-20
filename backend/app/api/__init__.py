from fastapi import APIRouter
from app.api import auth, users, machinery

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(machinery.router, prefix="/machinery", tags=["Machinery"])
