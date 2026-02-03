-- Snowflake側のセットアップ用SQL
-- Embulkでデータをロードする前にSnowflakeで実行してください

-- データベースの作成
CREATE DATABASE IF NOT EXISTS embulk_tutorial;
USE DATABASE embulk_tutorial;

-- スキーマの作成
CREATE SCHEMA IF NOT EXISTS public;
USE SCHEMA public;

-- テーブルの作成
CREATE TABLE IF NOT EXISTS users (
    id INTEGER,
    name VARCHAR(100),
    email VARCHAR(255),
    department VARCHAR(50),
    created_at TIMESTAMP
);

-- ロード後の確認用クエリ
-- SELECT * FROM users;
-- SELECT COUNT(*) FROM users;
