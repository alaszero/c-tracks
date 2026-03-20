"""Sistema de permisos granular basado en rol + recurso + acción."""

from enum import Enum
from functools import wraps
from typing import List, Optional

from fastapi import Depends

from app.core.exceptions import ForbiddenException
from app.core.security import get_current_active_user


class Role(str, Enum):
    SUPER_ADMIN = "super_admin"
    ORG_ADMIN = "org_admin"
    FINANCE = "finance"
    OPERATIONS = "operations"
    VIEWER = "viewer"


class Action(str, Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    EXPORT = "export"


# Matriz de permisos: rol → recurso → acciones permitidas
PERMISSIONS = {
    Role.SUPER_ADMIN: {
        "*": [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT],
    },
    Role.ORG_ADMIN: {
        "*": [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT],
    },
    Role.FINANCE: {
        "invoices": [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT],
        "expenses": [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT],
        "suppliers": [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
        "dashboard": [Action.READ],
        "reports": [Action.READ, Action.EXPORT],
        "machinery": [Action.READ],
        "projects": [Action.READ],
        "services": [Action.READ],
    },
    Role.OPERATIONS: {
        "machinery": [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT],
        "projects": [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT],
        "services": [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT],
        "dashboard": [Action.READ],
        "reports": [Action.READ, Action.EXPORT],
        "invoices": [Action.READ],
        "expenses": [Action.READ],
    },
    Role.VIEWER: {
        "dashboard": [Action.READ],
        "reports": [Action.READ],
        "machinery": [Action.READ],
        "projects": [Action.READ],
        "services": [Action.READ],
        "invoices": [Action.READ],
        "expenses": [Action.READ],
    },
}


def has_permission(role: str, resource: str, action: Action) -> bool:
    """Verifica si un rol tiene permiso sobre un recurso y acción."""
    role_enum = Role(role)
    role_perms = PERMISSIONS.get(role_enum, {})

    # Wildcard: acceso a todo
    if "*" in role_perms:
        return action in role_perms["*"]

    resource_perms = role_perms.get(resource, [])
    return action in resource_perms


def require_permission(resource: str, action: Action):
    """Dependencia FastAPI: verifica permisos antes de ejecutar el endpoint."""
    async def permission_checker(current_user=Depends(get_current_active_user)):
        if not has_permission(current_user.role, resource, action):
            raise ForbiddenException(
                f"No tienes permiso para {action.value} en {resource}"
            )
        return current_user
    return permission_checker


def require_role(allowed_roles: List[Role]):
    """Dependencia FastAPI: verifica que el usuario tenga uno de los roles permitidos."""
    async def role_checker(current_user=Depends(get_current_active_user)):
        if Role(current_user.role) not in allowed_roles:
            raise ForbiddenException(
                f"Se requiere rol: {', '.join(r.value for r in allowed_roles)}"
            )
        return current_user
    return role_checker
