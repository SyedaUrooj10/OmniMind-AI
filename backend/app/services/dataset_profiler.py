from pathlib import Path
from typing import Any

import pandas as pd


class DatasetProfiler:
    """
    Profiles uploaded datasets and produces structured
    statistics that can later be consumed by the AI reasoning layer.
    """

    def __init__(self, file_path: str):
        self.file_path = Path(file_path)

    def load_dataset(self) -> pd.DataFrame:
        """Load the dataset based on its file extension."""

        if not self.file_path.exists():
            raise FileNotFoundError(
                f"Dataset file not found: {self.file_path}"
            )

        extension = self.file_path.suffix.lower()

        if extension == ".csv":
            return pd.read_csv(self.file_path)

        if extension in [".xlsx", ".xls"]:
            return pd.read_excel(self.file_path)

        raise ValueError(
            f"Unsupported dataset format: {extension}"
        )

    def profile(self) -> dict[str, Any]:
        """Generate a complete dataset profile."""

        df = self.load_dataset()

        row_count, column_count = df.shape

        numerical_columns = df.select_dtypes(
            include=["number"]
        ).columns.tolist()

        categorical_columns = df.select_dtypes(
            include=["object", "category"]
        ).columns.tolist()

        boolean_columns = df.select_dtypes(
            include=["bool"]
        ).columns.tolist()

        datetime_columns = df.select_dtypes(
            include=["datetime"]
        ).columns.tolist()

        missing_values = df.isnull().sum()

        missing_data = []

        for column in df.columns:
            missing_count = int(missing_values[column])

            missing_data.append(
                {
                    "column": column,
                    "missing_count": missing_count,
                    "missing_percentage": round(
                        (missing_count / row_count) * 100,
                        2,
                    )
                    if row_count > 0
                    else 0,
                }
            )

        duplicate_count = int(df.duplicated().sum())

        statistics = {}

        for column in numerical_columns:
            series = df[column].dropna()

            if len(series) == 0:
                continue

            statistics[column] = {
                "count": int(series.count()),
                "mean": round(float(series.mean()), 4),
                "median": round(float(series.median()), 4),
                "std": round(float(series.std()), 4)
                if len(series) > 1
                else 0,
                "min": round(float(series.min()), 4),
                "max": round(float(series.max()), 4),
            }

        correlations = []

        if len(numerical_columns) >= 2:
            correlation_matrix = df[numerical_columns].corr()

            for column_a in numerical_columns:
                for column_b in numerical_columns:
                    if column_a >= column_b:
                        continue

                    value = correlation_matrix.loc[
                        column_a,
                        column_b,
                    ]

                    if pd.notna(value):
                        correlations.append(
                            {
                                "column_a": column_a,
                                "column_b": column_b,
                                "correlation": round(
                                    float(value),
                                    4,
                                ),
                            }
                        )

        correlations.sort(
            key=lambda item: abs(item["correlation"]),
            reverse=True,
        )

        column_details = []

        for column in df.columns:
            column_details.append(
                {
                    "name": column,
                    "dtype": str(df[column].dtype),
                    "unique_values": int(
                        df[column].nunique(dropna=True)
                    ),
                    "missing_values": int(
                        df[column].isnull().sum()
                    ),
                }
            )

        return {
            "shape": {
                "rows": int(row_count),
                "columns": int(column_count),
            },
            "columns": column_details,
            "numerical_columns": numerical_columns,
            "categorical_columns": categorical_columns,
            "boolean_columns": boolean_columns,
            "datetime_columns": datetime_columns,
            "missing_values": missing_data,
            "duplicate_rows": duplicate_count,
            "statistics": statistics,
            "correlations": correlations[:20],
        }

    