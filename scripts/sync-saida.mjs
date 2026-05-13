/**
 * RuralCommerce — envia alterações locais para o Git e opcionalmente dispara deploy (saída).
 * Uso: na raiz do projeto: npm run sync:saida
 *
 * Ordem: primeiro commit (working tree limpa), depois pull --rebase, depois push.
 * O Git não deixa `pull --rebase` com alterações não commitadas.
 *
 * Variável opcional: DEPLOY_WEBHOOK_URL — URL POST chamada após git push.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

function run(cmd) {
  console.log('>', cmd);
  execSync(cmd, { stdio: 'inherit', shell: true });
}

function porcelain() {
  return execSync('git status --porcelain', { encoding: 'utf8' }).trim();
}

const resumo = [];

console.log('\n========== SAÍDA (enviar para o Git + deploy opcional) ==========');
console.log('Pasta:', root);

console.log('\n--- Passo 1: gravar alterações locais (git add / commit) ---');
const statusInicial = porcelain();
if (!statusInicial) {
  console.log('Nenhuma alteração local pendente — seguindo para pull e push.');
  resumo.push('Commit: nada a gravar');
} else {
  try {
    run('git add -A');
    const msg = `sync local ${new Date().toISOString()}`;
    run(`git commit -m "${msg.replace(/"/g, "'")}"`);
    resumo.push('Commit: OK');
  } catch {
    const depois = porcelain();
    if (depois) {
      console.error('\n----------');
      console.error('[ERRO] Não foi possível criar o commit.');
      console.error('Veja a mensagem do Git acima, corrija o problema e rode de novo.');
      console.error('----------\n');
      process.exit(1);
    }
    console.log('(Nada novo para commitar após o add — continuando.)');
    resumo.push('Commit: sem mudanças novas');
  }
}

console.log('\n--- Passo 2: git pull --rebase ---');
try {
  run('git pull --rebase');
  resumo.push('Pull/rebase: OK');
} catch {
  console.error('\n----------');
  console.error('[ERRO] git pull --rebase falhou.');
  console.error('Pode ser conflito com o remoto — resolva no Git e tente de novo.');
  console.error('----------\n');
  process.exit(1);
}

console.log('\n--- Passo 3: git push ---');
try {
  run('git push');
  resumo.push('Push: OK');
} catch {
  console.error('\n----------');
  console.error('[ERRO] git push falhou.');
  console.error('Sem rede, sem permissão, ou branch divergente — veja o Git acima.');
  console.error('----------\n');
  process.exit(1);
}

const webhook = process.env.DEPLOY_WEBHOOK_URL;
console.log('\n--- Passo 4: webhook de deploy (opcional) ---');
if (webhook && webhook.startsWith('http')) {
  try {
    console.log('Chamando DEPLOY_WEBHOOK_URL...');
    const res = await fetch(webhook, { method: 'POST' });
    if (res.ok) {
      console.log(`[OK] Webhook respondeu HTTP ${res.status}.`);
      resumo.push(`Webhook: OK (${res.status})`);
    } else {
      console.error(`[AVISO] Webhook respondeu HTTP ${res.status} — confira no painel do host se o deploy rodou.`);
      resumo.push(`Webhook: HTTP ${res.status} (verificar)`);
    }
  } catch (e) {
    console.error('[ERRO] Falha ao chamar o webhook:', e instanceof Error ? e.message : e);
    resumo.push('Webhook: falhou');
  }
} else {
  console.log('DEPLOY_WEBHOOK_URL não definido — sem chamada automática de deploy.');
  resumo.push('Webhook: não usado');
}

console.log('\n----------');
console.log('[OK] Saída concluída (Git enviado).');
console.log('Resumo:', resumo.join(' | '));
console.log('----------\n');
process.exit(0);
