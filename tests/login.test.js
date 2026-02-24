import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import sql from '../src/db.js';

describe('POST /api/auth/login', () => {
    const testUser = {
        name: 'Login Tester',
        email: 'logintester@logintest.com',
        password: 'Senha123',
    };

    beforeAll(async () => {
        await sql("DELETE FROM users WHERE email LIKE '%@logintest.com'");

        await request(app)
            .post('/api/auth/register')
            .send(testUser);
    });

    afterAll(async () => {
        await sql("DELETE FROM users WHERE email LIKE '%@logintest.com'");
    });


    // TESTE 1: Login com sucesso → 200
    // ==========================================
    // Cenário: Fazer login com email e senha corretos
    // Comportamento esperado:
    //   - Status 200 (OK)
    //   - Mensagem "Login realizado com sucesso"
    //   - Retorna token JWT
    //   - Retorna user com id, name e email
    //   - NÃO retorna a senha do usuário
    it('deve fazer login com sucesso e retornar token + usuário', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        //verificar status 200
        expect(response.status).toBe(200);

        //verificar mensagem de sucesso
        expect(response.body.message).toBe('Login realizado com sucesso');

        //verificar se retornou o token
        expect(response.body).toHaveProperty('token');

        //verificar dados do usuário
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user.name).toBe('Login Tester');
        expect(response.body.user.email).toBe('logintester@logintest.com');

        //verificar se a senha não foi retornada
        expect(response.body.user).not.toHaveProperty('password');
    });


    // TESTE 2: Token JWT válido com dados corretos
    // ==========================================
    // Cenário: Decodificar o token retornado pelo login
    // Comportamento esperado:
    //   - Token pode ser verificado com JWT_SECRET
    //   - Contém id, email e name do usuário
    //   - Contém exp (expiração) e iat (emitido em)
    //
    // POR QUE ISSO IMPORTA?
    // O token JWT é o que prova a identidade do usuário.
    // Se o token tiver dados errados, o usuário poderia
    // acessar recursos de outro usuário.
    it('deve retornar um token JWT válido com os dados do usuário', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);

        expect(decoded).toHaveProperty('id');
        expect(decoded.email).toBe('logintester@logintest.com');
        expect(decoded.name).toBe('Login Tester');
        expect(decoded).toHaveProperty('exp');
        expect(decoded).toHaveProperty('iat');
    });


    // TESTE 3: Campos Obrigatórios Vazios → 400
    // ==========================================
    // Cenário: Enviar requisição sem email, sem senha
    //          ou com body completamente vazio
    // Comportamento esperado:
    //   - Status 400 (Bad Request) em TODOS os casos
    //   - Mensagem "Email e senha são obrigatórios"
    it('deve rejeitar quando campos obrigatórios estão vazios', async () => {
        // Sem email
        const semEmail = await request(app)
            .post('/api/auth/login')
            .send({ password: 'Senha123' });
        expect(semEmail.status).toBe(400);
        expect(semEmail.body.error).toBe('Email e senha são obrigatórios');

        // Sem senha
        const semSenha = await request(app)
            .post('/api/auth/login')
            .send({ email: 'logintester@logintest.com' });
        expect(semSenha.status).toBe(400);
        expect(semSenha.body.error).toBe('Email e senha são obrigatórios');

        // Body completamente vazio
        const vazio = await request(app)
            .post('/api/auth/login')
            .send({});
        expect(vazio.status).toBe(400);
        expect(vazio.body.error).toBe('Email e senha são obrigatórios');
    });


    // TESTE 4: Email não cadastrado → 401
    // ==========================================
    // Cenário: Tentar login com email que não existe no banco
    // Comportamento esperado:
    //   - Status 401 (Unauthorized)
    //   - Mensagem genérica "Credenciais inválidas"
    //
    // SEGURANÇA: Não dizemos "Email não encontrado" pois
    // um atacante poderia descobrir quais emails existem.
    it('deve retornar 401 para email não cadastrado', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'naoexiste@logintest.com',
                password: 'Senha123',
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Credenciais inválidas');
    });


    // TESTE 5: Senha incorreta → 401
    // ==========================================
    // Cenário: Tentar login com email certo mas senha errada
    // Comportamento esperado:
    //   - Status 401 (Unauthorized)
    //   - Mensagem genérica "Credenciais inválidas"
    //
    // SEGURANÇA: Mesma mensagem do teste 4!
    // Não dizemos "Senha incorreta" pelo mesmo motivo.
    it('deve retornar 401 para senha incorreta', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'SenhaErrada999',
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Credenciais inválidas');
    });


    // TESTE 6: Mensagem genérica para email errado e senha errada (SEGURANÇA!)
    // ==========================================
    // Cenário: Comparar a resposta de email errado com senha errada
    // Comportamento esperado:
    //   - Ambos retornam status 401
    //   - Ambos retornam EXATAMENTE a mesma mensagem de erro
    //
    // POR QUE ISSO IMPORTA?
    // Se a mensagem fosse diferente, um atacante faria:
    //   1. Testa email → "Email não encontrado" (ok, não existe)
    //   2. Testa email → "Senha incorreta" (opa, email existe!)
    // Com mensagem genérica, o atacante não sabe nada.
    it('deve usar a mesma mensagem de erro para email errado e senha errada', async () => {
        const emailErrado = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'fantasma@logintest.com',
                password: 'Senha123',
            });

        const senhaErrada = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'TotalmenteErrada',
            });

        expect(emailErrado.body.error).toBe(senhaErrada.body.error);
        expect(emailErrado.status).toBe(senhaErrada.status);
    });


    // TESTE 7: Resposta não deve conter a senha do usuário
    // ==========================================
    // Cenário: Verificar que a senha nunca aparece na resposta
    // Comportamento esperado:
    //   - O objeto user NÃO tem campo password
    //   - A senha em texto puro NÃO aparece em nenhum lugar do JSON
    it('não deve retornar a senha do usuário na resposta de login', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        expect(response.body.user).not.toHaveProperty('password');
        expect(JSON.stringify(response.body)).not.toContain(testUser.password);
    });


    // TESTE 8: Token JWT expira em 24h
    // ==========================================
    // Cenário: Verificar que o token tem expiração correta
    // Comportamento esperado:
    //   - Diferença entre exp e iat = 86400 segundos (24 horas)
    //
    // Na rota, usamos: jwt.sign(..., { expiresIn: '24h' })
    // Aqui confirmamos que isso está funcionando.
    it('deve gerar token com expiração de 24 horas', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
        const diffSeconds = decoded.exp - decoded.iat;

        expect(diffSeconds).toBe(86400);
    });
});
