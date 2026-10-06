"""Routers Export - Sentient Command Centre"""
from backend.app.routers.health import router as health_router
from backend.app.routers.overview import router as overview_router
from backend.app.routers.alerts import router as alerts_router
from backend.app.routers.transactions import router as transactions_router
from backend.app.routers.customers import router as customers_router
from backend.app.routers.devices import router as devices_router
from backend.app.routers.beneficiaries import router as beneficiaries_router
from backend.app.routers.entities import router as entities_router
from backend.app.routers.signals import router as signals_router
from backend.app.routers.evaluate import router as evaluate_router
from backend.app.routers.evidence import router as evidence_router
from backend.app.routers.search import router as search_router

__all__ = [
    "health_router",
    "overview_router",
    "alerts_router",
    "transactions_router",
    "customers_router",
    "devices_router",
    "beneficiaries_router",
    "entities_router",
    "signals_router",
    "evaluate_router",
    "evidence_router",
    "search_router"
]
