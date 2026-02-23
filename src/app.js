// ==========================================
// src/app.js — Express App (sem listen!)
// ==========================================
// IMPORTANTE: Este arquivo NÃO chama app.listen().
// Isso permite que o Supertest use o app nos testes
// sem conflito de porta. O listen() fica no server.js.

import express from 'express';
import authRoutes from './routes/auth.routes.js';
import protectedRoutes from './routes/protected.routes.js';

const app = express();

// Middleware para parsear JSON no body das requisições
app.use(express.json());

// Rotas de autenticação (cadastro e login)
app.use('/api/auth', authRoutes);

// Rotas protegidas (precisam de token JWT)
app.use('/api', protectedRoutes);

// Rota raiz para verificar se a API está rodando
app.get('/', (req, res) => {
  res.json({
    message: 'API de Autenticação funcionando!',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/profile (requer token)',
    },
  });
});

export default app;
