# data.py

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
            "CASH": {"start": 100, "end": 100}
        },
        "signals": [
            "Technology-focused assets fell more than the broader market.",
            "Defensive assets held up better during this period."
        ],
        "hints": [
            "Look into whether interest-rate expectations changed during this week.",
            "Check whether large technology companies had earnings or guidance updates.",
            "Compare how diversified funds behaved against concentrated growth exposure."
        ],
        "reflection_prompt": "What would you research before choosing a higher-risk portfolio in a week like this?"
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
            "CASH": {"start": 100, "end": 100}
        },
        "signals": [
            "Growth assets outperformed broader funds.",
            "Lower-risk assets moved less than high-volatility assets."
        ],
        "hints": [
            "Look into what news may have improved market sentiment that day.",
            "Check whether technology or growth sectors released positive updates.",
            "Compare the upside of concentration against the stability of diversification."
        ],
        "reflection_prompt": "Would you have been comfortable taking more risk before knowing the result?"
    }
}