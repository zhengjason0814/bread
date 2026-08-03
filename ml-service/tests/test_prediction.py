from app.prediction import QUANTILE_ALPHAS, predict_spend


def steady_month(year, month, days, per_day):
    return [
        {"date": f"{year:04d}-{month:02d}-{day:02d}", "amount": per_day}
        for day in range(1, days + 1)
    ]


def build_history():
    expenses = []
    expenses += steady_month(2026, 1, 31, 10.0)
    expenses += steady_month(2026, 2, 28, 10.0)
    expenses += steady_month(2026, 3, 31, 10.0)
    expenses += steady_month(2026, 4, 30, 10.0)
    expenses += steady_month(2026, 5, 31, 10.0)
    expenses += steady_month(2026, 6, 30, 10.0)
    expenses += steady_month(2026, 7, 16, 10.0)
    return expenses


def test_insufficient_history():
    expenses = steady_month(2026, 6, 30, 10.0) + steady_month(2026, 7, 16, 10.0)
    assert predict_spend(expenses, "2026-07-16") == {"status": "insufficient_data"}


def test_two_complete_months_is_still_insufficient():
    expenses = []
    for month, days in [(5, 31), (6, 30)]:
        expenses += steady_month(2026, month, days, 10.0)
    expenses += steady_month(2026, 7, 16, 10.0)
    assert predict_spend(expenses, "2026-07-16") == {"status": "insufficient_data"}


def test_three_complete_months_unlocks_predictions():
    expenses = []
    for month, days in [(4, 30), (5, 31), (6, 30)]:
        expenses += steady_month(2026, month, days, 10.0)
    expenses += steady_month(2026, 7, 16, 10.0)
    assert predict_spend(expenses, "2026-07-16")["status"] == "ok"


def test_current_month_reports_actual_spend_not_a_forecast():
    result = predict_spend(build_history(), "2026-07-16")
    assert result["status"] == "ok"
    current = result["current_month"]
    assert current == {"spent_so_far": 160.0}
    assert "low" not in current
    assert "high" not in current


def test_next_month_forecast_in_plausible_range():
    result = predict_spend(build_history(), "2026-07-16")
    next_month = result["next_month"]
    assert next_month["low"] <= next_month["mid"] <= next_month["high"]
    assert 150 <= next_month["mid"] <= 450


def build_uneven_history():
    expenses = []
    expenses += steady_month(2026, 3, 31, 10.0)
    expenses += steady_month(2026, 4, 30, 10.0)
    expenses += steady_month(2026, 5, 31, 20.0)
    expenses += steady_month(2026, 6, 30, 42.0)
    expenses += steady_month(2026, 7, 16, 10.0)
    return expenses


UNEVEN_MONTH_TOTALS = [310.0, 300.0, 620.0, 1260.0]


def test_forecast_band_is_the_interquartile_range():
    assert QUANTILE_ALPHAS == [0.25, 0.5, 0.75]


def test_forecast_band_is_tighter_than_the_spread_of_past_months():
    next_month = predict_spend(build_uneven_history(), "2026-07-16")["next_month"]
    history_spread = max(UNEVEN_MONTH_TOTALS) - min(UNEVEN_MONTH_TOTALS)
    band_width = next_month["high"] - next_month["low"]
    assert band_width <= 0.6 * history_spread


def test_forecast_band_contains_the_median_on_uneven_history():
    band = predict_spend(build_uneven_history(), "2026-07-16")["next_month"]
    assert band["low"] <= band["mid"] <= band["high"]
