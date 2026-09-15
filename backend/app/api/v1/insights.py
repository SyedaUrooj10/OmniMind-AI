from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.dataset import Dataset
from app.services.insights import generate_dataset_insights
from app.services.profiling_service import profile_dataset


router = APIRouter(
    prefix="/insights",
    tags=["AI Insights"],
)


@router.get("/datasets/{dataset_id}")
def get_dataset_insights(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # --------------------------------------------------
    # FIND DATASET
    # --------------------------------------------------

    dataset = (
        db.query(Dataset)
        .filter(
            Dataset.id == dataset_id,
            Dataset.user_id == current_user.id,
        )
        .first()
    )

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found",
        )

    # --------------------------------------------------
    # GENERATE PROFILE
    # --------------------------------------------------

    try:
        profile = profile_dataset(
            dataset.file_path
        )

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Dataset file not found",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to profile dataset: {str(exc)}",
        )

    # --------------------------------------------------
    # GENERATE INSIGHTS
    # --------------------------------------------------

    insights = generate_dataset_insights(
        profile
    )

    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return {
        "dataset_id": dataset.id,
        "filename": dataset.filename,
        "insights": insights,
        "total": len(insights),
    }

