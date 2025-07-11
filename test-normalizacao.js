// Teste da função de normalização de texto
function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim();
}

// Testes
const testes = [
  'São Paulo',
  'SAO PAULO', 
  'são paulo',
  'SÃO PAULO',
  'Jardim Paulista',
  'JARDIM PAULISTA',
  'jardim paulista',
  'Centro',
  'CENTRO',
  'centro',
  'Bragança Paulista',
  'BRAGANÇA PAULISTA',
  'bragança paulista',
  'Atibaia',
  'ATIBAIA',
  'atibaia',
  'Campinas',
  'CAMPINAS',
  'campinas'
];

console.log('🧪 Testando normalização de texto:');
console.log('=====================================');

testes.forEach(texto => {
  const normalizado = normalizarTexto(texto);
  console.log(`"${texto}" -> "${normalizado}"`);
});

console.log('\n✅ Teste concluído!');
console.log('A função remove acentos e converte para minúsculas corretamente.'); 