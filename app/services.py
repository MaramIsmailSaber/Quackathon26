"""
services.py — Business logic and data access ONLY.

No HTTP or routing concerns belong here.
"""

import logging

from sqlalchemy.orm import Session

from app.models import Account, Transaction

logger = logging.getLogger("bank_app.services")


def get_account_by_id(db: Session, account_id: str) -> Account | None:
    """Fetch a single account by its UUID."""
    try:
        return db.query(Account).filter(Account.id == account_id).first()
    except Exception:
        logger.error("Failed to fetch account %s", account_id, exc_info=True)
        raise


def get_transactions_by_account(db: Session, account_id: str) -> list[Transaction]:
    """Fetch all CLEARED transactions for a given account, newest first."""
    try:
        return (
            db.query(Transaction)
            .filter(Transaction.account_id == account_id)
            .order_by(Transaction.date.desc())
            .all()
        )
    except Exception:
        logger.error(
            "Failed to fetch transactions for account %s",
            account_id,
            exc_info=True,
        )
        raise
