# ステップ3: API統合とデータ保存機能の実装

## 目的

FastAPI バックエンドと React フロントエンドを連携させ、クイズ結果を Snowflake に保存する機能を実装する。

## 実施内容

### 3-1. Snowflake 接続モジュールの作成

再利用可能な Snowflake 接続ヘルパー関数を `db.py` に実装しました。

#### ファイル: `backend/db.py`

```python
import tomli
import snowflake.connector
from pathlib import Path
from contextlib import contextmanager
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from typing import Dict, Any, List

def load_config() -> Dict[str, Any]:
    """connection.toml から Snowflake 設定を読み込む"""
    config_path = Path(__file__).parent.parent / "connection.toml"
    with open(config_path, "rb") as f:
        config = tomli.load(f)
    return config["snowflake"]

@contextmanager
def get_connection():
    """
    Snowflake 接続を取得するコンテキストマネージャー
    with 文で使用することで、自動的に接続をクローズする
    """
    # 設定読み込み、秘密鍵読み込み、接続作成
    # ...
    try:
        yield conn
    finally:
        conn.close()

def insert_quiz_session(...):
    """クイズセッション情報を QUIZ_SESSIONS テーブルに挿入"""
    # ...

def insert_quiz_answers(...):
    """クイズ回答詳細を QUIZ_ANSWERS テーブルにバルクインサート"""
    # ...

def get_quiz_sessions(...):
    """クイズセッション一覧を取得"""
    # ...
```

**重要なポイント:**

#### コンテキストマネージャー
```python
@contextmanager
def get_connection():
    conn = snowflake.connector.connect(...)
    try:
        yield conn
    finally:
        conn.close()
```
- `with get_connection() as conn:` で使用
- 自動的に接続をクローズするため、リソースリークを防ぐ
- 例外が発生しても確実にクリーンアップされる

#### バルクインサート
```python
cursor.executemany(sql, values)
```
- 複数の行を一度に挿入（効率的）
- クイズの回答詳細を一括で保存

### 3-2. FastAPI エンドポイントの実装

`main.py` に Pydantic モデルと API エンドポイントを追加しました。

#### Pydantic モデル定義

```python
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
```

**Pydantic の役割:**
- **自動バリデーション**: 型チェック、必須フィールドの確認
- **自動ドキュメント生成**: Swagger UI に型情報が表示される
- **型ヒント**: IDE の補完が効く

#### POST /api/quiz/submit エンドポイント

