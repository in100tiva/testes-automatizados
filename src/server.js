// ==========================================
// src/server.js — Starter do Servidor
// ==========================================
// Este arquivo SÓ é usado para rodar o servidor em dev/produção.
// Os testes usam diretamente o app.js via Supertest.
// Essa separação é uma prática profissional muito importante!

import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📍 POST http://localhost:${PORT}/api/auth/register`);
  console.log(`📍 POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📍 GET  http://localhost:${PORT}/api/profile`);
});
