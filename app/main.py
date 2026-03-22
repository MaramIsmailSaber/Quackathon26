import json
import sys
import os
from typing import Dict, Any
from collections import defaultdict

# Add parent directory to path so we can import from Investment.Backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from Investment.Backend.data import SCENARIOS
from Investment.Backend.portfolios import PORTFOLIOS
from Investment.Backend.simulator import simulate_portfolio, list_scenarios

INPUT_FILE = "transactions.json"
OUTPUT_FILE = "insights.json"

INVESTMENT_STARTING_AMOUNT = 1000

PORTFOLIOS = {
    "safe": {
        "ETF": 0.60,
        "DEFENSIVE": 0.30,
        "CASH": 0.10,
    },
    "balanced": {
        "ETF": 0.50,
        "DEFENSIVE": 0.25,
        "TECH": 0.25,
    },
    "risky": {
        "ETF": 0.20,
        "TECH": 0.50,
        "VOLATILE": 0.30,
    },
}

SCENARIOS = {
    "week_tech_drop": {
        "id": "week_tech_drop",
        "type": "weekly",
        "title": "Growth-heavy week",
        "start_date": "2025-01-06",
        "end_date": "2025-01-13",
        "summary": "A week where growth assets fell harder than broader funds.",
        "assets": {
            "ETF": {"start": 100, "end": 101},
            "DEFENSIVE": {"start": 100, "end": 102},
            "TECH": {"start": 100, "end": 91},
            "VOLATILE": {"start": 100, "end": 87},
            "CASH": {"start": 100, "end": 100},
        },
        "signals": [
            "Technology-focused assets fell more than the broader market.",
            "Defensive assets held up better during this period.",
        ],
        "hints": [
            "Look into whether interest-rate expectations changed during this week.",
            "Check whether large technology companies had earnings or guidance updates.",
            "Compare how diversified funds behaved against concentrated growth exposure.",
        ],
        "reflection_prompt": "What would you research before choosing a higher-risk portfolio in a week like this?",
    },
    "day_market_rally": {
        "id": "day_market_rally",
        "type": "daily",
        "title": "Strong market day",
        "start_date": "2025-02-10",
        "end_date": "2025-02-11",
        "summary": "A day where higher-growth assets outperformed.",
        "assets": {
            "ETF": {"start": 100, "end": 101.5},
            "DEFENSIVE": {"start": 100, "end": 100.5},
            "TECH": {"start": 100, "end": 104},
            "VOLATILE": {"start": 100, "end": 106},
            "CASH": {"start": 100, "end": 100},
        },
        "signals": [
            "Growth assets outperformed broader funds.",
            "Lower-risk assets moved less than high-volatility assets.",
        ],
        "hints": [
            "Look into what news may have improved market sentiment that day.",
            "Check whether technology or growth sectors released positive updates.",
            "Compare the upside of concentration against the stability of diversification.",
        ],
        "reflection_prompt": "Would you have been comfortable taking more risk before knowing the result?",
    },
}

def is_money_in(amount_pence: int) -> bool:
    return amount_pence > 0


def is_money_out(amount_pence: int) -> bool:
    return amount_pence < 0


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

def calculate_asset_multiplier(asset_data: Dict[str, Any]) -> float:
    return asset_data["end"] / asset_data["start"]


def simulate_portfolio(
    scenario_id: str,
    portfolio_name: str,
    starting_amount: float = INVESTMENT_STARTING_AMOUNT,
) -> Dict[str, Any]:
    scenario = SCENARIOS[scenario_id]
    portfolio = PORTFOLIOS[portfolio_name]

    breakdown = []
    final_value = 0.0

    for asset_name, weight in portfolio.items():
        asset_data = scenario["assets"][asset_name]
        multiplier = calculate_asset_multiplier(asset_data)
        invested_amount = starting_amount * weight
        end_value = invested_amount * multiplier

        breakdown.append({
            "asset": asset_name,
            "weight": weight,
            "start_price": asset_data["start"],
            "end_price": asset_data["end"],
            "invested_amount": round(invested_amount, 2),
            "end_value": round(end_value, 2),
            "return_percent": round((multiplier - 1) * 100, 2),
        })

        final_value += end_value

    change = final_value - starting_amount
    percent_change = (change / starting_amount) * 100

    return {
        "scenario": {
            "id": scenario["id"],
            "title": scenario["title"],
            "type": scenario["type"],
            "start_date": scenario["start_date"],
            "end_date": scenario["end_date"],
            "summary": scenario["summary"],
        },
        "portfolio": portfolio_name,
        "starting_amount": round(starting_amount, 2),
        "final_value": round(final_value, 2),
        "change": round(change, 2),
        "percent_change": round(percent_change, 2),
        "breakdown": breakdown,
        "insight_pack": {
            "signals": scenario["signals"],
            "hints": scenario["hints"],
            "reflection_prompt": scenario["reflection_prompt"],
        },
    }


def generate_investment_demo() -> Dict[str, Any]:
    scenario_summaries = []
    simulations = []

    for scenario_id, scenario in SCENARIOS.items():
        scenario_summaries.append({
            "id": scenario["id"],
            "title": scenario["title"],
            "type": scenario["type"],
            "start_date": scenario["start_date"],
            "end_date": scenario["end_date"],
            "summary": scenario["summary"],
        })

        for portfolio_name in PORTFOLIOS.keys():
            simulations.append(
                simulate_portfolio(
                    scenario_id=scenario_id,
                    portfolio_name=portfolio_name,
                    starting_amount=INVESTMENT_STARTING_AMOUNT,
                )
            )

    return {
        "starting_amount": INVESTMENT_STARTING_AMOUNT,
        "available_portfolios": PORTFOLIOS,
        "available_scenarios": scenario_summaries,
        "simulations": simulations,
    }

def main():
    payload = load_transactions_from_file()
    transaction_insights = generate_insights(payload)
    investment_demo = generate_investment_demo()

    combined_output = {
        "transaction_insights": transaction_insights,
        "investment_demo": investment_demo,
    }

    print(json.dumps(combined_output, indent=2))
    save_insights_to_file(combined_output)
    print(f"\nInsights saved to {OUTPUT_FILE}")
    transaction_insights = generate_insights(payload)
    investment_demo = generate_investment_demo()

    combined_output = {
        "transaction_insights": transaction_insights,
        "investment_demo": investment_demo,
    }

    print(json.dumps(combined_output, indent=2))
    save_insights_to_file(combined_output)
    print(f"\nInsights saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()