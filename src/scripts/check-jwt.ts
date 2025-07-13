import jwt from 'jsonwebtoken';

function checkJWT() {
  console.log('Verificando JWT_SECRET...');
  
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET não está configurado!');
    return;
  }

  try {
    const testToken = jwt.sign(
      { test: true },
      process.env.JWT_SECRET,
      { expiresIn: '1m' }
    );

    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('✅ JWT_SECRET está configurado e funcionando!');
    console.log('Token de teste decodificado:', decoded);
  } catch (error: unknown) {
    console.error('❌ Erro ao verificar JWT:', error);
    process.exit(1);
  }
}

checkJWT(); 