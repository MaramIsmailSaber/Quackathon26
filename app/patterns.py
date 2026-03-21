"""
patterns.py — Functions for detecting recurring transaction patterns.

Business logic for analyzing transaction data to find recurring expenses/income.
"""

from collections import defaultdict
from datetime import datetime
from typing import Dict, List

from sqlalchemy.orm import Session

from app.models import Transaction


def detect_recurring_patterns(db: Session, account_id: str) -> List[Dict]:
    """
    Detect recurring transactions based on similar description, amount, and date intervals.
    
    Groups transactions by (description, amount_pence) and checks for approximate monthly recurrence.
    
    Args:
        db: Database session.
        account_id: UUID of the account.
    
    Returns:
        List of dictionaries with pattern details.
    """
    # Fetch transactions (reuse existing service if possible, but inline for simplicity)
    transactions = (
        db.query(Transaction)
        .filter(Transaction.account_id == account_id)
        .order_by(Transaction.date.desc())
        .all()
    )
    
    # Group by (description, amount_pence)
    groups = defaultdict(list)
    
    for txn in transactions:
        key = (txn.description, txn.amount_pence)
        groups[key].append(txn)
    
    patterns = []
    for (desc, amount), txns in groups.items():
        if len(txns) < 2:
            continue  # Not recurring
        
        # Sort by date
        txns_sorted = sorted(txns, key=lambda t: datetime.fromisoformat(t.date.rstrip('Z')))
        dates = [datetime.fromisoformat(t.date.rstrip('Z')) for t in txns_sorted]
        
        # Check for approximate monthly recurrence (28-35 days apart)
        intervals = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
        if intervals and all(28 <= interval <= 35 for interval in intervals):
            patterns.append({
                "description": desc,
                "amount_pence": amount,
                "category": txns[0].category,
                "transaction_type": txns[0].transaction_type,
                "occurrences": len(txns),
                "dates": [t.date for t in txns_sorted],
                "pattern_type": "Monthly Recurring"
            })
    
    return patterns