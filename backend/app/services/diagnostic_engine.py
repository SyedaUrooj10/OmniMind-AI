from typing import Any

import pandas as pd


class DiagnosticEngine:
    """
    Diagnostic intelligence engine.

    Looks for potential explanations behind changes
    in numerical business metrics.

    Supports:
    - Period-over-period comparison
    - Categorical segment analysis
    - Numerical correlations
    - Driver ranking
    - Automated business insights
    """

    def __init__(self, dataframe: pd.DataFrame):
        self.df = dataframe.copy()

        self.numerical_columns = (
            self.df
            .select_dtypes(include=["number"])
            .columns
            .tolist()
        )

        self.categorical_columns = (
            self.df
            .select_dtypes(
                include=["object", "category"]
            )
            .columns
            .tolist()
        )

    # =====================================================
    # FIND COLUMN
    # =====================================================

    def find_column(
        self,
        question: str,
        numerical_only: bool = False,
    ) -> str | None:

        question_lower = question.lower()

        columns = self.numerical_columns if numerical_only else self.df.columns.tolist()

        # Exact matching
        for column in columns:

            normalized = (
                str(column)
                .lower()
                .replace("_", " ")
                .replace("-", " ")
            )

            if normalized in question_lower:
                return column

        # Word matching
        for column in columns:

            normalized = (
                str(column)
                .lower()
                .replace("_", " ")
                .replace("-", " ")
            )

            words = normalized.split()

            for word in words:

                if (
                    len(word) >= 3
                    and word in question_lower
                ):
                    return column

        # Business aliases
        aliases = {
            "revenue": [
                "revenue",
                "income",
                "earnings",
                "turnover",
            ],
            "sales": [
                "sales",
                "sale",
            ],
            "profit": [
                "profit",
                "profits",
            ],
            "cost": [
                "cost",
                "costs",
            ],
            "customers": [
                "customer",
                "customers",
                "clients",
            ],
        }

        for column in columns:

            column_lower = str(column).lower()

            for alias_group in aliases.values():

                if any(
                    alias in question_lower
                    for alias in alias_group
                ):

                    if any(
                        alias in column_lower
                        for alias in alias_group
                    ):
                        return column

        return None

    # =====================================================
    # DETECT TARGET METRIC
    # =====================================================

    def detect_target(
        self,
        question: str,
    ) -> str | None:

        return self.find_column(
            question,
            numerical_only=True,
        )

    # =====================================================
    # CORRELATION DRIVERS
    # =====================================================

    def correlation_drivers(
        self,
        target: str,
    ) -> list[dict[str, Any]]:

        if len(self.numerical_columns) < 2:
            return []

        correlation_matrix = (
            self.df[self.numerical_columns]
            .corr()
        )

        if target not in correlation_matrix.columns:
            return []

        correlations = (
            correlation_matrix[target]
            .drop(target)
            .dropna()
            .sort_values(
                key=lambda x: x.abs(),
                ascending=False,
            )
        )

        drivers = []

        for feature, correlation in correlations.items():

            strength = abs(float(correlation))

            if strength >= 0.7:
                level = "strong"

            elif strength >= 0.4:
                level = "moderate"

            else:
                level = "weak"

            direction = (
                "positive"
                if correlation > 0
                else "negative"
            )

            drivers.append(
                {
                    "feature": feature,
                    "correlation": round(
                        float(correlation),
                        4,
                    ),
                    "strength": level,
                    "direction": direction,
                }
            )

        return drivers[:10]

    # =====================================================
    # CATEGORY PERFORMANCE
    # =====================================================

    def segment_analysis(
        self,
        target: str,
    ) -> list[dict[str, Any]]:

        results = []

        for category in self.categorical_columns:

            try:

                grouped = (
                    self.df
                    .groupby(category)[target]
                    .agg(
                        [
                            "count",
                            "mean",
                            "sum",
                        ]
                    )
                    .sort_values(
                        "sum",
                        ascending=False,
                    )
                )

            except Exception:
                continue

            if grouped.empty:
                continue

            top = grouped.head(3)

            bottom = grouped.tail(3)

            results.append(
                {
                    "dimension": category,
                    "top_segments": [
                        {
                            "segment": str(index),
                            "total": round(
                                float(row["sum"]),
                                4,
                            ),
                            "average": round(
                                float(row["mean"]),
                                4,
                            ),
                            "records": int(
                                row["count"]
                            ),
                        }
                        for index, row in top.iterrows()
                    ],
                    "bottom_segments": [
                        {
                            "segment": str(index),
                            "total": round(
                                float(row["sum"]),
                                4,
                            ),
                            "average": round(
                                float(row["mean"]),
                                4,
                            ),
                            "records": int(
                                row["count"]
                            ),
                        }
                        for index, row in bottom.iterrows()
                    ],
                }
            )

        return results

    # =====================================================
    # CHANGE DETECTION
    # =====================================================

    def detect_change(
        self,
        target: str,
    ) -> dict[str, Any] | None:

        series = self.df[target].dropna()

        if len(series) < 4:
            return None

        midpoint = len(series) // 2

        first_period = series.iloc[:midpoint]
        second_period = series.iloc[midpoint:]

        first_mean = float(
            first_period.mean()
        )

        second_mean = float(
            second_period.mean()
        )

        if first_mean == 0:
            return None

        percentage_change = (
            (second_mean - first_mean)
            / abs(first_mean)
        ) * 100

        if percentage_change > 5:

            direction = "increase"

        elif percentage_change < -5:

            direction = "decrease"

        else:

            direction = "stable"

        return {
            "first_period_average": round(
                first_mean,
                4,
            ),
            "second_period_average": round(
                second_mean,
                4,
            ),
            "percentage_change": round(
                percentage_change,
                2,
            ),
            "direction": direction,
        }

    # =====================================================
    # GENERATE DIAGNOSTIC INSIGHTS
    # =====================================================

    def generate_insights(
        self,
        target: str,
        change: dict[str, Any] | None,
        drivers: list[dict[str, Any]],
        segments: list[dict[str, Any]],
    ) -> list[str]:

        insights = []

        # ---------------------------------------------
        # Trend
        # ---------------------------------------------

        if change:

            direction = change["direction"]

            percentage = abs(
                change["percentage_change"]
            )

            if direction == "decrease":

                insights.append(
                    f"{target} decreased by "
                    f"{percentage:.1f}% between the "
                    f"first and second periods."
                )

            elif direction == "increase":

                insights.append(
                    f"{target} increased by "
                    f"{percentage:.1f}% between the "
                    f"first and second periods."
                )

            else:

                insights.append(
                    f"{target} remained relatively "
                    "stable across the two periods."
                )

        # ---------------------------------------------
        # Correlation drivers
        # ---------------------------------------------

        for driver in drivers[:3]:

            if driver["strength"] in [
                "strong",
                "moderate",
            ]:

                direction_text = (
                    "positively"
                    if driver["direction"] == "positive"
                    else "negatively"
                )

                insights.append(
                    f"{driver['feature']} is "
                    f"{driver['strength']} and "
                    f"{direction_text} correlated "
                    f"with {target} "
                    f"({driver['correlation']:.2f})."
                )

        # ---------------------------------------------
        # Segment insights
        # ---------------------------------------------

        for segment_group in segments[:2]:

            if not segment_group["top_segments"]:
                continue

            top = segment_group["top_segments"][0]

            insights.append(
                f"{top['segment']} is the strongest "
                f"{segment_group['dimension']} segment "
                f"by total {target}, generating "
                f"{top['total']:,.2f}."
            )

        return insights[:8]

    # =====================================================
    # RECOMMENDATIONS
    # =====================================================

    def generate_recommendations(
        self,
        target: str,
        change: dict[str, Any] | None,
        drivers: list[dict[str, Any]],
        segments: list[dict[str, Any]],
    ) -> list[str]:

        recommendations = []

        # ---------------------------------------------
        # Trend recommendation
        # ---------------------------------------------

        if change:

            if change["direction"] == "decrease":

                recommendations.append(
                    f"Investigate the drivers behind the "
                    f"{abs(change['percentage_change']):.1f}% "
                    f"decline in {target}."
                )

            elif change["direction"] == "increase":

                recommendations.append(
                    f"Identify which factors contributed "
                    f"to the {change['percentage_change']:.1f}% "
                    f"increase in {target} and consider "
                    "scaling them."
                )

        # ---------------------------------------------
        # Driver recommendations
        # ---------------------------------------------

        for driver in drivers[:3]:

            if driver["strength"] == "strong":

                if driver["direction"] == "positive":

                    recommendations.append(
                        f"Investigate whether increasing "
                        f"{driver['feature']} could improve "
                        f"{target}."
                    )

                else:

                    recommendations.append(
                        f"Investigate the negative relationship "
                        f"between {driver['feature']} and "
                        f"{target}."
                    )

        # ---------------------------------------------
        # Segment recommendations
        # ---------------------------------------------

        if segments:

            strongest_dimension = segments[0]

            if strongest_dimension["top_segments"]:

                top = (
                    strongest_dimension[
                        "top_segments"
                    ][0]
                )

                recommendations.append(
                    f"Prioritize the strongest "
                    f"{strongest_dimension['dimension']} "
                    f"segment: {top['segment']}."
                )

        recommendations.append(
            f"Validate these findings against "
            f"additional business context before "
            f"making major decisions."
        )

        return recommendations[:6]

    # =====================================================
    # MAIN DIAGNOSTIC ANALYSIS
    # =====================================================

    def analyze(
        self,
        question: str,
    ) -> dict[str, Any]:

        target = self.detect_target(
            question
        )

        if not target:

            return {
                "intent": "diagnostic",
                "answer": (
                    "I could not identify the business "
                    "metric you want me to investigate."
                ),
                "insights": [],
                "recommendations": [],
                "drivers": [],
                "segments": [],
            }

        change = self.detect_change(
            target
        )

        drivers = self.correlation_drivers(
            target
        )

        segments = self.segment_analysis(
            target
        )

        insights = self.generate_insights(
            target,
            change,
            drivers,
            segments,
        )

        recommendations = (
            self.generate_recommendations(
                target,
                change,
                drivers,
                segments,
            )
        )

        if change:

            direction = change["direction"]

            percentage = abs(
                change["percentage_change"]
            )

            if direction == "decrease":

                answer = (
                    f"{target} decreased by "
                    f"{percentage:.1f}% between the "
                    "first and second periods. "
                )

            elif direction == "increase":

                answer = (
                    f"{target} increased by "
                    f"{percentage:.1f}% between the "
                    "first and second periods. "
                )

            else:

                answer = (
                    f"{target} remained relatively "
                    "stable between the two periods. "
                )

        else:

            answer = (
                f"OmniMind analyzed {target} and "
                "identified several potential drivers."
            )

        if drivers:

            strongest = drivers[0]

            answer += (
                f"The strongest numerical relationship "
                f"is with {strongest['feature']} "
                f"({strongest['correlation']:.2f})."
            )

        return {
            "intent": "diagnostic",
            "target": target,
            "answer": answer,
            "change": change,
            "drivers": drivers,
            "segments": segments,
            "insights": insights,
            "recommendations": recommendations,
        }
    



    