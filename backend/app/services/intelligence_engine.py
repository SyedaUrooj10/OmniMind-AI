from typing import Any

import pandas as pd


class IntelligenceEngine:
    """
    Advanced natural-language analytics engine.

    Supports:
    - Aggregations
    - Group-by analysis
    - Top-N / bottom-N
    - Column detection
    - Basic natural-language filters
    - Numerical analysis
    - Correlation analysis
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
    # COLUMN DETECTION
    # =====================================================

    def find_column(
        self,
        question: str,
        preferred_types: list[str] | None = None,
    ) -> str | None:

        question_lower = question.lower()

        columns = self.df.columns.tolist()

        if preferred_types:

            if "numerical" in preferred_types:
                columns = [
                    col
                    for col in columns
                    if col in self.numerical_columns
                ]

            elif "categorical" in preferred_types:
                columns = [
                    col
                    for col in columns
                    if col in self.categorical_columns
                ]

        # Exact column match
        for column in columns:

            normalized = (
                str(column)
                .lower()
                .replace("_", " ")
                .replace("-", " ")
            )

            if normalized in question_lower:
                return column

        # Match column words
        for column in columns:

            words = (
                str(column)
                .lower()
                .replace("_", " ")
                .replace("-", " ")
                .split()
            )

            for word in words:

                if (
                    len(word) > 2
                    and word in question_lower
                ):
                    return column

        # Common business aliases
        aliases = {
            "sales": [
                "sales",
                "sale",
                "selling",
            ],
            "revenue": [
                "revenue",
                "income",
                "earnings",
                "turnover",
            ],
            "profit": [
                "profit",
                "profits",
                "margin",
            ],
            "customer": [
                "customer",
                "customers",
                "client",
                "clients",
            ],
            "product": [
                "product",
                "products",
                "item",
                "items",
            ],
            "region": [
                "region",
                "regions",
                "area",
                "location",
            ],
            "category": [
                "category",
                "categories",
                "type",
                "segment",
            ],
        }

        for column in columns:

            column_lower = str(column).lower()

            for _, words in aliases.items():

                if any(
                    word in question_lower
                    for word in words
                ):

                    if any(
                        word in column_lower
                        for word in words
                    ):
                        return column

        return None

    # =====================================================
    # TOP N DETECTION
    # =====================================================

    def detect_top_n(
        self,
        question: str,
    ) -> int | None:

        import re

        question_lower = question.lower()

        match = re.search(
            r"\btop\s+(\d+)",
            question_lower,
        )

        if match:
            return int(match.group(1))

        match = re.search(
            r"\b(\d+)\s+(?:best|highest|top)",
            question_lower,
        )

        if match:
            return int(match.group(1))

        match = re.search(
            r"\b(?:best|highest|top)\s+(\d+)",
            question_lower,
        )

        if match:
            return int(match.group(1))

        return None

    # =====================================================
    # INTENT DETECTION
    # =====================================================

    def detect_intent(
        self,
        question: str,
    ) -> str:

        q = question.lower()

        if any(
            phrase in q
            for phrase in [
                "correlation",
                "correlated",
                "relationship",
                "factors affect",
                "factors affecting",
            ]
        ):
            return "correlation"

        if any(
            phrase in q
            for phrase in [
                "average",
                "mean",
            ]
        ):
            return "average"

        if any(
            phrase in q
            for phrase in [
                "total",
                "sum",
                "overall",
            ]
        ):
            return "sum"

        if any(
            phrase in q
            for phrase in [
                "lowest",
                "smallest",
                "minimum",
            ]
        ):
            return "minimum"

        if any(
            phrase in q
            for phrase in [
                "highest",
                "largest",
                "maximum",
                "most",
                "best",
                "top",
            ]
        ):
            return "top_n"

        if any(
            phrase in q
            for phrase in [
                "unique",
                "distinct",
                "different values",
            ]
        ):
            return "unique"

        if any(
            phrase in q
            for phrase in [
                "how many rows",
                "number of rows",
                "how many records",
                "record count",
            ]
        ):
            return "row_count"

        return "unknown"

    # =====================================================
    # FILTER DETECTION
    # =====================================================

    def detect_filters(
        self,
        question: str,
    ) -> list[dict[str, Any]]:

        filters = []

        question_lower = question.lower()

        for column in self.categorical_columns:

            series = self.df[column].dropna()

            unique_values = series.unique()

            for value in unique_values:

                value_string = str(value)

                if (
                    value_string.lower()
                    in question_lower
                ):

                    filters.append(
                        {
                            "column": column,
                            "operator": "==",
                            "value": value,
                        }
                    )

        return filters

    # =====================================================
    # APPLY FILTERS
    # =====================================================

    def apply_filters(
        self,
        dataframe: pd.DataFrame,
        filters: list[dict[str, Any]],
    ) -> pd.DataFrame:

        filtered = dataframe.copy()

        for item in filters:

            column = item["column"]
            value = item["value"]

            filtered = filtered[
                filtered[column].astype(str).str.lower()
                == str(value).lower()
            ]

        return filtered

    # =====================================================
    # AVERAGE
    # =====================================================

    def average(
        self,
        dataframe: pd.DataFrame,
        column: str,
    ) -> dict[str, Any]:

        value = dataframe[column].mean()

        return {
            "type": "aggregation",
            "operation": "average",
            "column": column,
            "value": round(float(value), 4),
            "answer": (
                f"The average {column} is "
                f"{value:,.2f}."
            ),
        }

    # =====================================================
    # SUM
    # =====================================================

    def total(
        self,
        dataframe: pd.DataFrame,
        column: str,
    ) -> dict[str, Any]:

        value = dataframe[column].sum()

        return {
            "type": "aggregation",
            "operation": "sum",
            "column": column,
            "value": round(float(value), 4),
            "answer": (
                f"The total {column} is "
                f"{value:,.2f}."
            ),
        }

    # =====================================================
    # MINIMUM
    # =====================================================

    def minimum(
        self,
        dataframe: pd.DataFrame,
        column: str,
    ) -> dict[str, Any]:

        value = dataframe[column].min()

        return {
            "type": "aggregation",
            "operation": "minimum",
            "column": column,
            "value": value,
            "answer": (
                f"The lowest {column} is "
                f"{value:,.2f}."
            ),
        }

    # =====================================================
    # TOP N
    # =====================================================

    def top_n(
        self,
        dataframe: pd.DataFrame,
        dimension: str,
        metric: str,
        limit: int = 5,
    ) -> dict[str, Any]:

        grouped = (
            dataframe
            .groupby(dimension)[metric]
            .sum()
            .sort_values(
                ascending=False
            )
            .head(limit)
        )

        results = []

        for category, value in grouped.items():

            results.append(
                {
                    "category": str(category),
                    "value": round(
                        float(value),
                        4,
                    ),
                }
            )

        if not results:

            return {
                "type": "top_n",
                "results": [],
                "answer": "No results were found.",
            }

        if limit == 1:

            answer = (
                f"{results[0]['category']} has the "
                f"highest {metric}, with "
                f"{results[0]['value']:,.2f}."
            )

        else:

            answer = (
                f"The top {len(results)} "
                f"{dimension} values by {metric} are: "
            )

            answer += ", ".join(
                [
                    f"{item['category']} "
                    f"({item['value']:,.2f})"
                    for item in results
                ]
            )

            answer += "."

        return {
            "type": "top_n",
            "dimension": dimension,
            "metric": metric,
            "limit": limit,
            "results": results,
            "answer": answer,
        }

    # =====================================================
    # UNIQUE VALUES
    # =====================================================

    def unique(
        self,
        dataframe: pd.DataFrame,
        column: str,
    ) -> dict[str, Any]:

        count = dataframe[column].nunique()

        return {
            "type": "unique",
            "column": column,
            "value": int(count),
            "answer": (
                f"There are {count:,} unique "
                f"values in {column}."
            ),
        }

    # =====================================================
    # CORRELATION
    # =====================================================

    def correlation(
        self,
        dataframe: pd.DataFrame,
        target: str,
    ) -> dict[str, Any]:

        numerical = (
            dataframe
            .select_dtypes(include=["number"])
        )

        if len(numerical.columns) < 2:

            return {
                "type": "correlation",
                "results": [],
                "answer": (
                    "There are not enough numerical "
                    "columns for correlation analysis."
                ),
            }

        correlations = (
            numerical
            .corr()[target]
            .drop(target)
            .dropna()
            .sort_values(
                key=lambda x: x.abs(),
                ascending=False,
            )
        )

        results = []

        for feature, value in correlations.head(5).items():

            results.append(
                {
                    "feature": feature,
                    "correlation": round(
                        float(value),
                        4,
                    ),
                }
            )

        if not results:

            return {
                "type": "correlation",
                "results": [],
                "answer": (
                    "No meaningful correlations "
                    "were detected."
                ),
            }

        strongest = results[0]

        return {
            "type": "correlation",
            "target": target,
            "results": results,
            "answer": (
                f"The strongest relationship with "
                f"{target} is {strongest['feature']}, "
                f"with a correlation of "
                f"{strongest['correlation']:.2f}."
            ),
        }

    # =====================================================
    # MAIN ANALYZER
    # =====================================================

    def analyze(
        self,
        question: str,
    ) -> dict[str, Any]:

        intent = self.detect_intent(
            question
        )

        filters = self.detect_filters(
            question
        )

        filtered_df = self.apply_filters(
            self.df,
            filters,
        )

        top_n = self.detect_top_n(
            question
        )

        # ---------------------------------------------
        # ROW COUNT
        # ---------------------------------------------

        if intent == "row_count":

            return {
                "intent": intent,
                "filters": filters,
                "answer": (
                    f"The dataset contains "
                    f"{len(filtered_df):,} records."
                ),
                "value": len(filtered_df),
            }

        # ---------------------------------------------
        # AVERAGE
        # ---------------------------------------------

        if intent == "average":

            metric = self.find_column(
                question,
                ["numerical"],
            )

            if metric:

                result = self.average(
                    filtered_df,
                    metric,
                )

                result["intent"] = intent
                result["filters"] = filters

                return result

        # ---------------------------------------------
        # TOTAL
        # ---------------------------------------------

        if intent == "sum":

            metric = self.find_column(
                question,
                ["numerical"],
            )

            if metric:

                result = self.total(
                    filtered_df,
                    metric,
                )

                result["intent"] = intent
                result["filters"] = filters

                return result

        # ---------------------------------------------
        # MINIMUM
        # ---------------------------------------------

        if intent == "minimum":

            metric = self.find_column(
                question,
                ["numerical"],
            )

            if metric:

                result = self.minimum(
                    filtered_df,
                    metric,
                )

                result["intent"] = intent
                result["filters"] = filters

                return result

        # ---------------------------------------------
        # CORRELATION
        # ---------------------------------------------

        if intent == "correlation":

            target = self.find_column(
                question,
                ["numerical"],
            )

            if target:

                result = self.correlation(
                    filtered_df,
                    target,
                )

                result["intent"] = intent
                result["filters"] = filters

                return result

        # ---------------------------------------------
        # TOP N
        # ---------------------------------------------

        if intent == "top_n":

            metric = self.find_column(
                question,
                ["numerical"],
            )

            dimension = self.find_column(
                question,
                ["categorical"],
            )

            if not dimension:

                if self.categorical_columns:
                    dimension = (
                        self.categorical_columns[0]
                    )

            if not metric:

                if self.numerical_columns:
                    metric = (
                        self.numerical_columns[0]
                    )

            if dimension and metric:

                limit = top_n or 5

                result = self.top_n(
                    filtered_df,
                    dimension,
                    metric,
                    limit,
                )

                result["intent"] = intent
                result["filters"] = filters

                return result

        # ---------------------------------------------
        # UNIQUE
        # ---------------------------------------------

        if intent == "unique":

            column = self.find_column(
                question
            )

            if column:

                result = self.unique(
                    filtered_df,
                    column,
                )

                result["intent"] = intent
                result["filters"] = filters

                return result

        # ---------------------------------------------
        # FALLBACK
        # ---------------------------------------------

        return {
            "intent": "unknown",
            "filters": filters,
            "answer": (
                "I could not determine the analysis "
                "required. Try asking about revenue, "
                "sales, averages, totals, top products, "
                "regions, categories, or correlations."
            ),
            "available_columns": (
                self.df.columns.tolist()
            ),
        }
    






    