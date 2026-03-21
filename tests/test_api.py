"""
test_api.py — Integration tests for the Financial Triage API.
"""

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine, SessionLocal
from app.main import app
from seed_db import seed


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Seed a fresh database before running tests."""
    seed()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    return TestClient(app)


def _get_bank_id(bank_name: str) -> str:
    """Helper to look up a bank account UUID by name."""
    from app.models import Account

    db = SessionLocal()
    account = db.query(Account).filter(Account.bank_name == bank_name).first()
    db.close()
    assert account is not None, f"{bank_name} not found in database"
    return account.id


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestTransactionsEndpoint:
    def test_bank_a_returns_200_and_valid_json(self, client):
        bank_a_id = _get_bank_id("Bank A")
        response = client.get(f"/api/v1/transactions/{bank_a_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["account"]["bank_name"] == "Bank A"
        assert data["transaction_count"] == 10
        assert len(data["transactions"]) == 10

    def test_bank_b_returns_200_and_valid_json(self, client):
        bank_b_id = _get_bank_id("Bank B")
        response = client.get(f"/api/v1/transactions/{bank_b_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["account"]["bank_name"] == "Bank B"
        assert data["transaction_count"] == 20
        assert len(data["transactions"]) == 20

    def test_nonexistent_account_returns_404(self, client):
        response = client.get("/api/v1/transactions/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404
        assert response.json()["detail"] == "Account not found"

    def test_transaction_fields_are_present(self, client):
        bank_a_id = _get_bank_id("Bank A")
        response = client.get(f"/api/v1/transactions/{bank_a_id}")
        txn = response.json()["transactions"][0]

        required_fields = [
            "id", "account_id", "date", "description",
            "amount_pence", "currency", "category",
            "transaction_type", "payment_network", "status",
        ]
        for field in required_fields:
            assert field in txn, f"Missing field: {field}"

    def test_all_transactions_are_cleared(self, client):
        bank_a_id = _get_bank_id("Bank A")
        response = client.get(f"/api/v1/transactions/{bank_a_id}")
        for txn in response.json()["transactions"]:
            assert txn["status"] == "CLEARED"

    def test_amounts_are_integers_in_pence(self, client):
        bank_a_id = _get_bank_id("Bank A")
        response = client.get(f"/api/v1/transactions/{bank_a_id}")
        for txn in response.json()["transactions"]:
            assert isinstance(txn["amount_pence"], int)
