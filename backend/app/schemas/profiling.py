from typing import Any

from pydantic import BaseModel


class ColumnStatistics(BaseModel):
    mean: float
    median: float
    min: float
    max: float
    std: float
    q1: float
    q3: float


class TopValue(BaseModel):
    value: str
    count: int


class ColumnProfile(BaseModel):
    name: str
    data_type: str
    missing_count: int
    missing_percentage: float
    unique_count: int
    unique_percentage: float

    statistics: ColumnStatistics | None = None
    outlier_count: int = 0
    top_values: list[TopValue] | None = None


class DatasetOverview(BaseModel):
    row_count: int
    column_count: int
    duplicate_rows: int
    memory_usage_bytes: int


class DataQuality(BaseModel):
    completeness: float
    uniqueness: float
    quality_score: float


class DatasetProfileResponse(BaseModel):
    overview: DatasetOverview
    columns: list[ColumnProfile]
    correlations: dict[str, dict[str, float]]
    data_quality: DataQuality