/**
 * RuralCommerce — sincronização local com o Git (entrada).
 * Uso: na raiz do projeto: npm run sync:entrada
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

console.log('\n========== ENTRADA (baixar do Git na nuvem) ==========');
console.log('Pasta:', root);
console.log('Comando: git pull\n');

try {
  execSync('git pull', { stdio: 'inherit' });
  console.log('\n----------');
  console.log('[OK] Entrada concluída com sucesso.');
  console.log('Sua pasta local está alinhada com o que está no Git remoto.');
  console.log('----------\n');
  process.exit(0);
} catch {
  console.error('\n----------');
  console.error('[ERRO] A entrada falhou.');
  console.error('Veja a mensagem do Git acima (rede, conflito, branch, etc.).');
  console.error('----------\n');
  process.exit(1);
}
