# 🧪 Testes Automatizados — Login & Cadastro com Neon

API de autenticação com testes automatizados completos.
Material da aula prática de testes com Vitest + Supertest + Neon PostgreSQL.

## Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Banco:** Neon PostgreSQL (serverless)
- **Auth:** bcrypt (hash) + JWT (tokens)
- **Testes:** Vitest + Supertest

## Setup Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Copiar e configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com sua connection string do Neon

# 3. Criar tabela no banco (execute no dashboard do Neon)
# Copie o conteúdo de init-db.sql

# 4. Rodar testes
npm test

# 5. Rodar servidor (dev)
npm run dev
```

## Estrutura

```
auth-neon-tests/
├── src/
│   ├── app.js              # Express app (sem listen)
│   ├── server.js           # Inicia o servidor
│   ├── db.js               # Conexão com Neon
│   ├── routes/
│   │   ├── auth.routes.js  # POST /register e /login
│   │   └── protected.routes.js  # GET /profile
│   └── middleware/
│       └── auth.middleware.js    # Verificação JWT
├── tests/
│   ├── register.test.js    # 6 testes de cadastro
│   ├── login.test.js       # 5 testes de login
│   └── protected.test.js   # 4 testes de rota protegida
├── init-db.sql             # SQL para criar tabela
├── .env.example            # Template de variáveis
└── vitest.config.js        # Configuração dos testes
```

## Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/register` | Cadastrar usuário | ❌ |
| POST | `/api/auth/login` | Fazer login | ❌ |
| GET | `/api/profile` | Ver perfil | ✅ Bearer Token |

## Testes (15 testes no total)

### Cadastro (6 testes)
- ✅ Cadastro com sucesso → 201
- ❌ Email duplicado → 409
- ❌ Campos vazios → 400
- ❌ Email inválido → 400
- ❌ Senha curta → 400
- ✅ Senha com hash bcrypt

### Login (5 testes)
- ✅ Login + JWT → 200
- ✅ Token válido e decodificável
- ❌ Email não cadastrado → 401
- ❌ Senha incorreta → 401
- ❌ Campos vazios → 400

### Rota Protegida (4 testes)
- ✅ Token válido → 200
- ❌ Sem token → 401
- ❌ Token falso → 401
- ❌ Formato errado → 401

## Comandos

```bash
npm test          # Roda testes em modo watch
npm run test:run  # Roda testes uma vez
npm run coverage  # Relatório de cobertura
npm run dev       # Inicia servidor
```
