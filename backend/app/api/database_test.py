from fastapi import APIRouter
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi import Depends

from app.db.database import get_db


router = APIRouter(
    prefix="/database",
    tags=["Database"],
)


@router.get("/test")
def test_database(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    value = result.scalar()

    return {
        "database": "PostgreSQL",
        "status": "connected",
        "test_result": value,
    }