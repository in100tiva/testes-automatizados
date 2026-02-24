import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import sql from '../src/db.js';

describe('POST /api/auth/register', () => {
    beforeAll(async () => {
        await sql("DELETE FROM users WHERE email LIKE '%@teste.com'");
    });
    afterAll(async () => {
        await sql("DELETE FROM users WHERE email LIKE '%@teste.com'");
    });


    it('deve cadastrar um novo usuário com sucesso', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                name: "Bruno Alves",
                email: "brunoalves@teste.com",
                password: "123456"
            });

        //verificar status 201    
        expect(response.status).toBe(201);

        //verificar mensagem de sucesso
        expect(response.body.message).toBe("Usuário criado com sucesso");

        //verificar se o usuário foi criado com sucesso
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user.name).toBe("Bruno Alves");
        expect(response.body.user.email).toBe("brunoalves@teste.com");

        //verificar se a senha não foi retornada
        expect(response.body.user).not.toHaveProperty("password");
    });
});


//teste 2

 // Cenário: Tentar cadastrar com email que já existe
  // Comportamento esperado:
  //   - Status 409 (Conflict)
  //   - Mensagem informando que email já existe
  it('deve rejeitar cadastro com email já existente', async () => {
    // Primeiro cadastro (deve funcionar)
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'João Original',
        email: 'joao@teste.com',
        password: 'Senha123',
      });

    // Segundo cadastro com MESMO email (deve falhar)
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Luan Oliveira',
        email: 'LuanPDD123@gmail.com',
        password: '123456',
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Email já cadastrado');
  });



// TESTE 3: Campos Obrigatórios Vazios → 400
  // ==========================================
  // Cenário: Enviar requisição sem um ou mais campos
  // Comportamento esperado:
  //   - Status 400 (Bad Request) em TODOS os casos
  //   - Deve funcionar sem nome, sem email, sem senha
  //     e com body completamente vazio
  it('deve rejeitar quando campos obrigatórios estão vazios', async () => {
    // Sem nome
    const semNome = await request(app)
      .post('/api/auth/register')
      .send({ email: 'teste@teste.com', password: 'Senha123' });
    expect(semNome.status).toBe(400);

    // Sem email
    const semEmail = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Teste', password: 'Senha123' });
    expect(semEmail.status).toBe(400);

    // Sem senha
    const semSenha = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Teste', email: 'teste@teste.com' });
    expect(semSenha.status).toBe(400);

    // Body completamente vazio
    const vazio = await request(app)
      .post('/api/auth/register')
      .send({});
    expect(vazio.status).toBe(400);
  });


  // TESTE 4: Email Formato Inválido → 400
  // ==========================================
  // Cenário: Enviar emails que não são emails de verdade
  // Comportamento esperado:
  //   - Status 400 para cada formato inválido
  //   - Mensagem específica sobre formato de email
  it('deve rejeitar email em formato inválido', async () => {
    const emailsInvalidos = [
      'invalido',         // sem @ e sem ponto
      'sem@ponto',        // sem ponto no domínio
      '@semlocal.com',    // sem parte local
      'espa co@email.com', // espaço no meio
    ];

    for (const email of emailsInvalidos) {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Teste', email, password: 'Senha123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Formato de email inválido');
    }
  });

  // TESTE 5: Senha Muito Curta → 400
  // ==========================================
  // Cenário: Enviar senha com menos de 6 caracteres
  // Comportamento esperado:
  //   - Status 400 (Bad Request)
  //   - Mensagem sobre tamanho mínimo da senha
  it('deve rejeitar senha com menos de 6 caracteres', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Teste',
        email: 'curta@teste.com',
        password: '123', // Só 3 caracteres!
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Senha deve ter no mínimo 6 caracteres');
  });

   // TESTE 6: Senha Salva com Hash (SEGURANÇA!)
  // ==========================================
  // Cenário: Verificar que a senha no banco NÃO é
  //          a mesma que o usuário digitou
  // Comportamento esperado:
  //   - Senha no banco ≠ senha original
  //   - Senha no banco é um hash bcrypt ($2b$...)
  //
  // POR QUE ISSO IMPORTA?
  // Se alguém hackear o banco, não consegue ver as senhas.
  // O bcrypt transforma "Senha123" em algo como:
  // "$2b$10$xK8fQ..." que é impossível de reverter.
  it('deve salvar a senha com hash no banco (nunca texto puro)', async () => {
    const senhaOriginal = 'MinhaS3nha!';

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Seguro',
        email: 'seguro@teste.com',
        password: senhaOriginal,
      });

    // Buscar direto no banco para verificar
    const userDB = await sql(
      'SELECT password FROM users WHERE email = $1',
      ['seguro@teste.com']
    );

    // A senha no banco NÃO pode ser igual à original
    expect(userDB[0].password).not.toBe(senhaOriginal);

    // Mas deve ser um hash válido do bcrypt (começa com $2)
    expect(userDB[0].password).toMatch(/^\$2[aby]\$/);
  });

