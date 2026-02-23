// ==========================================
// src/routes/protected.routes.js
// Rotas Protegidas (requerem autenticação)
// ==========================================
// Estas rotas só podem ser acessadas por usuários autenticados.
// O authMiddleware verifica o token JWT antes de permitir acesso.
//
// Comportamentos esperados:
//   ✅ 200 - Token válido → retorna dados do usuário
//   ❌ 401 - Sem token → bloqueia acesso
//   ❌ 401 - Token inválido/adulterado → bloqueia
//   ❌ 401 - Formato errado (sem "Bearer") → bloqueia

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// ==========================================
// GET /api/profile — Perfil do Usuário
// ==========================================
// O authMiddleware roda ANTES desta função.
// Se o token for válido, req.user já terá os dados.
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Acesso autorizado',
    user: req.user,
  });
});

export default router;
