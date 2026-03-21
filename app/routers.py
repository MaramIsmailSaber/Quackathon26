"""
routers.py — HTTP routing and display logic ONLY.

No database queries or business logic. Delegates everything to services.py.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import AccountOut, CategorizedTransactionsResponse, TransactionListResponse, TransactionOut
from app.services import get_account_by_id, get_categorized_transactions, get_transactions_by_account
from app.patterns import detect_recurring_patterns

logger = logging.getLogger("bank_app.routers")

router = APIRouter(prefix="/api/v1", tags=["Transactions"])


@router.get(
    "/transactions/{bank_id}",
    response_model=TransactionListResponse,
    summary="Get all transactions for a bank account",
)
def list_transactions(bank_id: str, db: Session = Depends(get_db)):
    """
    Returns every CLEARED transaction for the given account UUID.
    """
    logger.info("GET /transactions/%s — request received", bank_id)

    account = get_account_by_id(db, bank_id)
    if account is None:
        logger.warning("Account not found: %s", bank_id)
        raise HTTPException(status_code=404, detail="Account not found")

    transactions = get_transactions_by_account(db, bank_id)

    logger.info(
        "Returning %d transactions for account %s",
        len(transactions),
        bank_id,
    )

    return TransactionListResponse(
        account=AccountOut.model_validate(account),
        transaction_count=len(transactions),
        transactions=[TransactionOut.model_validate(t) for t in transactions],
    )


@router.get(
    "/transactions/{bank_id}/analysis",
    response_model=CategorizedTransactionsResponse,
    summary="Get categorized transactions and recurring patterns for a bank account",
)
def analyze_transactions(bank_id: str, db: Session = Depends(get_db)):
    """
    Returns transactions grouped by category (with auto-categorization) and detected recurring patterns.
    """
    logger.info("GET /transactions/%s/analysis — request received", bank_id)

    account = get_account_by_id(db, bank_id)
    if account is None:
        logger.warning("Account not found: %s", bank_id)
        raise HTTPException(status_code=404, detail="Account not found")

    categorized = get_categorized_transactions(db, bank_id)
    patterns = detect_recurring_patterns(db, bank_id)

    # Convert Transaction objects to TransactionOut for response
    categorized_out = {cat: [TransactionOut.model_validate(t) for t in txns] for cat, txns in categorized.items()}

    logger.info(
        "Returning analysis for account %s: %d categories, %d patterns",
        bank_id, len(categorized), len(patterns),
    )

    return CategorizedTransactionsResponse(
        account=AccountOut.model_validate(account),
        categorized=categorized_out,
        patterns=patterns,
    )
