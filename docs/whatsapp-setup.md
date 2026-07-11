# Guia WhatsApp — Impulso MiPyMEs (Meta Cloud API)

Use este guia quando for configurar WhatsApp. O código já está pronto; falta só a conta Meta e duas variáveis no servidor.

## O que você precisa no final

No servidor (`.env.production.local`):

```
WHATSAPP_CLOUD_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_UTILITY_TEMPLATE_NAME=projeto_atualizacao
WHATSAPP_UTILITY_TEMPLATE_LANG=es
WHATSAPP_DEFAULT_COUNTRY_CODE=+506
```

Depois: `npm run push:resend-env` (no PC) e `pm2 restart ruralcommerce --update-env` (no servidor).

---

## Passo 1 — Conta Meta Business

1. Acesse https://business.facebook.com
2. Crie ou use a conta **Business** da Rural Commerce
3. Verifique a empresa (documentos) se a Meta pedir — necessário para número real

---

## Passo 2 — App de desenvolvedor

1. Acesse https://developers.facebook.com
2. **My Apps** → **Create App** → tipo **Other** → **Business**
3. Nome sugerido: `Rural Commerce WhatsApp`
4. No app, menu lateral → **Add Product** → **WhatsApp** → **Set up**

---

## Passo 3 — Número e IDs

1. WhatsApp → **API Setup**
2. Anote:
   - **Phone number ID** (número longo, ex. `123456789012345`) → `WHATSAPP_PHONE_NUMBER_ID`
   - **WhatsApp Business Account ID** (só referência)
3. **Temporary access token** (24h) — serve para teste
4. Para produção: **System Users** na Business Settings → gerar token permanente com permissão `whatsapp_business_messaging`

Cole o token em `WHATSAPP_CLOUD_TOKEN`.

---

## Passo 4 — Template de mensagem (obrigatório)

A Meta **não permite** texto livre. Só templates aprovados.

1. https://business.facebook.com → **WhatsApp Manager** → **Message templates**
2. **Create template**
   - **Name:** `projeto_atualizacao` (exatamente este nome)
   - **Category:** **Utility** (NÃO Marketing)
   - **Language:** Spanish
   - **Body:**

```
Hola {{1}}, actualización del proyecto Impulso MiPyMEs: {{2}}. Detalles: {{3}}
```

3. **Submit** e aguarde aprovação (minutos a 48h)

| Variável | Conteúdo enviado pelo sistema |
|----------|-------------------------------|
| {{1}} | Nome do participante |
| {{2}} | Resumo (ex. convite ao convenio) |
| {{3}} | Link (ex. ruralcommerceglobal.com/es/projeto/convenio) |

---

## Passo 5 — Teste (números de teste)

Na **API Setup**, adicione seu celular em **To** (números de teste) antes de aprovar número comercial.

Envie uma aprovação de perfil no painel admin ou um broadcast — se configurado, o participante recebe WhatsApp.

---

## Passo 6 — Enviar credenciais ao servidor

No PC (pasta do projeto):

1. Edite `resend-server.env` e preencha `WHATSAPP_CLOUD_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID`
2. Ou coloque no `.env.local` e rode: `node scripts/merge-projeto-env.mjs`
3. Rode: `npm run push:resend-env`
4. No servidor: `pm2 restart ruralcommerce --update-env`

Validar: `npm run validate:projeto`

---

## Problemas comuns

| Erro | Solução |
|------|---------|
| Template not found | Nome deve ser `projeto_atualizacao`, idioma `es` |
| Template rejected | Use categoria **Utility**, texto operacional |
| Invalid phone | Telefone na inscrição com DDI (+506...) |
| Token expired | Gere token permanente (System User) |
| Message failed | Destinatário precisa ter opt-in (convênio seção 6) |

---

## Enquanto WhatsApp não estiver pronto

O projeto funciona normalmente com **e-mail** (Resend) e **push** (VAPID). WhatsApp é ignorado se as variáveis estiverem vazias.
