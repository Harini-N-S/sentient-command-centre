"""
System Overview Router
-----------------------------------------------------------------------------
GET /api/overview - Aggregate intelligence metrics for Command Centre dashboards.
"""

import sqlite3
from fastapi import APIRouter, Depends
from backend.app.database import get_db
from backend.app.repositories.overview_repo import OverviewRepository
from backend.app.schemas.overview import OverviewResponse

router = APIRouter(prefix="/api/overview", tags=["Overview"])


@router.get("", response_model=OverviewResponse, summary="Platform Overview & Aggregate Metrics")
def get_overview(db: sqlite3.Connection = Depends(get_db)):
    """
    Computes real-time system metrics directly from the synthetic banking database.
    Includes totals for customers, accounts, transactions, alerts by severity, and fraud signals.
    """
    metrics = OverviewRepository.get_overview_metrics(db)
    return OverviewResponse(**metrics)
