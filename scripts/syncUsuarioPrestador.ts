import { prisma } from '../src/lib/db';
import bcrypt from 'bcrypt';

async function main() {
  const prestadores = await prisma.prestador.findMany();

  for (const prestador of prestadores) {
    if (!prestador.email || !prestador.cpf) continue;

    const exists = await prisma.usuarioPrestador.findFirst({
      where: { email: prestador.email }
    });

    if (!exists) {
      const cpfLimpo = prestador.cpf.replace(/\D/g, '');
      const senha_hash = await bcrypt.hash(cpfLimpo, 10);

      await prisma.usuarioPrestador.create({
        data: {
          prestador_id: prestador.id,
          email: prestador.email,
          senha_hash,
          ativo: true,
          primeiro_acesso: true,
        }
      });
      console.log(`Usuário criado para prestador ${prestador.nome} (${prestador.email})`);
    }
  }
  console.log('Sincronização concluída!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 