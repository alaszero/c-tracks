"""Script para crear el super admin inicial."""

import asyncio
import sys

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User


async def create_superadmin():
    print("╔══════════════════════════════════════╗")
    print("║   C-Tracks — Crear Super Admin       ║")
    print("╚══════════════════════════════════════╝")

    email = input("Email: ").strip()
    full_name = input("Nombre completo: ").strip()
    password = input("Contraseña: ").strip()

    if not email or not full_name or not password:
        print("❌ Todos los campos son requeridos")
        sys.exit(1)

    if len(password) < 6:
        print("❌ La contraseña debe tener al menos 6 caracteres")
        sys.exit(1)

    async with AsyncSessionLocal() as db:
        # Verificar si ya existe
        result = await db.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            print(f"❌ Ya existe un usuario con el email {email}")
            sys.exit(1)

        user = User(
            email=email,
            hashed_password=hash_password(password),
            full_name=full_name,
            role="super_admin",
            is_active=True,
        )
        db.add(user)
        await db.commit()

        print(f"✅ Super admin creado: {email}")


if __name__ == "__main__":
    asyncio.run(create_superadmin())
