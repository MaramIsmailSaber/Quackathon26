"""
seed_db.py — Creates the SQLite database and seeds it with 30 realistic
transactions for a Scottish university student.

Bank A: Primary current account (10 transactions)
Bank B: External accounts / friends (20 transactions)

Usage:
    python seed_db.py
"""

import uuid
from datetime import datetime, timezone

from app.database import Base, engine, SessionLocal
from app.models import User, Account, Transaction


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def seed():
    # ── Recreate all tables ──────────────────────────────────────────
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # ── Users ────────────────────────────────────────────────────
        user = User(
            id=str(uuid.uuid4()),
            full_name="Abishik Sharma",
            email="abishik.sharma@dundee.ac.uk",
            created_at=utcnow_iso(),
        )
        db.add(user)
        db.flush()

        # ── Accounts ────────────────────────────────────────────────
        bank_a = Account(
            id=str(uuid.uuid4()),
            user_id=user.id,
            bank_name="Bank A",
            sort_code="80-22-60",
            account_number="12345678",
            balance_pence=184_520,  # £1,845.20
            currency="GBP",
            created_at=utcnow_iso(),
        )
        bank_b = Account(
            id=str(uuid.uuid4()),
            user_id=user.id,
            bank_name="Bank B",
            sort_code="83-41-00",
            account_number="87654321",
            balance_pence=63_210,  # £632.10
            currency="GBP",
            created_at=utcnow_iso(),
        )
        db.add_all([bank_a, bank_b])
        db.flush()

        # ── Helper ──────────────────────────────────────────────────
        def txn(account, date, desc, amount_pence, category, txn_type, network, ref=None):
            return Transaction(
                id=str(uuid.uuid4()),
                account_id=account.id,
                date=date,
                description=desc,
                amount_pence=amount_pence,
                currency="GBP",
                category=category,
                transaction_type=txn_type,
                payment_network=network,
                status="CLEARED",
                reference=ref,
            )

        # ── Bank A — 10 Transactions (Primary Account) ─────────────
        bank_a_txns = [
            txn(bank_a, "2026-03-01T09:00:00Z", "SAAS Maintenance Loan – Spring Term",
                191_625, "Income", "CREDIT", "BACS Direct Credit", "SAAS-2026-SPR"),
            txn(bank_a, "2026-03-01T12:00:00Z", "Aldi Dundee – Groceries",
                3_847, "Groceries", "DEBIT", "Visa Debit", None),
            txn(bank_a, "2026-03-03T08:30:00Z", "Xplore Dundee – Day Ticket",
                480, "Transport", "DEBIT", "Visa Debit", None),
            txn(bank_a, "2026-03-05T10:00:00Z", "Grant Property – March Rent",
                55_000, "Housing", "DEBIT", "BACS Direct Debit", "RENT-MAR-2026"),
            txn(bank_a, "2026-03-06T18:45:00Z", "The Phoenix Bar – Drinks",
                1_620, "Entertainment", "DEBIT", "Visa Debit", None),
            txn(bank_a, "2026-03-08T14:00:00Z", "Amazon.co.uk – Textbook",
                2_499, "Education", "DEBIT", "Visa Debit", "AMZ-304-1928475"),
            txn(bank_a, "2026-03-10T09:00:00Z", "Spotify Premium – Monthly",
                599, "Subscriptions", "DEBIT", "BACS Direct Debit", "SPOTIFY-MAR"),
            txn(bank_a, "2026-03-12T11:30:00Z", "Transfer to Flatmate – Utilities Share",
                4_250, "Transfers", "DEBIT", "Faster Payments", "UTILS-MAR-SPLIT"),
            txn(bank_a, "2026-03-15T16:00:00Z", "University of Dundee – Library Fine",
                350, "Education", "DEBIT", "Visa Debit", None),
            txn(bank_a, "2026-03-18T20:00:00Z", "Part-time Wages – Tesco Express",
                48_750, "Income", "CREDIT", "BACS Direct Credit", "TESCO-PAY-MAR"),
        ]

        # ── Bank B — 20 Transactions (External / Friends) ──────────
        bank_b_txns = [
            txn(bank_b, "2026-03-01T10:15:00Z", "Lidl Edinburgh – Weekly Shop",
                2_963, "Groceries", "DEBIT", "Visa Debit", None),
            txn(bank_b, "2026-03-02T07:45:00Z", "Lothian Buses – Monthly Pass",
                5_500, "Transport", "DEBIT", "Visa Debit", None),
            txn(bank_b, "2026-03-02T19:30:00Z", "Brewdog Edinburgh – Dinner",
                2_480, "Eating Out", "DEBIT", "Visa Debit", None),
            txn(bank_b, "2026-03-03T09:00:00Z", "Netflix – Monthly Subscription",
                1_099, "Subscriptions", "DEBIT", "BACS Direct Debit", "NETFLIX-MAR"),
            txn(bank_b, "2026-03-04T14:20:00Z", "Greggs Edinburgh – Lunch",
                385, "Eating Out", "DEBIT", "Visa Debit", None),
            txn(bank_b, "2026-03-05T11:00:00Z", "Student Accommodation Ltd – March Rent",
                62_500, "Housing", "DEBIT", "BACS Direct Debit", "ACCOM-MAR-2026"),
            txn(bank_b, "2026-03-06T13:00:00Z", "Transfer from Abishik – Gig Tickets",
                3_500, "Transfers", "CREDIT", "Faster Payments", "GIG-TIX-REFUND"),
            txn(bank_b, "2026-03-07T08:00:00Z", "ScotRail – Edinburgh to Glasgow Return",
                2_870, "Transport", "DEBIT", "Visa Debit", None),
            txn(bank_b, "2026-03-08T17:30:00Z", "Sainsbury's Local – Essentials",
                1_245, "Groceries", "DEBIT", "Visa Debit", None),
            txn(bank_b, "2026-03-09T20:00:00Z", "Odeon Edinburgh – Film Night",
                1_150, "Entertainment", "DEBIT", "Visa Debit", None),
            txn(bank_b, "2026-03-10T09:30:00Z", "Apple iCloud+ – Monthly",
                299, "Subscriptions", "DEBIT", "BACS Direct Debit", "ICLOUD-MAR"),
            txn(bank_b, "2026-03-11T15:00:00Z", "EE Mobile – Monthly Bill",
                1_800, "Utilities", "DEBIT", "BACS Direct Debit", "EE-MAR-2026"),
            txn(bank_b, "2026-03-12T10:00:00Z", "SAAS Maintenance Loan – Spring Term",
                191_625, "Income", "CREDIT", "BACS Direct Credit", "SAAS-2026-SPR"),
            txn(bank_b, "2026-03-13T12:45:00Z", "Boots – Pharmacy",
                895, "Health", "DEBIT", "Visa Debit", None),
            txn(bank_b, "2026-03-14T16:00:00Z", "Transfer to Flatmate – Broadband Split",
                1_750, "Transfers", "DEBIT", "Faster Payments", "BB-MAR-SPLIT"),
            txn(bank_b, "2026-03-15T11:30:00Z", "Waterstones Edinburgh – Book",
                899, "Education", "DEBIT", "Visa Debit", None),
            txn(bank_b, "2026-03-16T19:00:00Z", "Nando's Edinburgh – Dinner Out",
                1_845, "Eating Out", "DEBIT", "Visa Debit", None),
            txn(bank_b, "2026-03-17T09:00:00Z", "Scottish Water – Quarterly Bill",
                4_200, "Utilities", "DEBIT", "BACS Direct Debit", "SW-Q1-2026"),
            txn(bank_b, "2026-03-18T14:00:00Z", "Part-time Wages – Costa Coffee",
                36_400, "Income", "CREDIT", "BACS Direct Credit", "COSTA-PAY-MAR"),
            txn(bank_b, "2026-03-19T08:30:00Z", "Pret A Manger – Morning Coffee",
                475, "Eating Out", "DEBIT", "Visa Debit", None),
        ]

        db.add_all(bank_a_txns + bank_b_txns)
        db.commit()

        print(f"✓ Database seeded successfully.")
        print(f"  Bank A ({bank_a.bank_name}): {len(bank_a_txns)} transactions  [id: {bank_a.id}]")
        print(f"  Bank B ({bank_b.bank_name}): {len(bank_b_txns)} transactions  [id: {bank_b.id}]")

    except Exception as exc:
        db.rollback()
        print(f"✗ Seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
