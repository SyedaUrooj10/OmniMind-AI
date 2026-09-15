from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class DatasetResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    row_count: int
    column_count: int
    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class DatasetListResponse(BaseModel):
    datasets: list[DatasetResponse]
    total: int


class DatasetPreviewResponse(BaseModel):
    columns: list[str]
    rows: list[dict[str, Any]]
    page: int
    page_size: int
    total_rows: int
    total_pages: int


