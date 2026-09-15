from __future__ import annotations

import math
import re
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

try:
    from sklearn.linear_model import LinearRegression
except ImportError:
    LinearRegression = None


class AdvancedAnalyticsService:
    """
    Advanced analytics engine for OmniMind AI.

    Provides:
    - chart generation
    - bar charts
    - line charts
    - top-N visualizations
    - forecasting
    - trend prediction
    - anomaly detection
    - prediction confidence
    - recommended actions
    - impact estimation
    - priority scoring
    - what-if analysis
    """

    def load_dataset(self, file_path: str) -> pd.DataFrame:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"Dataset file not found: {file_path}")

        suffix = path.suffix.lower()

        if suffix == ".csv":
            return pd.read_csv(path)

        if suffix in {".xlsx", ".xls"}:
            return pd.read_excel(path)

        raise ValueError(f"Unsupported dataset format: {suffix}")

    def _numeric_columns(self, df: pd.DataFrame) -> list[str]:
        return df.select_dtypes(include=[np.number]).columns.tolist()

    def _categorical_columns(self, df: pd.DataFrame) -> list[str]:
        return df.select_dtypes(
            include=["object", "category", "bool"]
        ).columns.tolist()

    def _find_metric_column(
        self,
        df: pd.DataFrame,
        question: str,
    ) -> str | None:
        numeric_columns = self._numeric_columns(df)

        if not numeric_columns:
            return None

        question_lower = question.lower()

        aliases: dict[str, list[str]] = {
            "revenue": ["revenue", "sales", "income", "turnover"],
            "sales": ["sales", "revenue", "units_sold"],
            "profit": ["profit", "earnings", "net_income", "margin"],
            "cost": ["cost", "expense", "expenses"],
            "quantity": ["quantity", "qty", "units"],
            "customers": ["customers", "customer_count", "clients"],
        }

        for _, names in aliases.items():
            for column in numeric_columns:
                normalized = column.lower().replace(" ", "_")

                if normalized in names and any(
                    name in question_lower for name in names
                ):
                    return column

        for column in numeric_columns:
            normalized = column.lower().replace(" ", "_")

            if normalized in question_lower:
                return column

        # Prefer common business metrics.
        priority = [
            "revenue",
            "sales",
            "profit",
            "amount",
            "value",
            "total",
            "quantity",
            "count",
        ]

        for keyword in priority:
            for column in numeric_columns:
                if keyword in column.lower():
                    return column

        return numeric_columns[0]

    def _find_group_column(
        self,
        df: pd.DataFrame,
        question: str,
    ) -> str | None:
        categorical_columns = self._categorical_columns(df)

        if not categorical_columns:
            return None

        question_lower = question.lower()

        for column in categorical_columns:
            normalized = column.lower().replace(" ", "_")

            if normalized in question_lower:
                return column

        aliases = {
            "region": ["region", "location", "area", "country", "city"],
            "category": ["category", "type", "segment"],
            "product": ["product", "item", "product_name"],
            "customer": ["customer", "client"],
            "department": ["department", "division", "team"],
        }

        for _, names in aliases.items():
            if any(name in question_lower for name in names):
                for column in categorical_columns:
                    normalized = column.lower().replace(" ", "_")

                    if normalized in names or any(
                        name in normalized for name in names
                    ):
                        return column

        return categorical_columns[0]

    def _find_date_column(self, df: pd.DataFrame) -> str | None:
        datetime_columns = df.select_dtypes(
            include=["datetime64[ns]", "datetime64[ns, UTC]"]
        ).columns.tolist()

        if datetime_columns:
            return datetime_columns[0]

        for column in df.columns:
            name = column.lower()

            if any(
                keyword in name
                for keyword in [
                    "date",
                    "time",
                    "month",
                    "year",
                    "timestamp",
                ]
            ):
                converted = pd.to_datetime(
                    df[column],
                    errors="coerce",
                )

                if converted.notna().sum() >= max(3, len(df) * 0.5):
                    return column

        return None

    def _clean_number(self, value: Any) -> float:
        try:
            result = float(value)

            if not math.isfinite(result):
                return 0.0

            return result
        except (TypeError, ValueError):
            return 0.0

    def _detect_top_n(self, question: str) -> int:
        match = re.search(
            r"\btop\s+(\d+)\b",
            question.lower(),
        )

        if match:
            return max(1, min(int(match.group(1)), 20))

        return 10

    # ---------------------------------------------------------
    # STEP 12 — CHART DATA
    # ---------------------------------------------------------

    def generate_chart(
        self,
        df: pd.DataFrame,
        question: str,
    ) -> dict[str, Any] | None:
        question_lower = question.lower()

        metric = self._find_metric_column(df, question)

        if metric is None:
            return None

        date_column = self._find_date_column(df)

        wants_line = any(
            keyword in question_lower
            for keyword in [
                "trend",
                "over time",
                "timeline",
                "daily",
                "weekly",
                "monthly",
                "yearly",
                "forecast",
                "history",
                "time series",
            ]
        )

        wants_top = "top" in question_lower

        # Time-series chart
        if date_column is not None and wants_line:
            temp = df[[date_column, metric]].copy()

            temp[date_column] = pd.to_datetime(
                temp[date_column],
                errors="coerce",
            )

            temp[metric] = pd.to_numeric(
                temp[metric],
                errors="coerce",
            )

            temp = temp.dropna()

            if len(temp) >= 3:
                grouped = (
                    temp.groupby(date_column)[metric]
                    .sum()
                    .sort_index()
                    .tail(30)
                )

                data = [
                    {
                        "label": str(index.date())
                        if hasattr(index, "date")
                        else str(index),
                        "value": self._clean_number(value),
                    }
                    for index, value in grouped.items()
                ]

                return {
                    "type": "line",
                    "title": f"{metric} Trend Over Time",
                    "x_label": date_column,
                    "y_label": metric,
                    "data": data,
                }

        # Grouped / Top-N chart
        group_column = self._find_group_column(df, question)

        if group_column is not None:
            temp = df[[group_column, metric]].copy()

            temp[metric] = pd.to_numeric(
                temp[metric],
                errors="coerce",
            )

            temp = temp.dropna(subset=[metric])

            grouped = (
                temp.groupby(group_column)[metric]
                .sum()
                .sort_values(ascending=False)
            )

            if wants_top:
                grouped = grouped.head(
                    self._detect_top_n(question)
                )
            else:
                grouped = grouped.head(15)

            data = [
                {
                    "label": str(index),
                    "value": self._clean_number(value),
                }
                for index, value in grouped.items()
            ]

            return {
                "type": "bar",
                "title": (
                    f"Top {len(data)} {metric} by {group_column}"
                    if wants_top
                    else f"{metric} by {group_column}"
                ),
                "x_label": group_column,
                "y_label": metric,
                "data": data,
            }

        return None

    # ---------------------------------------------------------
    # STEP 13 — FORECASTING
    # ---------------------------------------------------------

    def generate_forecast(
        self,
        df: pd.DataFrame,
        question: str,
    ) -> dict[str, Any] | None:
        question_lower = question.lower()

        wants_forecast = any(
            keyword in question_lower
            for keyword in [
                "forecast",
                "predict",
                "prediction",
                "future",
                "next month",
                "next year",
                "will",
            ]
        )

        if not wants_forecast:
            return None

        metric = self._find_metric_column(df, question)

        if metric is None:
            return None

        date_column = self._find_date_column(df)

        if date_column is None:
            return self._simple_forecast(df, metric)

        temp = df[[date_column, metric]].copy()

        temp[date_column] = pd.to_datetime(
            temp[date_column],
            errors="coerce",
        )

        temp[metric] = pd.to_numeric(
            temp[metric],
            errors="coerce",
        )

        temp = temp.dropna()

        if len(temp) < 5:
            return self._simple_forecast(df, metric)

        grouped = (
            temp.groupby(date_column)[metric]
            .sum()
            .sort_index()
        )

        if len(grouped) < 5:
            return self._simple_forecast(df, metric)

        y = grouped.values.astype(float)
        x = np.arange(len(y)).reshape(-1, 1)

        if LinearRegression is not None:
            model = LinearRegression()
            model.fit(x, y)

            future_steps = min(6, max(3, len(y) // 4))

            future_x = np.arange(
                len(y),
                len(y) + future_steps,
            ).reshape(-1, 1)

            predictions = model.predict(future_x)

            slope = float(model.coef_[0])
        else:
            slope = float(
                np.polyfit(
                    np.arange(len(y)),
                    y,
                    1,
                )[0]
            )

            future_steps = 6

            predictions = [
                float(y[-1] + slope * step)
                for step in range(1, future_steps + 1)
            ]

        recent_mean = float(
            np.mean(y[-min(5, len(y)):])
        )

        residuals = y - (
            np.polyval(
                np.polyfit(
                    np.arange(len(y)),
                    y,
                    1,
                ),
                np.arange(len(y)),
            )
        )

        error = float(np.std(residuals))

        if recent_mean == 0:
            confidence = 50.0
        else:
            confidence = max(
                0.0,
                min(
                    99.0,
                    100.0
                    * (
                        1.0
                        - min(
                            1.0,
                            error
                            / max(
                                abs(recent_mean),
                                1e-9,
                            ),
                        )
                    ),
                ),
            )

        future_dates = pd.date_range(
            start=grouped.index[-1],
            periods=future_steps + 1,
            freq="D",
        )[1:]

        forecast_data = [
            {
                "label": str(date.date()),
                "value": self._clean_number(value),
            }
            for date, value in zip(
                future_dates,
                predictions,
            )
        ]

        direction = (
            "increasing"
            if slope > 0
            else "decreasing"
            if slope < 0
            else "stable"
        )

        return {
            "metric": metric,
            "trend": direction,
            "slope": slope,
            "confidence": round(confidence, 2),
            "forecast_periods": future_steps,
            "forecast": forecast_data,
        }

    def _simple_forecast(
        self,
        df: pd.DataFrame,
        metric: str,
    ) -> dict[str, Any] | None:
        values = pd.to_numeric(
            df[metric],
            errors="coerce",
        ).dropna()

        if len(values) < 5:
            return None

        recent = values.tail(
            min(10, len(values))
        ).values.astype(float)

        x = np.arange(len(recent))

        slope = float(
            np.polyfit(
                x,
                recent,
                1,
            )[0]
        )

        predictions = [
            self._clean_number(
                recent[-1] + slope * step
            )
            for step in range(1, 7)
        ]

        confidence = 70.0

        return {
            "metric": metric,
            "trend": (
                "increasing"
                if slope > 0
                else "decreasing"
                if slope < 0
                else "stable"
            ),
            "slope": slope,
            "confidence": confidence,
            "forecast_periods": 6,
            "forecast": [
                {
                    "label": f"Future {index + 1}",
                    "value": value,
                }
                for index, value in enumerate(predictions)
            ],
        }

    # ---------------------------------------------------------
    # STEP 13 — ANOMALY DETECTION
    # ---------------------------------------------------------

    def detect_anomalies(
        self,
        df: pd.DataFrame,
        question: str,
    ) -> dict[str, Any] | None:
        question_lower = question.lower()

        wants_anomaly = any(
            keyword in question_lower
            for keyword in [
                "anomaly",
                "anomalies",
                "outlier",
                "outliers",
                "unusual",
                "abnormal",
                "unexpected",
            ]
        )

        if not wants_anomaly:
            return None

        metric = self._find_metric_column(df, question)

        if metric is None:
            return None

        values = pd.to_numeric(
            df[metric],
            errors="coerce",
        )

        valid = values.dropna()

        if len(valid) < 5:
            return None

        mean = float(valid.mean())
        std = float(valid.std())

        if std == 0:
            return {
                "metric": metric,
                "anomaly_count": 0,
                "anomalies": [],
                "method": "z-score",
            }

        z_scores = (valid - mean) / std

        threshold = 2.5

        anomaly_indices = z_scores[
            z_scores.abs() >= threshold
        ].index

        date_column = self._find_date_column(df)

        anomalies: list[dict[str, Any]] = []

        for index in anomaly_indices:
            row: dict[str, Any] = {
                "row_index": int(index),
                "value": self._clean_number(
                    values.loc[index]
                ),
                "z_score": round(
                    float(z_scores.loc[index]),
                    3,
                ),
            }

            if date_column is not None:
                row["date"] = str(
                    df.loc[index, date_column]
                )

            anomalies.append(row)

        return {
            "metric": metric,
            "anomaly_count": len(anomalies),
            "anomalies": anomalies[:20],
            "method": "z-score",
            "threshold": threshold,
        }

    # ---------------------------------------------------------
    # STEP 14 — DECISION INTELLIGENCE
    # ---------------------------------------------------------

    def generate_decision(
        self,
        df: pd.DataFrame,
        question: str,
        forecast: dict[str, Any] | None,
        anomalies: dict[str, Any] | None,
    ) -> dict[str, Any] | None:
        question_lower = question.lower()

        wants_decision = any(
            keyword in question_lower
            for keyword in [
                "recommend",
                "recommendation",
                "what should",
                "should we",
                "action",
                "decision",
                "improve",
                "optimization",
                "optimise",
                "optimize",
                "what if",
            ]
        )

        if not wants_decision:
            return None

        metric = self._find_metric_column(df, question)

        if metric is None:
            return None

        recommendations: list[dict[str, Any]] = []

        if forecast is not None:
            trend = forecast["trend"]
            confidence = float(
                forecast["confidence"]
            )

            if trend == "decreasing":
                recommendations.append(
                    {
                        "action": (
                            f"Investigate the drivers of declining "
                            f"{metric} and prioritize the weakest "
                            "segments."
                        ),
                        "impact": "High",
                        "priority_score": 90,
                        "reason": (
                            f"The forecast indicates a decreasing "
                            f"trend with {confidence:.1f}% confidence."
                        ),
                    }
                )

            elif trend == "increasing":
                recommendations.append(
                    {
                        "action": (
                            f"Protect and scale the strongest "
                            f"drivers of {metric}."
                        ),
                        "impact": "High",
                        "priority_score": 82,
                        "reason": (
                            f"The forecast indicates an increasing "
                            f"trend with {confidence:.1f}% confidence."
                        ),
                    }
                )

        if anomalies is not None:
            count = int(
                anomalies["anomaly_count"]
            )

            if count > 0:
                recommendations.append(
                    {
                        "action": (
                            f"Investigate the {count} detected "
                            f"{metric} anomalies before making "
                            "major operational decisions."
                        ),
                        "impact": "Medium",
                        "priority_score": 78,
                        "reason": (
                            "Unusual observations may indicate "
                            "data-quality problems or exceptional "
                            "business events."
                        ),
                    }
                )

        group_column = self._find_group_column(
            df,
            question,
        )

        if group_column is not None:
            temp = df[
                [group_column, metric]
            ].copy()

            temp[metric] = pd.to_numeric(
                temp[metric],
                errors="coerce",
            )

            temp = temp.dropna(
                subset=[metric]
            )

            if not temp.empty:
                grouped = (
                    temp.groupby(group_column)[metric]
                    .sum()
                    .sort_values()
                )

                if len(grouped) >= 2:
                    weakest = str(
                        grouped.index[0]
                    )

                    strongest = str(
                        grouped.index[-1]
                    )

                    recommendations.append(
                        {
                            "action": (
                                f"Review {weakest} and compare it "
                                f"with the strongest segment, "
                                f"{strongest}."
                            ),
                            "impact": "Medium",
                            "priority_score": 72,
                            "reason": (
                                f"{weakest} is currently the weakest "
                                f"segment for {metric}."
                            ),
                        }
                    )

        if not recommendations:
            recommendations.append(
                {
                    "action": (
                        f"Review the main drivers of {metric} "
                        "and monitor changes over time."
                    ),
                    "impact": "Medium",
                    "priority_score": 60,
                    "reason": (
                        "The available dataset evidence does not "
                        "support a stronger specific intervention."
                    ),
                }
            )

        recommendations.sort(
            key=lambda item: item["priority_score"],
            reverse=True,
        )

        return {
            "metric": metric,
            "recommendations": recommendations,
        }

    # ---------------------------------------------------------
    # STEP 14 — WHAT-IF ANALYSIS
    # ---------------------------------------------------------

    def what_if(
        self,
        df: pd.DataFrame,
        question: str,
    ) -> dict[str, Any] | None:
        question_lower = question.lower()

        match = re.search(
            r"(?:increase|decrease|grow|reduce|raise|lower)"
            r"\s+(?:by\s+)?(\d+(?:\.\d+)?)\s*%",
            question_lower,
        )

        if match is None:
            return None

        percentage = float(
            match.group(1)
        )

        direction = (
            -1
            if any(
                word in question_lower
                for word in [
                    "decrease",
                    "reduce",
                    "lower",
                ]
            )
            else 1
        )

        metric = self._find_metric_column(
            df,
            question,
        )

        if metric is None:
            return None

        values = pd.to_numeric(
            df[metric],
            errors="coerce",
        ).dropna()

        if values.empty:
            return None

        baseline = float(
            values.sum()
        )

        multiplier = (
            1
            + direction * percentage / 100
        )

        projected = baseline * multiplier

        change = projected - baseline

        return {
            "metric": metric,
            "scenario": (
                f"{'Decrease' if direction < 0 else 'Increase'} "
                f"{metric} by {percentage:g}%"
            ),
            "baseline": round(
                baseline,
                2,
            ),
            "projected": round(
                projected,
                2,
            ),
            "absolute_change": round(
                change,
                2,
            ),
            "percentage_change": percentage
            * direction,
        }

    # ---------------------------------------------------------
    # MASTER ANALYSIS
    # ---------------------------------------------------------

    def analyze(
        self,
        file_path: str,
        question: str,
    ) -> dict[str, Any]:
        df = self.load_dataset(file_path)

        chart = self.generate_chart(
            df,
            question,
        )

        forecast = self.generate_forecast(
            df,
            question,
        )

        anomalies = self.detect_anomalies(
            df,
            question,
        )

        decision = self.generate_decision(
            df,
            question,
            forecast,
            anomalies,
        )

        scenario = self.what_if(
            df,
            question,
        )

        return {
            "chart": chart,
            "predictive": {
                "forecast": forecast,
                "anomalies": anomalies,
            },
            "decision": decision,
            "what_if": scenario,
        }


advanced_analytics_service = AdvancedAnalyticsService()










