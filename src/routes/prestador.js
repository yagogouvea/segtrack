const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

// Simulação de banco de dados (substitua pelo seu modelo real)
const db = {
  Prestadores: {
    async findOne({ email }) {
      // Exemplo: prestador hardcoded
      if (email === 'prestador@exemplo.com') {
        return {
          id: 1,
          email: 'prestador@exemplo.com',
          nome: 'Prestador Exemplo',
          senhaHash: await bcrypt.hash('senha123', 10), // senha: senha123
        };
      }
      return null;
    }
  }
};

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios." });
  }

  const db = await require('../src/lib/prisma').ensurePrisma();
  const usuario = await db.usuarioPrestador.findFirst({
    where: { email, ativo: true }
  });

  if (!usuario) {
    return res.status(401).json({ erro: "Usuário não encontrado ou inativo." });
  }

  const senhaValida = await require('bcrypt').compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    return res.status(401).json({ erro: "Senha inválida." });
  }

  const prestador = await db.prestador.findUnique({ where: { id: usuario.prestador_id } });

  const token = require('jsonwebtoken').sign(
    {
      id: usuario.id,
      email: usuario.email,
      nome: prestador?.nome,
      tipo: 'prestador'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '12h' }
  );

  res.json({ token, usuario: { id: usuario.id, email: usuario.email, nome: prestador?.nome } });
});

module.exports = router; 