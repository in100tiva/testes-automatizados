// ==========================================
// src/db.js — Conexão com o Neon PostgreSQL
// ==========================================
// O Neon é um PostgreSQL serverless na nuvem.
// A função neon() retorna uma tagged template function
// que executa queries SQL de forma segura (com parameterized queries).

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

export default sql;
