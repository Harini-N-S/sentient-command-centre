"""
Fraud Signals Router
-----------------------------------------------------------------------------
Endpoints for querying deterministic fraud rule signals and granular rule metrics.
"""

import sqlite3
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from backend.app.database import get_db
from backend.app.dependencies.deps import get_pagination_params
from backend.app.repositories.signal_repo import SignalRepository
from backend.app.schemas.signal import SignalSummary, SignalDetail
from backend.app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/api/signals", tags=["Fraud Signals"])


@router.get("", response_model=PaginatedResponse[SignalSummary], summary="List & Filter Fraud Signals")
def list_signals(
    rule_code: Optional[str] = Query(None, description="Filter by rule code (e.g. R-VEL-01, R-ATO-05)"),
    rule_category: Optional[str] = Query(None, description="Velocity, Device_Risk, Geographic_Travel, Mule_Network, etc."),
    severity: Optional[str] = Query(None, description="LOW, MEDIUM, HIGH, CRITICAL"),
    transaction_id: Optional[str] = Query(None, description="Filter by transaction ID"),
    customer_id: Optional[str] = Query(None, description="Filter by customer ID"),
    alert_id: Optional[str] = Query(None, description="Filter by alert ID"),
    sort_by: str = Query("created_at", description="Sort field: created_at, confidence_score, severity, signal_id"),
    sort_order: str = Query("DESC", description="Sort direction: ASC or DESC"),
    pagination: dict = Depends(get_pagination_params),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Retrieves paginated fraud signals fired by deterministic rule checks.
    """
    valid_severities = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
    if severity and severity.upper() not in valid_severities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid severity '{severity}'. Must be one of: {sorted(list(valid_severities))}"
        )

    items, meta = SignalRepository.get_signals(
        db=db,
        page=pagination["page"],
        page_size=pagination["page_size"],
        rule_code=rule_code,
        rule_category=rule_category,
        severity=severity,
        transaction_id=transaction_id,
        customer_id=customer_id,
        alert_id=alert_id,
        sort_by=sort_by,
        sort_order=sort_order
    )

    return PaginatedResponse(
        items=[SignalSummary(**item) for item in items],
        pagination=meta
    )


@router.get("/{signal_id}", response_model=SignalDetail, summary="Get Fraud Signal Forensic Detail")
def get_signal_detail(
    signal_id: str,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Retrieves full details of a specific fraud signal including firing parameters,
    mathematical confidence, and parent alert/transaction/customer context.
    """
    signal = SignalRepository.get_signal_by_id(db, signal_id.strip())
    if not signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fraud signal with ID '{signal_id}' was not found in the database."
        )

    return SignalDetail(**signal)
