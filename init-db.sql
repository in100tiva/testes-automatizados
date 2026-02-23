-- ==========================================
-- init-db.sql
-- Script de criação da tabela users
-- ==========================================
-- Execute este SQL no console do Neon (dashboard)
-- ou via qualquer client PostgreSQL conectado ao Neon.
--
-- Acesse: https://console.neon.tech
-- Vá em: SQL Editor → Cole este script → Run

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para buscas por email (melhora performance do login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Verificar se a tabela foi criada
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
