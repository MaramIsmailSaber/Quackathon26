"""
models.py — SQLAlchemy ORM models for User, Account, and Transaction.

All primary/foreign keys are UUID v4.
Financial amounts are stored as integers in pence (lowest denomination).
Timestamps are ISO 8601 UTC strings.
"""

import uuid

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    created_at = Column(String(30), nullable=False)

    accounts = relationship("Account", back_populates="owner")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    bank_name = Column(String(100), nullable=False)
    sort_code = Column(String(8), nullable=False)
    account_number = Column(String(8), nullable=False)
    balance_pence = Column(Integer, nullable=False, default=0)
    currency = Column(String(3), nullable=False, default="GBP")
    created_at = Column(String(30), nullable=False)

    owner = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    account_id = Column(String(36), ForeignKey("accounts.id"), nullable=False)
    date = Column(String(30), nullable=False)
    description = Column(String(255), nullable=False)
    amount_pence = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False, default="GBP")
    category = Column(String(50), nullable=False)
    transaction_type = Column(String(10), nullable=False)  # CREDIT or DEBIT
    payment_network = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False, default="CLEARED")
    reference = Column(String(100), nullable=True)

    account = relationship("Account", back_populates="transactions")
