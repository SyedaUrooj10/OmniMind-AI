from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.services.ai_service import generate_ai_response


router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"],
)


# ============================================================
# REQUEST / RESPONSE SCHEMAS
# ============================================================

class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: int


# ============================================================
# CHAT ENDPOINT
# ============================================================

@router.post(
    "/",
    response_model=ChatResponse,
)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    message = request.message.strip()

    # --------------------------------------------------------
    # Validate message
    # --------------------------------------------------------

    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty.",
        )

    # --------------------------------------------------------
    # Find existing conversation
    # --------------------------------------------------------

    conversation = None

    if request.conversation_id is not None:
        conversation = db.scalar(
            select(Conversation).where(
                Conversation.id == request.conversation_id,
                Conversation.user_id == current_user.id,
            )
        )

        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )

    # --------------------------------------------------------
    # Create new conversation
    # --------------------------------------------------------

    if conversation is None:
        now = datetime.now(timezone.utc)

        conversation = Conversation(
            user_id=current_user.id,
            title=message[:50],
            created_at=now,
            updated_at=now,
        )

        db.add(conversation)
        db.flush()

    # --------------------------------------------------------
    # Save user's message
    # --------------------------------------------------------

    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=message,
    )

    db.add(user_message)
    db.flush()

    # --------------------------------------------------------
    # Generate AI response
    # --------------------------------------------------------

    try:
        ai_response = generate_ai_response(message)

    except Exception as exc:
        db.rollback()

        print(f"AI generation error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate AI response.",
        )

    # --------------------------------------------------------
    # Save AI response
    # --------------------------------------------------------

    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_response,
    )

    db.add(assistant_message)

    # --------------------------------------------------------
    # Update conversation timestamp
    # --------------------------------------------------------

    conversation.updated_at = datetime.now(timezone.utc)

    db.add(conversation)

    # --------------------------------------------------------
    # Commit everything
    # --------------------------------------------------------

    try:
        db.commit()

    except Exception as exc:
        db.rollback()

        print(f"Database commit error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save conversation.",
        )

    # --------------------------------------------------------
    # Refresh conversation
    # --------------------------------------------------------

    db.refresh(conversation)

    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return {
        "response": ai_response,
        "conversation_id": conversation.id,
    }



    