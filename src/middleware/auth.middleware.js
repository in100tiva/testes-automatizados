// ==========================================
// src/middleware/auth.middleware.js
// Middleware de Autenticação JWT
// ==========================================
// Este middleware verifica se a requisição tem um token JWT válido.
// Ele é usado como "guarda" das rotas protegidas.
//
// Como funciona:
// 1. Pega o header Authorization da requisição
// 2. Verifica se está no formato "Bearer <token>"
// 3. Decodifica o token com a chave secreta
// 4. Se válido, anexa os dados do usuário em req.user
// 5. Se inválido, retorna 401 (Unauthorized)

import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  // -----------------------------------
  // Passo 1: Verificar se o header existe
  // -----------------------------------
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token não fornecido',
    });
  }

  // -----------------------------------
  // Passo 2: Verificar formato "Bearer <token>"
  // -----------------------------------
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Formato de token inválido',
    });
  }

  const token = parts[1];

  // -----------------------------------
  // Passo 3: Verificar e decodificar o token
  // -----------------------------------
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Anexa dados do usuário na requisição
    // Agora qualquer rota depois pode acessar req.user
    req.user = decoded;

    // Passa para a próxima função (a rota)
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido ou expirado',
    });
  }
}
