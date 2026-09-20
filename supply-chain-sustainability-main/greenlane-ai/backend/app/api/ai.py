"""
GreenLane AI — AI Copilot API Endpoints
"""

from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.schemas import ChatRequest, ChatResponse, ToolCallExecution
from app.ai.agent import CopilotAgent

router = APIRouter(prefix="/ai", tags=["AI Copilot"])


@router.post("/chat", response_model=ChatResponse)
def copilot_chat(req: ChatRequest, db: Session = Depends(get_db)):
    """Process message through AI Sustainability Copilot with grounded tool calling."""
    agent = CopilotAgent(db=db, dataset=req.dataset)
    reply_text, tool_calls_raw, suggested_prompts = agent.process_message(req.message)

    tool_executions = [
        ToolCallExecution(
            tool=tc["tool"],
            parameters=tc["parameters"],
            result=tc["result"]
        )
        for tc in tool_calls_raw
    ]

    return ChatResponse(
        reply=reply_text,
        tool_calls=tool_executions,
        suggested_prompts=suggested_prompts
    )
