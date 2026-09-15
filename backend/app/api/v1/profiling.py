from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.dataset import Dataset
from app.models.user import User
from app.schemas.profiling import DatasetProfileResponse
from app.services.profiling_service import profile_dataset


router = APIRouter(
    prefix="/profiling",
    tags=["Profiling"],
)


@router.get(
    "/datasets/{dataset_id}",
    response_model=DatasetProfileResponse,
)
def get_dataset_profile(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
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

    try:
        profile = profile_dataset(
            dataset.file_path
        )

        return profile

    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset file not found.",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:
        print(
            f"Profiling error: {exc}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to profile dataset.",
        )