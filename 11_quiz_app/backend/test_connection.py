"""
Snowflake 接続テストスクリプト
"""

from db import get_connection, get_quiz_sessions

def test_connection():
    """接続テスト"""
    print("=" * 50)
    print("Snowflake 接続テスト")
    print("=" * 50)

    try:
        print("\n1. 接続テスト...")
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT CURRENT_VERSION()")
            version = cursor.fetchone()[0]
            print(f"✅ 接続成功！ Snowflake バージョン: {version}")
            cursor.close()
    except Exception as e:
        print(f"❌ 接続失敗: {e}")
        return False

    try:
        print("\n2. テーブル存在確認...")
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'QUIZ'
                ORDER BY table_name
            """)
            tables = cursor.fetchall()

            if tables:
                print("✅ テーブルが見つかりました:")
                for table in tables:
                    print(f"  - {table[0]}")
            else:
                print("❌ テーブルが見つかりません")
                print("   setup_db.py を実行してください")
            cursor.close()
    except Exception as e:
        print(f"❌ テーブル確認失敗: {e}")
        return False

    try:
        print("\n3. データ取得テスト...")
        sessions = get_quiz_sessions(limit=5)
        print(f"✅ セッション数: {len(sessions)}")
        if sessions:
            print("\n最新のセッション:")
            for session in sessions[:3]:
                print(f"  - Session ID: {session['SESSION_ID'][:8]}...")
                print(f"    Score: {session['SCORE']}/{session['TOTAL_QUESTIONS']}")
                print(f"    Completed: {session['COMPLETED_AT']}")
        else:
            print("  （データがありません）")
    except Exception as e:
        print(f"❌ データ取得失敗: {e}")
        return False

    print("\n" + "=" * 50)
    print("テスト完了")
    print("=" * 50)
    return True

if __name__ == "__main__":
    test_connection()
