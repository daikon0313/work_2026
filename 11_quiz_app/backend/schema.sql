-- クイズアプリケーション用テーブル定義
-- Database: {DATABASE}
-- Schema: {SCHEMA}
-- 注意: {DATABASE} と {SCHEMA} は setup_db.py によって環境変数の値に置換されます

-- 0. スキーマの作成（存在しない場合）
CREATE SCHEMA IF NOT EXISTS {DATABASE}.{SCHEMA};

-- 1. クイズセッションテーブル
-- クイズ全体の結果を記録
CREATE TABLE IF NOT EXISTS {DATABASE}.{SCHEMA}.QUIZ_SESSIONS (
    session_id VARCHAR(36) PRIMARY KEY,          -- セッションID（UUID）
    user_id VARCHAR(100),                         -- ユーザーID（任意、現在はnull許可）
    score INTEGER NOT NULL,                       -- 正解数
    total_questions INTEGER NOT NULL,             -- 総問題数
    correct_rate FLOAT,                           -- 正解率（%）
    completed_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),  -- 完了日時
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()      -- 作成日時
);

-- 2. クイズ回答詳細テーブル
-- 各問題の回答履歴を記録（分析用）
CREATE TABLE IF NOT EXISTS {DATABASE}.{SCHEMA}.QUIZ_ANSWERS (
    answer_id INTEGER AUTOINCREMENT PRIMARY KEY,  -- 回答ID（自動採番）
    session_id VARCHAR(36) NOT NULL,              -- セッションID（外部キー）
    question_id INTEGER NOT NULL,                 -- 問題ID
    question_text VARCHAR(1000),                  -- 問題文
    selected_answer INTEGER NOT NULL,             -- 選択した回答のインデックス
    correct_answer INTEGER NOT NULL,              -- 正解のインデックス
    is_correct BOOLEAN NOT NULL,                  -- 正解かどうか
    answered_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),  -- 回答日時
    FOREIGN KEY (session_id) REFERENCES {DATABASE}.{SCHEMA}.QUIZ_SESSIONS(session_id)
);

-- 注意: Snowflake の通常テーブルでは INDEX は作成できません
-- 大規模データの場合は CLUSTER BY を使用しますが、今回は不要です

-- 確認用クエリ
-- SELECT * FROM {DATABASE}.{SCHEMA}.QUIZ_SESSIONS;
-- SELECT * FROM {DATABASE}.{SCHEMA}.QUIZ_ANSWERS;
