"""
routers.py — HTTP routing and display logic ONLY.

No database queries or business logic. Delegates everything to services.py.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import AccountOut, TransactionListResponse, TransactionOut
from app.services import get_account_by_id, get_transactions_by_account

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
