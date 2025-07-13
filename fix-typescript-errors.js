const fs = require('fs');
const path = require('path');

// Função para corrigir erros de tipagem em um arquivo
function fixTypeScriptErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Padrão para encontrar catch blocks com error sem tipo
    const catchPattern = /catch\s*\(\s*error\s*\)\s*{/g;
    const catchWithAnyPattern = /catch\s*\(\s*error\s*:\s*any\s*\)\s*{/g;

    // Substituir catch(error) por catch(error: unknown)
    if (catchPattern.test(content)) {
      content = content.replace(catchPattern, 'catch (error: unknown) {');
      modified = true;
    }

    // Substituir catch(error: any) por catch(error: unknown)
    if (catchWithAnyPattern.test(content)) {
      content = content.replace(catchWithAnyPattern, 'catch (error: unknown) {');
      modified = true;
    }

    // Corrigir referências a error.message, error.stack, etc.
    const errorMessagePattern = /error\.message/g;
    const errorStackPattern = /error\.stack/g;
    const errorCodePattern = /error\.code/g;
    const errorNamePattern = /error\.name/g;

    if (errorMessagePattern.test(content)) {
      content = content.replace(errorMessagePattern, 'error instanceof Error ? error.message : String(error)');
      modified = true;
    }

    if (errorStackPattern.test(content)) {
      content = content.replace(errorStackPattern, 'error instanceof Error ? error.stack : undefined');
      modified = true;
    }

    if (errorCodePattern.test(content)) {
      content = content.replace(errorCodePattern, '(error as any)?.code');
      modified = true;
    }

    if (errorNamePattern.test(content)) {
      content = content.replace(errorNamePattern, 'error instanceof Error ? error.name : undefined');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

// Função para processar recursivamente um diretório
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Pular node_modules e outros diretórios desnecessários
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fixTypeScriptErrors(filePath);
    }
  }
}

// Processar o diretório src
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
  console.log('🔧 Corrigindo erros de TypeScript...');
  processDirectory(srcPath);
  console.log('✅ Correção concluída!');
} else {
  console.log('❌ Diretório src não encontrado');
} 