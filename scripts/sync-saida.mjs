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
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

/** Lê DEPLOY_WEBHOOK_URL de .env.local ou .env se ainda não estiver no ambiente (facilita no Windows). */
function loadDeployWebhookFromProjectEnvFiles() {
  if (process.env.DEPLOY_WEBHOOK_URL?.trim()) return;

  for (const name of ['.env.local', '.env']) {
    const filePath = path.join(root, name);
    if (!existsSync(filePath)) continue;

    const text = readFileSync(filePath, 'utf8');
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const m = line.match(/^DEPLOY_WEBHOOK_URL\s*=\s*(.*)$/);
      if (!m) continue;
      let v = m[1].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (v) {
        process.env.DEPLOY_WEBHOOK_URL = v;
        console.log(`(Usando DEPLOY_WEBHOOK_URL definido em ${name})`);
      }
      return;
    }
  }
}

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

loadDeployWebhookFromProjectEnvFiles();

const webhook = process.env.DEPLOY_WEBHOOK_URL?.trim();
console.log('\n--- Passo 4: atualização do SERVIDOR (deploy) ---');
if (webhook && webhook.startsWith('http')) {
  try {
    console.log('Chamando DEPLOY_WEBHOOK_URL (disparo de deploy no provedor)...');
    const res = await fetch(webhook, { method: 'POST' });
    if (res.ok) {
      console.log(`[OK] Deploy: webhook respondeu HTTP ${res.status} (confira no painel do host se o build terminou).`);
      resumo.push(`Deploy (webhook): HTTP ${res.status} OK`);
    } else {
      console.error(
        `[AVISO] Webhook respondeu HTTP ${res.status} — o Git já foi atualizado; confira manualmente se o deploy rodou no host.`
      );
      resumo.push(`Deploy (webhook): HTTP ${res.status} (verificar)`);
    }
  } catch (e) {
    console.error('[ERRO] Falha ao chamar o webhook de deploy:', e instanceof Error ? e.message : e);
    console.error('O Git já foi enviado; o servidor pode ainda estar na versão antiga até o deploy ser feito.');
    resumo.push('Deploy (webhook): falhou');
  }
} else {
  console.log('Nenhum deploy automático foi disparado neste passo.');
  console.log('');
  console.log('Motivo: não há DEPLOY_WEBHOOK_URL (URL que o painel de hospedagem costuma chamar de "Deploy hook" / webhook).');
  console.log('');
  console.log('O que já foi feito: commit + push para o GitHub — o código está na nuvem.');
  console.log('O que falta para o SITE/SERVIDOR atualizar:');
  console.log('  - ou configurar DEPLOY_WEBHOOK_URL no Windows (variável de ambiente) ou no arquivo .env.local na raiz do projeto;');
  console.log('  - ou abrir o painel do host (Vercel, Netlify, cPanel, etc.) e clicar em "Deploy" / "Publicar" manualmente.');
  resumo.push('Deploy servidor: não configurado (só Git)');
}

console.log('\n----------');
console.log('[OK] Saída concluída (Git enviado).');
console.log('Resumo:', resumo.join(' | '));
console.log('----------\n');
process.exit(0);
