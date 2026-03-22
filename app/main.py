import json
from typing import Dict, Any, List
from collections import defaultdict

INPUT_FILE = "transactions.json"
OUTPUT_FILE = "insights.json"
#test comment

def is_money_in(transaction: Dict[str, Any]) -> bool:
    transaction_type = (transaction.get("transaction_type") or "").upper()
    amount_pence = transaction.get("amount_pence", 0)
    return transaction_type == "CREDIT" or (transaction_type == "" and amount_pence > 0)


def is_money_out(transaction: Dict[str, Any]) -> bool:
    transaction_type = (transaction.get("transaction_type") or "").upper()
    amount_pence = transaction.get("amount_pence", 0)
    return transaction_type == "DEBIT" or (transaction_type == "" and amount_pence < 0)


def normalise_account_key(account: Dict[str, Any]) -> str:
    return (
        account.get("id")
        or account.get("account_number")
        or account.get("iban")
        or "unknown_account"
    )


def summarise_account(account: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": account.get("id"),
        "bank_name": account.get("bank_name"),
        "sort_code": account.get("sort_code"),
        "account_number": account.get("account_number"),
        "iban": account.get("iban"),
        "bic": account.get("bic"),
        "currency": account.get("currency"),
        "balance_pence": account.get("balance_pence"),
    }


def load_transactions_from_file() -> Any:
    with open(INPUT_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def normalise_payload(payload: Any) -> List[Dict[str, Any]]:
    if isinstance(payload, list):
        if payload and isinstance(payload[0], dict) and "account" in payload[0] and "transactions" in payload[0]:
            return payload
        return [{"account": {}, "transactions": payload}]

    if isinstance(payload, dict):
        return [payload]

    return [{"account": {}, "transactions": []}]


def build_empty_summary() -> Dict[str, Any]:
    return {
        "overall_money_in": 0,
        "overall_money_out": 0,
        "money_in_by_account": defaultdict(int),
        "money_out_by_account": defaultdict(int),
        "transaction_count_by_account": defaultdict(int),
        "date_summary": defaultdict(lambda: {"money_in_pence": 0, "money_out_pence": 0}),
        "money_in_by_category": defaultdict(
            lambda: {"total_pence": 0, "by_merchant": defaultdict(int)}
        ),
        "money_out_by_category": defaultdict(
            lambda: {"total_pence": 0, "by_merchant": defaultdict(int)}
        ),
        "accounts_seen": {},
        "all_transactions": [],
        "currencies_seen": set(),
    }


def add_bundle_to_summary(summary: Dict[str, Any], bundle: Dict[str, Any]) -> None:
    account = bundle.get("account", {}) or {}
    transactions = bundle.get("transactions", []) or []

    account_id = normalise_account_key(account)
    summary["accounts_seen"][account_id] = summarise_account(account)

    if account.get("currency"):
        summary["currencies_seen"].add(account.get("currency"))

    for tx in transactions:
        summary["all_transactions"].append(tx)

        amount_pence = abs(tx.get("amount_pence", 0))
        tx_date = tx.get("date")
        category = tx.get("category") or "uncategorised"
        merchant = tx.get("merchant") or tx.get("description") or "unknown_merchant"
        tx_account_id = tx.get("account_id") or account_id

        summary["transaction_count_by_account"][tx_account_id] += 1

        if is_money_in(tx):
            summary["overall_money_in"] += amount_pence
            summary["money_in_by_account"][tx_account_id] += amount_pence

            if tx_date:
                summary["date_summary"][tx_date]["money_in_pence"] += amount_pence

            summary["money_in_by_category"][category]["total_pence"] += amount_pence
            summary["money_in_by_category"][category]["by_merchant"][merchant] += amount_pence

        elif is_money_out(tx):
            summary["overall_money_out"] += amount_pence
            summary["money_out_by_account"][tx_account_id] += amount_pence

            if tx_date:
                summary["date_summary"][tx_date]["money_out_pence"] += amount_pence

            summary["money_out_by_category"][category]["total_pence"] += amount_pence
            summary["money_out_by_category"][category]["by_merchant"][merchant] += amount_pence


def finalise_summary(summary: Dict[str, Any]) -> Dict[str, Any]:
    all_account_ids = (
        set(summary["money_in_by_account"].keys())
        | set(summary["money_out_by_account"].keys())
        | set(summary["transaction_count_by_account"].keys())
        | set(summary["accounts_seen"].keys())
    )

    per_account = []
    for account_id in sorted(all_account_ids):
        account_info = summary["accounts_seen"].get(account_id, {})
        money_in = summary["money_in_by_account"].get(account_id, 0)
        money_out = summary["money_out_by_account"].get(account_id, 0)

        per_account.append({
            "account_id": account_id,
            "bank_name": account_info.get("bank_name"),
            "sort_code": account_info.get("sort_code"),
            "account_number": account_info.get("account_number"),
            "currency": account_info.get("currency"),
            "balance_pence": account_info.get("balance_pence"),
            "money_in_pence": money_in,
            "money_out_pence": money_out,
            "net_flow_pence": money_in - money_out,
            "transaction_count": summary["transaction_count_by_account"].get(account_id, 0),
        })

    per_date = []
    for tx_date in sorted(summary["date_summary"].keys()):
        money_in = summary["date_summary"][tx_date]["money_in_pence"]
        money_out = summary["date_summary"][tx_date]["money_out_pence"]
        per_date.append({
            "date": tx_date,
            "money_in_pence": money_in,
            "money_out_pence": money_out,
            "net_flow_pence": money_in - money_out,
        })

    formatted_money_in_by_category = {
        category: {
            "total_pence": values["total_pence"],
            "by_merchant": dict(values["by_merchant"]),
        }
        for category, values in summary["money_in_by_category"].items()
    }

    formatted_money_out_by_category = {
        category: {
            "total_pence": values["total_pence"],
            "by_merchant": dict(values["by_merchant"]),
        }
        for category, values in summary["money_out_by_category"].items()
    }

    total_net_flow = summary["overall_money_in"] - summary["overall_money_out"]
    currencies = summary["currencies_seen"]

    return {
        "summary": {
            "currency": next(iter(currencies)) if len(currencies) == 1 else None,
            "transaction_count": len(summary["all_transactions"]),
            "account_count": len(all_account_ids),
            "total_money_in_pence": summary["overall_money_in"],
            "total_money_out_pence": summary["overall_money_out"],
            "net_flow_pence": total_net_flow,
        },
        "per_account": per_account,
        "per_date": per_date,
        "money_in_by_category": formatted_money_in_by_category,
        "money_out_by_category": formatted_money_out_by_category,
        "accounts": list(summary["accounts_seen"].values()),
    }


def generate_insights(payload: Any) -> Dict[str, Any]:
    account_bundles = normalise_payload(payload)

    user_groups = {
        "user_1": account_bundles[0:1],
        "user_2": account_bundles[1:3],
    }

    users_output = {}
    combined_summary = build_empty_summary()

    for user_id, bundles in user_groups.items():
        user_summary = build_empty_summary()

        for bundle in bundles:
            add_bundle_to_summary(user_summary, bundle)
            add_bundle_to_summary(combined_summary, bundle)

        users_output[user_id] = finalise_summary(user_summary)

    overall_output = finalise_summary(combined_summary)

    return {
        "users": users_output,
        "overall": overall_output,
    }


def save_insights_to_file(insights: Dict[str, Any]) -> None:
    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(insights, file, indent=2)


def main():
    payload = load_transactions_from_file()
    insights = generate_insights(payload)
    save_insights_to_file(insights)
    print(f"Insights saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()