```python
@app.post("/api/quiz/submit", response_model=QuizSubmissionResponse)
async def submit_quiz(submission: QuizSubmission):
    """
    クイズ結果を Snowflake に保存
    """
    try:
        # セッションIDがない場合は生成
        session_id = submission.session_id or str(uuid.uuid4())

        # 正解率を計算
        correct_rate = (submission.score / submission.total_questions) * 100

        # セッション情報を保存
        session_saved = insert_quiz_session(
            session_id=session_id,
            score=submission.score,
            total_questions=submission.total_questions,
            correct_rate=correct_rate,
            user_id=submission.user_id
        )

        if not session_saved:
            raise HTTPException(status_code=500, detail="Failed to save")

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

        return QuizSubmissionResponse(
            success=True,
            message="クイズ結果を保存しました",
            session_id=session_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**処理フロー:**
1. リクエストボディを Pydantic モデルで自動バリデーション
2. セッション ID がない場合は UUID を生成
3. 正解率を計算
4. `QUIZ_SESSIONS` テーブルにセッション情報を挿入
5. `QUIZ_ANSWERS` テーブルに回答詳細をバルクインサート
6. 成功レスポンスを返す

#### GET /api/quiz/sessions エンドポイント

```python
@app.get("/api/quiz/sessions")
async def get_sessions(limit: int = 10):
    """
    クイズセッション一覧を取得
    """
    try:
        sessions = get_quiz_sessions(limit=limit)
        return {
            "success": True,
            "count": len(sessions),
            "sessions": sessions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 3-3. React フロントエンドの API 連携

`Quiz.tsx` コンポーネントに API 呼び出し機能を追加しました。

#### 回答履歴の追跡

```typescript
type AnswerHistory = {
  question_id: number
  question_text: string
  selected_answer: number
  correct_answer: number
  is_correct: boolean
}

const [answerHistory, setAnswerHistory] = useState<AnswerHistory[]>([])
```

#### 回答選択時に履歴を記録

```typescript
const handleAnswerClick = (answerIndex: number) => {
  setSelectedAnswer(answerIndex)

  const isCorrect = answerIndex === currentQuestion.correctAnswer
  if (isCorrect) {
    setScore(score + 1)
  }

  // 回答履歴に追加
  const newAnswer: AnswerHistory = {
    question_id: currentQuestion.id,
    question_text: currentQuestion.question,
    selected_answer: answerIndex,
    correct_answer: currentQuestion.correctAnswer,
    is_correct: isCorrect
  }
  setAnswerHistory([...answerHistory, newAnswer])
}
```

#### クイズ終了時に結果を保存

```typescript
const saveQuizResults = async (finalScore: number, finalAnswers: AnswerHistory[]) => {
  setIsSaving(true)
  setSaveMessage('')

  try {
    const response = await fetch('http://localhost:8000/api/quiz/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        score: finalScore,
        total_questions: quizData.length,
        answers: finalAnswers
      })
    })

    if (!response.ok) {
      throw new Error('Failed to save quiz results')
    }

    const data = await response.json()
    setSaveMessage(`✅ ${data.message}`)
  } catch (error) {
    console.error('Error saving quiz results:', error)
    setSaveMessage('❌ 結果の保存に失敗しました')
  } finally {
    setIsSaving(false)
  }
}

const handleNextQuestion = () => {
  const nextQuestion = currentQuestionIndex + 1

  if (nextQuestion < quizData.length) {
    setCurrentQuestionIndex(nextQuestion)
    setSelectedAnswer(null)
  } else {
    // クイズ終了時に結果を保存
    const finalScore = score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0)
    saveQuizResults(finalScore, answerHistory)
    setShowScore(true)
  }
}
```

**Fetch API の使い方:**
- `fetch()`: JavaScript 標準の HTTP クライアント
- `method: 'POST'`: HTTP メソッド指定
- `headers`: リクエストヘッダー（JSON 形式を指定）
- `body`: リクエストボディ（JSON 文字列に変換）
- `response.json()`: レスポンスを JSON にパース

#### 保存状態の UI 表示

```typescript
{isSaving && (
  <p style={{ color: '#2196F3', marginTop: '20px' }}>
    💾 結果を保存中...
  </p>
)}
{saveMessage && (
  <p style={{
    marginTop: '20px',
    fontSize: '16px',
    color: saveMessage.includes('✅') ? '#4CAF50' : '#f44336'
  }}>
    {saveMessage}
  </p>
)}
```

## 動作確認

### 1. バックエンドの起動

```bash
cd /Users/d.harato/personal/2026/11_quiz_app/backend

# 依存パッケージがインストールされているか確認
pip list | grep -E "fastapi|uvicorn|snowflake"

# サーバー起動
uvicorn main:app --reload --port 8000
```

**起動確認:**
- コンソールに `Application startup complete` と表示される
- http://localhost:8000/docs にアクセスして Swagger UI が表示される

### 2. フロントエンドの起動

```bash
cd /Users/d.harato/personal/2026/11_quiz_app

# 依存パッケージがインストールされているか確認
npm list react

# 開発サーバー起動
npm run dev
```

**起動確認:**
- コンソールに `VITE v7.x.x ready in xxx ms` と表示される
- http://localhost:5173 にアクセスしてクイズアプリが表示される

### 3. 統合テスト

#### テストシナリオ:
1. ブラウザで http://localhost:5173 を開く
2. クイズを開始し、3問すべてに回答
3. 「結果を見る」をクリック
4. 結果画面に「💾 結果を保存中...」が表示される
5. 保存完了後「✅ クイズ結果を保存しました」と表示される

#### Snowflake で確認:

```sql
-- セッション一覧を確認
SELECT * FROM YOUR_DATABASE.QUIZ.QUIZ_SESSIONS
ORDER BY completed_at DESC
LIMIT 5;

-- 最新セッションの回答詳細を確認
SELECT
    q.session_id,
    q.question_id,
    q.question_text,
    q.selected_answer,
    q.correct_answer,
    q.is_correct
FROM YOUR_DATABASE.QUIZ.QUIZ_ANSWERS q
JOIN (
    SELECT session_id
    FROM YOUR_DATABASE.QUIZ.QUIZ_SESSIONS
    ORDER BY completed_at DESC
    LIMIT 1
) s ON q.session_id = s.session_id
ORDER BY q.question_id;
```

#### cURL でテスト（オプション）:

```bash
# クイズ結果を送信
curl -X POST http://localhost:8000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "score": 2,
    "total_questions": 3,
    "answers": [
      {
        "question_id": 1,
        "question_text": "日本の首都はどこですか?",
        "selected_answer": 2,
        "correct_answer": 2,
        "is_correct": true
      },
      {
        "question_id": 2,
        "question_text": "1 + 1 = ?",
        "selected_answer": 1,
        "correct_answer": 1,
        "is_correct": true
      },
      {
        "question_id": 3,
        "question_text": "Reactのフックで状態管理に使うのは?",
        "selected_answer": 1,
        "correct_answer": 0,
        "is_correct": false
      }
    ]
  }'

# セッション一覧を取得
curl http://localhost:8000/api/quiz/sessions?limit=5
```

## 重要な概念

### REST API の設計

#### エンドポイント命名規則:
- **リソース指向**: `/api/quiz/submit` (動詞 + 名詞)
- **複数形**: `/api/quiz/sessions` (コレクション)
- **階層構造**: `/api/quiz/sessions/{id}` (詳細)

#### HTTP メソッド:
- **POST**: データ作成（`/api/quiz/submit`）
- **GET**: データ取得（`/api/quiz/sessions`）
- **PUT/PATCH**: データ更新（未実装）
- **DELETE**: データ削除（未実装）

#### ステータスコード:
- **200 OK**: 成功（GET）
- **201 Created**: 作成成功（POST）
- **400 Bad Request**: リクエストエラー
- **500 Internal Server Error**: サーバーエラー

### CORS (Cross-Origin Resource Sharing)

異なるオリジン間の通信を許可する仕組み。

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React アプリ
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**なぜ必要?**
- ブラウザのセキュリティ機能で、デフォルトでは異なるオリジン間の通信はブロックされる
- React (localhost:5173) と API (localhost:8000) は異なるポート = 異なるオリジン
- CORS 設定で明示的に許可する必要がある

### UUID (セッション ID)

```python
import uuid
session_id = str(uuid.uuid4())
# 例: "550e8400-e29b-41d4-a716-446655440000"
```

**特徴:**
- 世界中で一意な識別子
- ランダム生成で重複の心配がない
- 36文字（ハイフン含む）

### 非同期処理 (async/await)

#### バックエンド (FastAPI):
```python
async def submit_quiz(submission: QuizSubmission):
    # 非同期関数として定義
    # 実際の処理は同期的でも FastAPI が最適化
```

#### フロントエンド (React):
```typescript
const saveQuizResults = async (...) => {
  const response = await fetch('...')  // 非同期で待機
  const data = await response.json()   // 非同期で待機
}
```

**メリット:**
- UI がブロックされない（ユーザー体験向上）
- 複数のリクエストを並行処理可能

### エラーハンドリング

#### バックエンド:
```python
try:
    # 処理
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

#### フロントエンド:
```typescript
try {
  const response = await fetch('...')
  if (!response.ok) {
    throw new Error('Failed to save')
  }
} catch (error) {
  console.error('Error:', error)
  setSaveMessage('❌ 保存に失敗しました')
}
```

## トラブルシューティング

### エラー: ModuleNotFoundError: No module named 'db'

**原因**: Python モジュールが見つからない

**対処**:
```bash
# backend ディレクトリで実行しているか確認
pwd
# → /Users/d.harato/personal/2026/11_quiz_app/backend

# main.py と db.py が同じディレクトリにあるか確認
ls -la
```

### エラー: CORS policy: No 'Access-Control-Allow-Origin'

**原因**: CORS 設定が正しくない

**対処**:
- `main.py` の `allow_origins` にフロントエンドの URL が含まれているか確認
- バックエンドが起動しているか確認
- ブラウザのコンソールでエラー詳細を確認

### エラー: Failed to save quiz results

**原因**: Snowflake 接続エラーまたはテーブル不存在

**対処**:
```bash
# Snowflake テーブルが存在するか確認
python3 setup_db.py

# connection.toml の設定を確認
cat ../connection.toml

# バックエンドのログを確認
# uvicorn のコンソール出力にエラーメッセージが表示される
```

### フロントエンドから API にアクセスできない

**チェックリスト:**
1. バックエンドが起動しているか: `http://localhost:8000/health`
2. CORS 設定が正しいか: `main.py` の `allow_origins`
3. ポート番号が正しいか: フロントエンド 5173、バックエンド 8000
4. ブラウザのコンソールにエラーが表示されていないか

## ファイル構成

```
backend/
├── db.py                  # Snowflake 接続モジュール（新規作成）
├── main.py                # FastAPI アプリケーション（更新）
├── requirements.txt       # Python 依存パッケージ
├── schema.sql             # Snowflake テーブル定義
└── setup_db.py            # テーブル作成スクリプト

src/quiz_components/
└── Quiz.tsx               # クイズコンポーネント（更新）
```

## 追加された機能

### バックエンド
- ✅ Snowflake 接続モジュール (`db.py`)
- ✅ `POST /api/quiz/submit`: クイズ結果の保存
- ✅ `GET /api/quiz/sessions`: セッション一覧の取得
- ✅ Pydantic モデルによる自動バリデーション
- ✅ UUID によるセッション ID 自動生成
- ✅ エラーハンドリング

### フロントエンド
- ✅ 回答履歴の追跡
- ✅ クイズ終了時の API 呼び出し
- ✅ 保存中のローディング表示
- ✅ 保存成功/失敗のメッセージ表示
- ✅ エラーハンドリング

## 次のステップ

### ステップ4: データ分析・可視化機能の追加

1. **統計情報 API の実装**
   - `GET /api/quiz/stats`: 全体統計（平均点、正解率など）
   - `GET /api/quiz/questions/stats`: 問題別統計

2. **フロントエンドに統計画面を追加**
   - Chart.js などのグラフライブラリを導入
   - 正解率の推移グラフ
   - 問題別の正解率グラフ

3. **ユーザー認証の追加**
   - ユーザー登録・ログイン機能
   - セッションとユーザーの紐付け
   - ユーザー別のダッシュボード

## 参考資料

### FastAPI
- [FastAPI 公式ドキュメント](https://fastapi.tiangolo.com/)
- [Pydantic モデル](https://docs.pydantic.dev/)
- [CORS ミドルウェア](https://fastapi.tiangolo.com/tutorial/cors/)

### React
- [Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API)
- [useState フック](https://react.dev/reference/react/useState)
- [非同期処理 (async/await)](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function)

### Snowflake
- [Snowflake Python Connector](https://docs.snowflake.com/en/developer-guide/python-connector/python-connector)
- [INSERT 文](https://docs.snowflake.com/en/sql-reference/sql/insert)

## まとめ

このステップで、以下を実装しました:

1. **Snowflake 接続モジュール**: 再利用可能な接続ヘルパー関数
2. **FastAPI エンドポイント**: クイズ結果の保存とセッション一覧取得
3. **React API 連携**: クイズ終了時の自動保存機能

これで、フロントエンドからバックエンド、データベースまで一気通貫でデータが流れる仕組みが完成しました！
