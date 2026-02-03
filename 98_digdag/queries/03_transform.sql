-- ユーザーごとの注文一覧（JOIN）
DROP TABLE IF EXISTS user_orders;

CREATE TABLE user_orders AS
SELECT
    u.id AS user_id,
    u.name AS user_name,
    u.email,
    o.id AS order_id,
    o.product,
    o.amount,
    o.ordered_at
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.amount >= 5000
ORDER BY o.ordered_at;
