from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.dataset import Dataset
from app.models.user import User
from app.services.ai_reasoning import AIReasoningService
from app.services.advanced_analytics import advanced_analytics_service
from app.services.dataset_profiler import DatasetProfiler
from app.services.diagnostic_engine import DiagnosticEngine
from app.services.ai_agent import omnimind_agent
from app.services.intelligence_engine import IntelligenceEngine


router = APIRouter(
    prefix="/ai",
    tags=["AI Intelligence"],
)


# ============================================================
# AI REASONING SERVICE
# ============================================================

reasoning_service = AIReasoningService()


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class AIQueryRequest(BaseModel):
    dataset_id: int
    question: str


class AIQueryResponse(BaseModel):
    success: bool
    dataset_id: int
    question: str
    answer: str
    insights: list[str]
    recommendations: list[str]
    metadata: dict[str, Any]

    # STEP 12
    chart: dict[str, Any] | None = None

    # STEP 13
    predictive: dict[str, Any] | None = None

    # STEP 14
    decision: dict[str, Any] | None = None
    what_if: dict[str, Any] | None = None


# ============================================================
# CHART REQUEST DETECTION
# ============================================================

def detect_chart_request(question: str) -> bool:
    chart_keywords = [
        "show",
        "plot",
        "chart",
        "graph",
        "visualize",
        "visualise",
        "visualization",
        "visualisation",
        "trend",
        "top",
        "compare",
        "comparison",
    ]

    question_lower = question.lower()

    return any(
        keyword in question_lower
        for keyword in chart_keywords
    )


# ============================================================
# DIAGNOSTIC REQUEST DETECTION
# ============================================================

def detect_diagnostic_request(question: str) -> bool:
    diagnostic_keywords = [
        "why",
        "reason",
        "cause",
        "caused",
        "driver",
        "drivers",
        "decline",
        "decreased",
        "decrease",
        "fell",
        "fall",
        "drop",
        "dropped",
        "underperform",
        "underperforming",
    ]

    question_lower = question.lower()

    return any(
        keyword in question_lower
        for keyword in diagnostic_keywords
    )


# ============================================================
# POST /ai/query
# ============================================================

