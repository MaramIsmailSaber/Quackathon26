"""
services.py — Business logic and data access ONLY.

No HTTP or routing concerns belong here.
"""

import logging
from collections import defaultdict

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


def categorize_transaction(description: str) -> str:
    """
    Auto-categorize a transaction based on description keywords.
    Expand this dictionary as needed for more categories.
    """
    keyword_to_category = {
        "groceries": ["aldi", "lidl", "sainsbury", "tesco", "asda", "morrisons"],
        "transport": ["xplore", "lothian buses", "scotrail", "bus", "train", "ticket"],
        "shopping": ["amazon", "waterstones", "boots"],
        "eating out": ["brewdog", "greggs", "nando", "pret a manger", "phoenix bar"],
        "entertainment": ["odeon", "film", "cinema"],
        "subscriptions": ["spotify", "netflix", "icloud", "ee mobile"],
        "utilities": ["scottish water", "broadband", "electricity", "gas"],
        "housing": ["rent", "accommodation"],
        "health": ["pharmacy", "doctor", "nhs"],
        "education": ["university", "library", "textbook", "dundee"],
        "income": ["wages", "loan", "saas", "salary"],
        "transfers": ["transfer"],
    }
    
    desc_lower = description.lower()
    for category, keywords in keyword_to_category.items():
        if any(keyword in desc_lower for keyword in keywords):
            return category.capitalize()  # e.g., "Groceries"
    return "Other"  # Default if no match


def get_categorized_transactions(db: Session, account_id: str) -> dict[str, list[Transaction]]:
    """
    Fetch transactions and group by category. Auto-categorize if category is missing or 'Other'.
    """
    transactions = get_transactions_by_account(db, account_id)
    categorized = defaultdict(list)
    
    for txn in transactions:
        category = txn.category if txn.category != "Other" else categorize_transaction(txn.description)
        categorized[category].append(txn)
    
    return dict(categorized)
