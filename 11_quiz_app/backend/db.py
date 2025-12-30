"""
Snowflake データベース接続モジュール
connection.toml を使用して Snowflake に接続し、データ操作を行う
"""

import tomli
import snowflake.connector
from pathlib import Path
from contextlib import contextmanager
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from typing import Dict, Any, List


def load_config() -> Dict[str, Any]:
    """
    connection.toml から Snowflake 設定を読み込む

    Returns:
        dict: Snowflake 接続設定
    """
    config_path = Path(__file__).parent.parent / "connection.toml"
    with open(config_path, "rb") as f:
        config = tomli.load(f)
    return config["snowflake"]


def load_private_key(private_key_path: str) -> bytes:
    """
    秘密鍵ファイルを読み込み、PKCS8 形式にシリアライズ

    Args:
        private_key_path: 秘密鍵ファイルのパス

    Returns:
        bytes: PKCS8 形式の秘密鍵
    """
    with open(private_key_path, "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,
            backend=default_backend()
        )

    # PKCS8 形式にシリアライズ
    pkb = private_key.private_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    return pkb


@contextmanager
def get_connection():
    """
    Snowflake 接続を取得するコンテキストマネージャー
    with 文で使用することで、自動的に接続をクローズする

    Usage:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ...")

    Yields:
        snowflake.connector.connection: Snowflake 接続オブジェクト
    """
    config = load_config()
    private_key_bytes = load_private_key(config["private_key_path"])

    conn = snowflake.connector.connect(
        account=config["account"],
        user=config["user"],
        private_key=private_key_bytes,
        warehouse=config["warehouse"],
        database=config["database"],
        schema=config["schema"],
        role=config["role"]
    )

    try:
        yield conn
    finally:
        conn.close()


def insert_quiz_session(
    session_id: str,
    score: int,
    total_questions: int,
    correct_rate: float,
    user_id: str = None
) -> bool:
    """
    クイズセッション情報を QUIZ_SESSIONS テーブルに挿入

    Args:
        session_id: セッションID (UUID)
        score: 正解数
        total_questions: 総問題数
        correct_rate: 正解率（%）
        user_id: ユーザーID（オプション）

    Returns:
        bool: 挿入成功時 True、失敗時 False
    """
    try:
        print(f"[DEBUG] Inserting session: {session_id}, score: {score}/{total_questions}")
        with get_connection() as conn:
            cursor = conn.cursor()

            sql = """
                INSERT INTO QUIZ_SESSIONS (
                    session_id,
                    user_id,
                    score,
                    total_questions,
                    correct_rate
                )
                VALUES (%s, %s, %s, %s, %s)
            """

            cursor.execute(sql, (
                session_id,
                user_id,
                score,
                total_questions,
                correct_rate
            ))

            cursor.close()
            print(f"[DEBUG] Session inserted successfully")
            return True

    except Exception as e:
        print(f"[ERROR] Error inserting quiz session: {e}")
        import traceback
        traceback.print_exc()
        return False


def insert_quiz_answers(answers: List[Dict[str, Any]]) -> bool:
    """
    クイズ回答詳細を QUIZ_ANSWERS テーブルにバルクインサート

    Args:
        answers: 回答データのリスト
            各要素は以下のキーを持つ辞書:
            - session_id: セッションID
            - question_id: 問題ID
            - question_text: 問題文
            - selected_answer: 選択した回答のインデックス
            - correct_answer: 正解のインデックス
            - is_correct: 正解かどうか (bool)

    Returns:
        bool: 挿入成功時 True、失敗時 False
    """
    if not answers:
        print("[DEBUG] No answers to insert")
        return True

    try:
        print(f"[DEBUG] Inserting {len(answers)} answers")
        with get_connection() as conn:
            cursor = conn.cursor()

            sql = """
                INSERT INTO QUIZ_ANSWERS (
                    session_id,
                    question_id,
                    question_text,
                    selected_answer,
                    correct_answer,
                    is_correct
                )
                VALUES (%s, %s, %s, %s, %s, %s)
            """

            # バルクインサート用のデータを準備
            values = [
                (
                    answer["session_id"],
                    answer["question_id"],
                    answer["question_text"],
                    answer["selected_answer"],
                    answer["correct_answer"],
                    answer["is_correct"]
                )
                for answer in answers
            ]

            # executemany でバルクインサート
            cursor.executemany(sql, values)

            cursor.close()
            print(f"[DEBUG] Answers inserted successfully")
            return True

    except Exception as e:
        print(f"[ERROR] Error inserting quiz answers: {e}")
        import traceback
        traceback.print_exc()
        return False


def get_quiz_sessions(limit: int = 10) -> List[Dict[str, Any]]:
    """
    クイズセッション一覧を取得

    Args:
        limit: 取得件数（デフォルト: 10）

    Returns:
        list: セッション情報のリスト
    """
    try:
        with get_connection() as conn:
            cursor = conn.cursor()

            sql = """
                SELECT
                    session_id,
                    user_id,
                    score,
                    total_questions,
                    correct_rate,
                    completed_at,
                    created_at
                FROM QUIZ_SESSIONS
                ORDER BY completed_at DESC
                LIMIT %s
            """

            cursor.execute(sql, (limit,))
            rows = cursor.fetchall()

            # 列名を取得
            columns = [desc[0] for desc in cursor.description]

            # 辞書形式に変換
            sessions = [dict(zip(columns, row)) for row in rows]

            cursor.close()
            return sessions

    except Exception as e:
        print(f"Error fetching quiz sessions: {e}")
        return []
