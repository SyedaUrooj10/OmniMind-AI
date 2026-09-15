from pathlib import Path

import pandas as pd


def profile_dataset(file_path: str) -> dict:
    """
    Generate a comprehensive profile for a CSV dataset.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Dataset file not found: {file_path}"
        )

    try:
        df = pd.read_csv(path)

    except pd.errors.EmptyDataError:
        raise ValueError("The CSV file is empty.")

    except pd.errors.ParserError:
        raise ValueError(
            "Unable to parse the CSV file."
        )

    except UnicodeDecodeError:
        raise ValueError(
            "The CSV file encoding is not supported."
        )

    # --------------------------------------------------
    # BASIC INFORMATION
    # --------------------------------------------------

    row_count = len(df)
    column_count = len(df.columns)

    duplicate_rows = int(df.duplicated().sum())

    memory_usage = int(
        df.memory_usage(deep=True).sum()
    )

    # --------------------------------------------------
    # COLUMN PROFILES
    # --------------------------------------------------

    columns = []

    for column in df.columns:

        series = df[column]

        missing_count = int(series.isna().sum())

        missing_percentage = (
            (missing_count / row_count) * 100
            if row_count > 0
            else 0
        )

        unique_count = int(
            series.nunique(dropna=True)
        )

        column_profile = {
            "name": str(column),
            "data_type": str(series.dtype),
            "missing_count": missing_count,
            "missing_percentage": round(
                missing_percentage,
                2,
            ),
            "unique_count": unique_count,
            "unique_percentage": round(
                (
                    (unique_count / row_count) * 100
                    if row_count > 0
                    else 0
                ),
                2,
            ),
        }

        # ----------------------------------------------
        # NUMERICAL COLUMN
        # ----------------------------------------------

        if pd.api.types.is_numeric_dtype(series):

            clean_series = series.dropna()

            if len(clean_series) > 0:

                q1 = clean_series.quantile(0.25)
                q3 = clean_series.quantile(0.75)

                iqr = q3 - q1

                lower_bound = q1 - (1.5 * iqr)
                upper_bound = q3 + (1.5 * iqr)

                outlier_count = int(
                    (
                        (clean_series < lower_bound)
                        | (clean_series > upper_bound)
                    ).sum()
                )

                column_profile["statistics"] = {
                    "mean": round(
                        float(clean_series.mean()),
                        4,
                    ),
                    "median": round(
                        float(clean_series.median()),
                        4,
                    ),
                    "min": round(
                        float(clean_series.min()),
                        4,
                    ),
                    "max": round(
                        float(clean_series.max()),
                        4,
                    ),
                    "std": round(
                        float(clean_series.std()),
                        4,
                    )
                    if len(clean_series) > 1
                    else 0,
                    "q1": round(
                        float(q1),
                        4,
                    ),
                    "q3": round(
                        float(q3),
                        4,
                    ),
                }

                column_profile["outlier_count"] = (
                    outlier_count
                )

            else:

                column_profile["statistics"] = None
                column_profile["outlier_count"] = 0

        # ----------------------------------------------
        # CATEGORICAL COLUMN
        # ----------------------------------------------

        elif (
            pd.api.types.is_object_dtype(series)
            or pd.api.types.is_categorical_dtype(series)
        ):

            value_counts = (
                series
                .dropna()
                .value_counts()
                .head(10)
            )

            column_profile["top_values"] = [
                {
                    "value": str(value),
                    "count": int(count),
                }
                for value, count
                in value_counts.items()
            ]

        columns.append(column_profile)

    # --------------------------------------------------
    # NUMERICAL CORRELATIONS
    # --------------------------------------------------

    numeric_df = df.select_dtypes(
        include="number"
    )

    correlations = {}

    if numeric_df.shape[1] >= 2:

        correlation_matrix = (
            numeric_df.corr()
        )

        for column in correlation_matrix.columns:

            correlations[column] = {
                other_column: round(
                    float(
                        correlation_matrix.loc[
                            column,
                            other_column,
                        ]
                    ),
                    4,
                )
                for other_column
                in correlation_matrix.columns
            }

    # --------------------------------------------------
    # DATA QUALITY SCORE
    # --------------------------------------------------

    total_cells = row_count * column_count

    if total_cells > 0:

        missing_cells = int(
            df.isna().sum().sum()
        )

        completeness = (
            1
            - (
                missing_cells
                / total_cells
            )
        ) * 100

    else:

        completeness = 0

    if row_count > 0:

        uniqueness = (
            1
            - (
                duplicate_rows
                / row_count
            )
        ) * 100

    else:

        uniqueness = 0

    quality_score = (
        completeness + uniqueness
    ) / 2

    # --------------------------------------------------
    # FINAL PROFILE
    # --------------------------------------------------

    return {
        "overview": {
            "row_count": row_count,
            "column_count": column_count,
            "duplicate_rows": duplicate_rows,
            "memory_usage_bytes": memory_usage,
        },
        "columns": columns,
        "correlations": correlations,
        "data_quality": {
            "completeness": round(
                completeness,
                2,
            ),
            "uniqueness": round(
                uniqueness,
                2,
            ),
            "quality_score": round(
                quality_score,
                2,
            ),
        },
    }