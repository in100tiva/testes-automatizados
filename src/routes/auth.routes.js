// ==========================================
// src/routes/auth.routes.js
// Rotas de Autenticação: Cadastro e Login
// ==========================================

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../db.js';

const router = Router();

// ==========================================
// POST /api/auth/register — Cadastro
// ==========================================
// Comportamentos esperados:
//   ✅ 201 - Cadastro com sucesso (retorna user sem senha)
//   ❌ 400 - Campos obrigatórios vazios
//   ❌ 400 - Email em formato inválido
//   ❌ 400 - Senha muito curta (< 6 caracteres)
//   ❌ 409 - Email já cadastrado
//   ✅ Senha salva com hash bcrypt (NUNCA texto puro)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // -----------------------------------
    // Validação 1: Campos obrigatórios
    // -----------------------------------
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Nome, email e senha são obrigatórios',
      });
    }

    // -----------------------------------
    // Validação 2: Formato do email
    // -----------------------------------
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Formato de email inválido',
      });
    }

    // -----------------------------------
    // Validação 3: Tamanho da senha
    // -----------------------------------
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Senha deve ter no mínimo 6 caracteres',
      });
    }

    // -----------------------------------
    // Validação 4: Email já existe no banco?
    // -----------------------------------
    const existingUser = await sql(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: 'Email já cadastrado',
      });
    }

    // -----------------------------------
    // Hash da senha com bcrypt (10 rounds)
    // -----------------------------------
    const hashedPassword = await bcrypt.hash(password, 10);

    // -----------------------------------
    // Inserir no banco e retornar dados
    // -----------------------------------
    const result = await sql(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result[0],
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==========================================
// POST /api/auth/login — Login
// ==========================================
// Comportamentos esperados:
//   ✅ 200 - Login com sucesso (retorna token JWT + user)
//   ❌ 400 - Campos obrigatórios vazios
//   ❌ 401 - Email não encontrado (mensagem genérica!)
//   ❌ 401 - Senha incorreta (mensagem genérica!)
//   ✅ Token JWT válido com dados do usuário
//
// SEGURANÇA: Usamos a mesma mensagem "Credenciais inválidas"
// para email errado e senha errada. Se diferenciássemos,
// um atacante poderia descobrir quais emails existem no sistema.
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // -----------------------------------
    // Validação: Campos obrigatórios
    // -----------------------------------
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios',
      });
    }

    // -----------------------------------
    // Buscar usuário no banco
    // -----------------------------------
    const users = await sql(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
      });
    }

    const user = users[0];

    // -----------------------------------
    // Comparar senha com hash do bcrypt
    // -----------------------------------
    const senhaCorreta = await bcrypt.compare(password, user.password);

    if (!senhaCorreta) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
      });
    }

    // -----------------------------------
    // Gerar token JWT (expira em 24h)
    // -----------------------------------
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
