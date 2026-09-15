import uuid
from pathlib import Path

import pandas as pd
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.dataset import Dataset
from app.models.user import User
from app.schemas.dataset import (
    DatasetListResponse,
    DatasetPreviewResponse,
    DatasetResponse,
)

router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"],
)

BASE_DIR = Path(__file__).resolve().parents[3]

UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# LIST DATASETS
# ============================================================

@router.get(
    "",
    response_model=DatasetListResponse,
)
def list_datasets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    datasets = db.scalars(
        select(Dataset)
        .where(
            Dataset.user_id == current_user.id
        )
        .order_by(
            Dataset.created_at.desc()
        )
    ).all()

    return DatasetListResponse(
        datasets=list(datasets),
        total=len(datasets),
    )


# ============================================================
# DATASET PREVIEW
# ============================================================

@router.get(
    "/{dataset_id}/preview",
    response_model=DatasetPreviewResponse,
)
def preview_dataset(
    dataset_id: int,
    page: int = Query(
        1,
        ge=1,
        description="Page number",
    ),
    page_size: int = Query(
        25,
        ge=1,
        le=100,
        description="Number of rows per page",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = db.scalar(
        select(Dataset).where(
            Dataset.id == dataset_id,
            Dataset.user_id == current_user.id,
        )
    )

    if dataset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found.",
        )

    file_path = Path(dataset.file_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset file not found.",
        )

    try:
        df = pd.read_csv(file_path)

        total_rows = len(df)

        total_pages = max(
            1,
            (total_rows + page_size - 1)
            // page_size,
        )

        if page > total_pages:
            page = total_pages

        start = (page - 1) * page_size
        end = start + page_size

        preview_df = df.iloc[start:end]

        rows = (
            preview_df
            .where(pd.notna(preview_df), None)
            .to_dict(orient="records")
        )

        return DatasetPreviewResponse(
            columns=[
                str(column)
                for column in df.columns
            ],
            rows=rows,
            page=page,
            page_size=page_size,
            total_rows=total_rows,
            total_pages=total_pages,
        )

    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The CSV file is empty.",
        )

    except pd.errors.ParserError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to parse the CSV file.",
        )

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The CSV file encoding is not supported.",
        )

    except Exception as exc:
        print(
            f"Dataset preview error: {exc}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate dataset preview.",
        )


# ============================================================
# GET SINGLE DATASET
# ============================================================

@router.get(
    "/{dataset_id}",
    response_model=DatasetResponse,
)
def get_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = db.scalar(
        select(Dataset).where(
            Dataset.id == dataset_id,
            Dataset.user_id == current_user.id,
        )
    )

    if dataset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found.",
        )

    return dataset


# ============================================================
# DELETE DATASET
# ============================================================

@router.delete(
    "/{dataset_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = db.scalar(
        select(Dataset).where(
            Dataset.id == dataset_id,
            Dataset.user_id == current_user.id,
        )
    )

    if dataset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found.",
        )

    file_path = Path(dataset.file_path)

    try:
        file_path.unlink(
            missing_ok=True
        )
    except OSError as exc:
        print(
            f"Unable to delete dataset file "
            f"{file_path}: {exc}"
        )

    try:
        db.delete(dataset)
        db.commit()

    except Exception as exc:
        db.rollback()

        print(
            f"Database error while deleting dataset: "
            f"{exc}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete dataset.",
        )

    return None


# ============================================================
# UPLOAD DATASET
# ============================================================

@router.post(
    "/upload",
    response_model=DatasetResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file was provided.",
        )

    original_filename = file.filename

    file_extension = Path(
        original_filename
    ).suffix.lower()

    if file_extension != ".csv":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported.",
        )

    unique_filename = (
        f"{uuid.uuid4().hex}.csv"
    )

    file_path = UPLOAD_DIR / unique_filename

    try:
        with file_path.open(
            "wb"
        ) as buffer:

            while True:
                chunk = file.file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                buffer.write(chunk)

    except Exception as exc:
        print(
            f"File upload error: {exc}"
        )

        if file_path.exists():
            file_path.unlink(
                missing_ok=True
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save uploaded file.",
        )

    try:
        df = pd.read_csv(file_path)

        row_count = len(df)
        column_count = len(df.columns)

        file_size = file_path.stat().st_size

    except pd.errors.EmptyDataError:
        file_path.unlink(
            missing_ok=True
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The CSV file is empty.",
        )

    except pd.errors.ParserError:
        file_path.unlink(
            missing_ok=True
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to parse the CSV file.",
        )

    except UnicodeDecodeError:
        file_path.unlink(
            missing_ok=True
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The CSV file encoding is not supported.",
        )

    except Exception as exc:
        print(
            f"CSV processing error: {exc}"
        )

        file_path.unlink(
            missing_ok=True
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to process the CSV file.",
        )

    dataset = Dataset(
        user_id=current_user.id,
        filename=original_filename,
        file_path=str(file_path),
        file_size=file_size,
        row_count=row_count,
        column_count=column_count,
        status="uploaded",
    )

    try:
        db.add(dataset)
        db.commit()
        db.refresh(dataset)

    except Exception as exc:
        db.rollback()

        if file_path.exists():
            file_path.unlink(
                missing_ok=True
            )

        print(
            f"Database error while saving dataset: "
            f"{exc}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save dataset.",
        )

    return dataset



    