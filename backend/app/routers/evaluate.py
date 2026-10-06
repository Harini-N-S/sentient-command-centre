"""
Evaluation Router
-----------------------------------------------------------------------------
Exposes the Phase 3 Deterministic Fraud Intelligence Engine to external callers.
Zero LLM. 100% deterministic rules, correlation, and scoring.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.services.evaluation_service import evaluation_service
from backend.app.schemas.evaluate import TransactionEvaluationResponse, CustomerEvaluationResponse

router = APIRouter(prefix="/api/evaluate", tags=["Deterministic Fraud Engine Evaluation"])


@router.post(
    "/transaction/{transaction_id}",
    response_model=TransactionEvaluationResponse,
    summary="Evaluate Single Transaction with Deterministic Rules"
)
def evaluate_transaction(transaction_id: str):
    """
    Executes the full Phase 3 deterministic rule catalog against a single transaction:
    1. Fetches transaction context from the database.
    2. Runs all 11 registered deterministic fraud rules.
    3. Correlates signals and computes the composite risk score.
    4. Assembles the 3-tier forensic evidence packet.
    5. Returns structured evaluation and scoring breakdown.
    """
    result = evaluation_service.evaluate_transaction(transaction_id.strip())
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID '{transaction_id}' was not found in the database."
        )

    return TransactionEvaluationResponse(**result)


@router.post(
    "/customer/{customer_id}",
    response_model=CustomerEvaluationResponse,
    summary="Evaluate Customer Activity with Deterministic Rules"
)
def evaluate_customer(
    customer_id: str,
    limit: int = Query(10, ge=1, le=50, description="Number of recent transactions to evaluate")
):
    """
    Evaluates customer's recent transactional activity against the deterministic engine:
    1. Gathers customer's latest transactions.
    2. Evaluates each transaction through the rule engine.
    3. Aggregates contributing signals, peak score, and overall severity.
    4. Provides transparent forensic explanation of contributing factors.
    """
    result = evaluation_service.evaluate_customer(customer_id.strip(), limit=limit)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' was not found in the database."
        )

    return CustomerEvaluationResponse(**result)
