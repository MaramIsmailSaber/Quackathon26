"""
schemas.py — Pydantic models for request/response validation.

Amounts are exposed in pence (integer). Frontend converts to pounds for display.
"""

from pydantic import BaseModel, ConfigDict


class TransactionOut(BaseModel):
    """Schema returned for each transaction."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    account_id: str
    date: str
    description: str
    amount_pence: int
    currency: str
    category: str
    transaction_type: str
    payment_network: str
    status: str
    reference: str | None


class AccountOut(BaseModel):
    """Schema returned for account metadata."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    bank_name: str
    sort_code: str
    account_number: str
    balance_pence: int
    currency: str


class TransactionListResponse(BaseModel):
    """Envelope for the GET /transactions/{bank_id} response."""
    account: AccountOut
    transaction_count: int
    transactions: list[TransactionOut]


class TransactionPattern(BaseModel):
    description: str
    amount_pence: int
    category: str
    transaction_type: str
    occurrences: int
    dates: list[str]
    pattern_type: str


class CategorizedTransactionsResponse(BaseModel):
    account: AccountOut
    categorized: dict[str, list[TransactionOut]]
    patterns: list[TransactionPattern]
