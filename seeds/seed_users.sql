CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Efficient way to insert 100k records
INSERT INTO users (name, email)
SELECT 
    'User ' || i, 
    'user' || i || '@example.com'
FROM generate_series(1, 100000) s(i);