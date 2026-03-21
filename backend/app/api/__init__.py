from fastapi import APIRouter
from app.api import auth, users, machinery, projects, services, invoices, expenses, reports

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(machinery.router, prefix="/machinery", tags=["Machinery"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(services.router, prefix="/services", tags=["Services"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
