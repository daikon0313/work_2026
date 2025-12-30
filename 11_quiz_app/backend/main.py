"""
FastAPI Backend for Quiz Application
クイズアプリケーション用のバックエンドAPI
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid

# ローカルモジュール
from db import insert_quiz_session, insert_quiz_answers, get_quiz_sessions


# Pydantic モデル定義
class QuizAnswer(BaseModel):
    """個別の回答データ"""
    question_id: int
    question_text: str
    selected_answer: int
    correct_answer: int
    is_correct: bool


class QuizSubmission(BaseModel):
    """クイズ結果送信データ"""
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    score: int
    total_questions: int
    answers: List[QuizAnswer]


class QuizSubmissionResponse(BaseModel):
    """クイズ結果送信のレスポンス"""
    success: bool
    message: str
    session_id: str


# FastAPIアプリケーションのインスタンスを作成
app = FastAPI(
    title="Quiz API",
    description="クイズ結果をSnowflakeに保存するAPI",
    version="1.0.0"
)

# CORS設定（Reactアプリからのリクエストを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Viteのデフォルトポート
        "http://localhost:5174",  # 代替ポート
        "http://localhost:3000",  # 別の一般的なポート
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ヘルスチェック用エンドポイント
@app.get("/")
async def root():
    """
    APIの動作確認用エンドポイント
    """
    return {
        "message": "Quiz API is running!",
        "status": "ok"
    }

# 動作確認用エンドポイント
@app.get("/health")
async def health_check():
    """
    サーバーの健全性をチェック
    """
    return {
        "status": "healthy",
        "service": "Quiz API"
    }


# クイズ結果を保存するエンドポイント
@app.post("/api/quiz/submit", response_model=QuizSubmissionResponse)
async def submit_quiz(submission: QuizSubmission):
    """
    クイズ結果を Snowflake に保存

    Args:
        submission: クイズ結果データ

    Returns:
        QuizSubmissionResponse: 保存結果
    """
    try:
        print("\n[API] POST /api/quiz/submit called")
        print(f"[API] Received: score={submission.score}, total={submission.total_questions}, answers={len(submission.answers)}")

        # セッションIDがない場合は生成
        session_id = submission.session_id or str(uuid.uuid4())
        print(f"[API] Session ID: {session_id}")

        # 正解率を計算
        correct_rate = (submission.score / submission.total_questions) * 100 if submission.total_questions > 0 else 0
        print(f"[API] Correct rate: {correct_rate}%")

        # セッション情報を保存
        session_saved = insert_quiz_session(
            session_id=session_id,
            score=submission.score,
            total_questions=submission.total_questions,
            correct_rate=correct_rate,
            user_id=submission.user_id
        )

        if not session_saved:
            raise HTTPException(
                status_code=500,
                detail="Failed to save quiz session"
            )

        # 回答詳細を保存
        answers_data = [
            {
                "session_id": session_id,
                "question_id": answer.question_id,
                "question_text": answer.question_text,
                "selected_answer": answer.selected_answer,
                "correct_answer": answer.correct_answer,
                "is_correct": answer.is_correct
            }
            for answer in submission.answers
        ]

        answers_saved = insert_quiz_answers(answers_data)

        if not answers_saved:
            raise HTTPException(
                status_code=500,
                detail="Failed to save quiz answers"
            )

        return QuizSubmissionResponse(
            success=True,
            message="クイズ結果を保存しました",
            session_id=session_id
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# セッション一覧を取得するエンドポイント
@app.get("/api/quiz/sessions")
async def get_sessions(limit: int = 10):
    """
    クイズセッション一覧を取得

    Args:
        limit: 取得件数（デフォルト: 10）

    Returns:
        list: セッション情報のリスト
    """
    try:
        sessions = get_quiz_sessions(limit=limit)
        return {
            "success": True,
            "count": len(sessions),
            "sessions": sessions
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch sessions: {str(e)}"
        )
