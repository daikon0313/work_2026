-- ユーザーごとの注文集計
DROP TABLE IF EXISTS user_order_summary;

CREATE TABLE user_order_summary AS
SELECT
    u.name AS user_name,
    COUNT(o.id) AS order_count,
    SUM(o.amount) AS total_amount,
    AVG(o.amount) AS avg_amount,
    MIN(o.ordered_at) AS first_order,
    MAX(o.ordered_at) AS last_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
ORDER BY total_amount DESC NULLS LAST;
