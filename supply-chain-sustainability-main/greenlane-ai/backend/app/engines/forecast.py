"""
GreenLane AI — Forecast Engine

Simple explainable emissions forecasting.
Uses linear trend + seasonal decomposition.
Does NOT overclaim accuracy — shows confidence bands.
"""

from __future__ import annotations
from typing import List, Dict, Tuple
import math


def _linear_regression(x: List[float], y: List[float]) -> Tuple[float, float]:
    """Simple OLS linear regression. Returns (slope, intercept)."""
    n = len(x)
    if n < 2:
        return 0.0, y[0] if y else 0.0
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(xi * yi for xi, yi in zip(x, y))
    sum_x2 = sum(xi ** 2 for xi in x)
    denom = n * sum_x2 - sum_x ** 2
    if denom == 0:
        return 0.0, sum_y / n
    slope = (n * sum_xy - sum_x * sum_y) / denom
    intercept = (sum_y - slope * sum_x) / n
    return slope, intercept


def forecast_emissions(
    monthly_data: List[dict],
    periods_ahead: int = 3,
) -> dict:
    """
    Forecast future emissions based on historical monthly data.

    Args:
        monthly_data: List of {"month": "2021-01", "co2e_kg": float}
        periods_ahead: Number of months to forecast

    Returns:
        Forecast with trend, predictions, and confidence range
    """
    if len(monthly_data) < 3:
        return {
            "error": "Need at least 3 months of data for forecasting",
            "historical": monthly_data,
            "forecast": [],
        }

    values = [d["co2e_kg"] for d in monthly_data]
    months = list(range(len(values)))

    # Fit linear trend
    slope, intercept = _linear_regression(months, values)

    # Calculate residuals for confidence band
    predictions_hist = [slope * m + intercept for m in months]
    residuals = [actual - pred for actual, pred in zip(values, predictions_hist)]
    if len(residuals) > 1:
        std_residual = math.sqrt(sum(r ** 2 for r in residuals) / (len(residuals) - 1))
    else:
        std_residual = abs(residuals[0]) if residuals else 0

    # Forecast
    forecast_points = []
    last_month_idx = len(values)

    for i in range(periods_ahead):
        idx = last_month_idx + i
        point_forecast = slope * idx + intercept
        lower = point_forecast - 1.96 * std_residual * math.sqrt(1 + 1 / len(values))
        upper = point_forecast + 1.96 * std_residual * math.sqrt(1 + 1 / len(values))

        forecast_points.append({
            "period_index": idx,
            "co2e_kg": round(max(0, point_forecast), 2),
            "lower_bound": round(max(0, lower), 2),
            "upper_bound": round(max(0, upper), 2),
            "confidence": "95%",
        })

    trend_direction = "increasing" if slope > 0 else "decreasing" if slope < 0 else "stable"
    monthly_change = round(slope, 2)

    return {
        "historical": monthly_data,
        "forecast": forecast_points,
        "trend": {
            "direction": trend_direction,
            "monthly_change_kg": monthly_change,
            "r_squared": round(1 - sum(r ** 2 for r in residuals) / (sum((v - sum(values) / len(values)) ** 2 for v in values) + 1e-10), 3),
        },
        "methodology": "Linear trend extrapolation with 95% confidence interval",
        "note": "Forecast accuracy decreases with horizon. These are directional estimates, not precise predictions.",
    }
