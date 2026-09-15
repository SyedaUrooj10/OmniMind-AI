from __future__ import annotations

from typing import Any

import pandas as pd


class ChartEngine:
    """
    Generates structured chart data from pandas DataFrames.

    The frontend should never receive raw pandas objects.
    Everything is converted into JSON-safe dictionaries.
    """

    def _safe_number(self, value: Any) -> float:
        try:
            number = float(value)

            if pd.isna(number):
                return 0.0

            return number

        except (TypeError, ValueError):
            return 0.0

    def _find_column(
        self,
        df: pd.DataFrame,
        requested: str | None,
    ) -> str | None:

        if not requested:
            return None

        requested_lower = requested.lower().strip()

        for column in df.columns:
            if str(column).lower() == requested_lower:
                return str(column)

        for column in df.columns:
            column_lower = str(column).lower()

            if requested_lower in column_lower:
                return str(column)

        return None

    def bar_chart(
        self,
        df: pd.DataFrame,
        category_column: str,
        value_column: str,
        title: str,
        top_n: int | None = None,
    ) -> dict[str, Any]:

        category = self._find_column(df, category_column)
        value = self._find_column(df, value_column)

        if category is None or value is None:
            return {
                "type": "bar",
                "title": title,
                "data": [],
            }

        working = df[[category, value]].copy()

        working[value] = pd.to_numeric(
            working[value],
            errors="coerce",
        )

        working = working.dropna(subset=[value])

        grouped = (
            working.groupby(category, dropna=False)[value]
            .sum()
            .sort_values(ascending=False)
        )

        if top_n is not None:
            grouped = grouped.head(top_n)

        data = [
            {
                "label": str(label),
                "value": self._safe_number(number),
            }
            for label, number in grouped.items()
        ]

        return {
            "type": "bar",
            "title": title,
            "data": data,
        }

    def line_chart(
        self,
        df: pd.DataFrame,
        x_column: str,
        value_column: str,
        title: str,
    ) -> dict[str, Any]:

        x = self._find_column(df, x_column)
        value = self._find_column(df, value_column)

        if x is None or value is None:
            return {
                "type": "line",
                "title": title,
                "data": [],
            }

        working = df[[x, value]].copy()

        working[value] = pd.to_numeric(
            working[value],
            errors="coerce",
        )

        working = working.dropna(subset=[value])

        working["_parsed_date"] = pd.to_datetime(
            working[x],
            errors="coerce",
        )

        if working["_parsed_date"].notna().sum() > 0:
            working = working.dropna(subset=["_parsed_date"])
            working = working.sort_values("_parsed_date")

            grouped = (
                working.groupby("_parsed_date")[value]
                .sum()
            )

            data = [
                {
                    "label": timestamp.strftime("%Y-%m-%d"),
                    "value": self._safe_number(number),
                }
                for timestamp, number in grouped.items()
            ]

        else:
            grouped = (
                working.groupby(x)[value]
                .sum()
            )

            data = [
                {
                    "label": str(label),
                    "value": self._safe_number(number),
                }
                for label, number in grouped.items()
            ]

        return {
            "type": "line",
            "title": title,
            "data": data,
        }
    



    