@router.post(
    "/query",
    response_model=AIQueryResponse,
)
def query_ai(
    request: AIQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evidence-grounded AI analysis pipeline.

    User Question
        ↓
    Dataset
        ↓
    Dataset Profiler
        ↓
    Intelligence Engine
        ↓
    Diagnostic Engine
        ↓
    Advanced Analytics
        ↓
    Evidence Package
        ↓
    Ollama Reasoning
        ↓
    Business Explanation
        ↓
    Charts / Forecast / Anomalies / Decisions
    """

    # ========================================================
    # 1. FIND DATASET
    # ========================================================

    dataset = (
        db.query(Dataset)
        .filter(
            Dataset.id == request.dataset_id,
            Dataset.user_id == current_user.id,
        )
        .first()
    )

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    # ========================================================
    # 2. LOAD DATASET
    # ========================================================

    try:
        profiler = DatasetProfiler(
            dataset.file_path
        )

        profile = profiler.profile()
        dataframe = profiler.load_dataset()

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to analyze dataset: "
                f"{str(exc)}"
            ),
        ) from exc

    # ========================================================
    # 3. NATURAL LANGUAGE INTELLIGENCE
    # ========================================================

    try:
        engine = IntelligenceEngine(
            dataframe
        )

        analysis = engine.analyze(
            request.question
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to process the natural language "
                f"question: {str(exc)}"
            ),
        ) from exc

    # ========================================================
    # 4. DETECT DIAGNOSTIC / WHY QUESTIONS
    # ========================================================

    is_diagnostic_question = detect_diagnostic_request(
        request.question
    )

    # ========================================================
    # 5. DIAGNOSTIC INTELLIGENCE
    # ========================================================

    if is_diagnostic_question:
        try:
            diagnostic_engine = DiagnosticEngine(
                dataframe
            )

            diagnostic_analysis = (
                diagnostic_engine.analyze(
                    request.question
                )
            )

            analysis = diagnostic_analysis

        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Unable to perform diagnostic analysis: "
                    f"{str(exc)}"
                ),
            ) from exc

    # ========================================================
    # 6. GENERATE INSIGHTS + RECOMMENDATIONS
    # ========================================================

    if analysis.get("intent") == "diagnostic":
        insights = analysis.get(
            "insights",
            [],
        )

        recommendations = analysis.get(
            "recommendations",
            [],
        )

    else:
        insights: list[str] = []
        recommendations: list[str] = []

        # ----------------------------------------------------
        # Profile-based insights
        # ----------------------------------------------------

        missing_values = profile.get(
            "missing_values",
            [],
        )

        duplicate_rows = profile.get(
            "duplicate_rows",
            0,
        )

        shape = profile.get(
            "shape",
            {},
        )

        rows = shape.get(
            "rows",
            0,
        )

        columns = shape.get(
            "columns",
            0,
        )

        if rows and columns:
            insights.append(
                f"The dataset contains {rows:,} rows "
                f"and {columns} columns."
            )

        if duplicate_rows:
            insights.append(
                "The dataset contains "
                f"{duplicate_rows:,} duplicate rows."
            )

            recommendations.append(
                "Review duplicate records before "
                "using the dataset for modeling."
            )

        missing_count = len(
            [
                item
                for item in missing_values
                if item.get("missing", 0) > 0
            ]
        )

        if missing_count:
            insights.append(
                f"{missing_count} columns contain "
                "missing values."
            )

            recommendations.append(
                "Review missing-value patterns and "
                "apply an appropriate imputation strategy."
            )

    # ========================================================
    # 7. ADVANCED ANALYTICS
    # ========================================================

    try:
        advanced = advanced_analytics_service.analyze(
            dataset.file_path,
            request.question,
        )

    except Exception as exc:
        # Advanced analytics should never destroy the
        # already-working AI response.

        advanced = {
            "chart": None,
            "predictive": {
                "forecast": None,
                "anomalies": None,
            },
            "decision": None,
            "what_if": None,
        }

        print(
            "Advanced analytics warning:",
            str(exc),
        )

    # ========================================================
    # 8. BUILD EVIDENCE PACKAGE
    # ========================================================

    evidence = {
        "dataset": {
            "dataset_id": dataset.id,
            "filename": dataset.filename,
            "status": dataset.status,
        },
        "question": request.question,
        "profile": profile,
        "analysis": analysis,
        "existing_insights": insights,
        "existing_recommendations": recommendations,
        "advanced_analytics": advanced,
    }

    # ========================================================
    # 9. SEND EVIDENCE TO OLLAMA
    # ========================================================

    reasoning = reasoning_service.generate_reasoning(
        question=request.question,
        evidence=evidence,
    )

    # ========================================================
    # 10. AI ANSWER
    # ========================================================

    ai_answer = reasoning.get(
        "answer",
        "",
    )

    if not ai_answer:
        ai_answer = (
            "Unable to generate an AI explanation "
            "for this query."
        )

    # ========================================================
    # 11. RETURN COMPLETE RESPONSE
    # ========================================================

    return AIQueryResponse(
        success=True,
        dataset_id=dataset.id,
        question=request.question,
        answer=ai_answer,
        insights=insights,
        recommendations=recommendations,
        metadata={
            "filename": dataset.filename,
            "status": dataset.status,
            "intent": analysis.get(
                "intent",
                "unknown",
            ),
            "filters": analysis.get(
                "filters",
                [],
            ),
            "analysis": analysis,
            "profile": profile,
            "chart_requested": detect_chart_request(
                request.question
            ),
            "ai_reasoning": {
                "success": reasoning.get(
                    "success",
                    False,
                ),
                "model": reasoning.get(
                    "model",
                    "qwen2.5:0.5b",
                ),
            },
        },
        chart=advanced.get(
            "chart"
        ),
        predictive=advanced.get(
            "predictive"
        ),
        decision=advanced.get(
            "decision"
        ),
        what_if=advanced.get(
            "what_if"
        ),
    )


# ============================================================
# GET /ai/insights/{dataset_id}
# ============================================================

@router.get(
    "/insights/{dataset_id}"
)
def get_dataset_insights(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Automatically generate diagnostic business insights
    for a dataset.
    """

    # ========================================================
    # 1. FIND DATASET
    # ========================================================

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
            detail="Dataset not found.",
        )

    # ========================================================
    # 2. LOAD DATASET
    # ========================================================

    try:
        profiler = DatasetProfiler(
            dataset.file_path
        )

        profile = profiler.profile()
        dataframe = profiler.load_dataset()

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to load dataset: "
                f"{str(exc)}"
            ),
        ) from exc

    # ========================================================
    # 3. DETECT TARGET
    # ========================================================

    numerical_columns = profile.get(
        "numerical_columns",
        [],
    )

    if not numerical_columns:
        return {
            "success": True,
            "dataset_id": dataset.id,
            "filename": dataset.filename,
            "insights": [],
            "recommendations": [],
            "message": (
                "No numerical columns were found "
                "for automatic diagnostic analysis."
            ),
        }

    target = numerical_columns[0]

    # ========================================================
    # 4. RUN DIAGNOSTIC ENGINE
    # ========================================================

    try:
        diagnostic_engine = DiagnosticEngine(
            dataframe
        )

        diagnostic = diagnostic_engine.analyze(
            f"Why is {target} changing?"
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate diagnostic insights: "
                f"{str(exc)}"
            ),
        ) from exc

    # ========================================================
    # 5. BUILD EVIDENCE
    # ========================================================

    evidence = {
        "dataset": {
            "dataset_id": dataset.id,
            "filename": dataset.filename,
            "status": dataset.status,
        },
        "question": (
            f"Why is {target} changing?"
        ),
        "target_metric": target,
        "profile": profile,
        "diagnostic_analysis": diagnostic,
    }

    # ========================================================
    # 6. GENERATE AI EXPLANATION
    # ========================================================

    reasoning = reasoning_service.generate_reasoning(
        question=f"Why is {target} changing?",
        evidence=evidence,
    )

    # ========================================================
    # 7. RETURN RESULTS
    # ========================================================

    return {
        "success": True,
        "dataset_id": dataset.id,
        "filename": dataset.filename,
        "target_metric": target,
        "insights": diagnostic.get(
            "insights",
            [],
        ),
        "recommendations": diagnostic.get(
            "recommendations",
            [],
        ),
        "ai_reasoning": {
            "success": reasoning.get(
                "success",
                False,
            ),
            "model": reasoning.get(
                "model",
                "qwen2.5:0.5b",
            ),
            "answer": reasoning.get(
                "answer",
                "",
            ),
        },
        "analysis": diagnostic,
    }

@router.post("/agent")
def run_agent(
    request: AIQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dataset = (
        db.query(Dataset)
        .filter(
            Dataset.id == request.dataset_id,
            Dataset.user_id == current_user.id,
        )
        .first()
    )

    if dataset is None:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    result = omnimind_agent.run(
        dataset.file_path,
        request.question,
    )

    return {
        "success": result["success"],
        "dataset_id": dataset.id,
        "question": request.question,
        **result,
    }








