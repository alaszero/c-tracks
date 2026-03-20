"""Tests básicos de autenticación."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Verificar que el health check responde."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "C-Tracks"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Login con credenciales inválidas debe retornar 401."""
    response = await client.post(
        "/api/auth/login",
        json={"email": "noexiste@test.com", "password": "wrongpass"},
    )
    assert response.status_code == 401
