# CRM Odonto Company - Sistema de Gestão Odontológica

Este é um sistema de CRM (Customer Relationship Management) completo e moderno, desenvolvido especialmente para clínicas odontológicas. O sistema permite a gestão eficiente de leads, pacientes, agendamentos, relatórios e metas, com sincronização em nuvem via Supabase e pronto para deploy na Vercel.

## 🚀 Funcionalidades Principais

- **Dashboard Inteligente**: Visão geral de leads, agendamentos, vendas e taxa de conversão.
- **Gestão de Leads**: Funil de vendas, integração com WhatsApp e importação/exportação via Excel.
- **Kanban de Atendimento**: Acompanhamento visual do fluxo de pacientes.
- **Fichas de Pacientes**: Cadastro completo com anamnese e histórico.
- **Agenda de Consultas**: Controle total de horários e procedimentos.
- **Pasta Vermelha**: Gestão de pacientes que não fecharam tratamento.
- **Relatórios & Metas**: Acompanhamento de performance e comissões do CRC.
- **Sincronização Cloud**: Autenticação e armazenamento seguro via Supabase.
- **Modo Offline**: Funciona localmente via LocalStorage caso o Supabase não esteja configurado.

---

## 🛠️ Configuração do Sistema de Login (Supabase)

Para ativar o sistema de login e a sincronização em nuvem, siga estes passos:

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto gratuito.
2. No menu lateral, clique em **SQL Editor**.
3. Clique em **New Query** e cole o conteúdo do arquivo `supabase-schema.sql` deste repositório.
4. Execute o script para criar todas as tabelas e políticas de segurança (RLS).

### 2. Configurar Credenciais
1. No painel do Supabase, vá em **Project Settings** > **API**.
2. Copie a **Project URL** e a **anon public key**.
3. No seu projeto local, abra o arquivo `config.js` e preencha os valores:

```javascript
window.__APP_CONFIG__ = {
  SUPABASE_URL: "https://seu-projeto.supabase.co",
  SUPABASE_ANON_KEY: "sua-chave-anon-publica"
};
```

### 3. Primeiro Acesso
1. Ao abrir o sistema, você verá a tela de login.
2. Clique em **"Criar conta"** para registrar seu primeiro usuário.
3. Após o login, o sistema migrará automaticamente qualquer dado existente no seu navegador para a nuvem.

---

## 📦 Publicação no GitHub

Para subir seu projeto para o GitHub:

1. Crie um novo repositório no GitHub.
2. No seu terminal (na pasta do projeto):
```bash
git init
git add .
git commit -m "Initial commit: CRM Odonto System"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git push -u origin main
```

> **Dica**: O arquivo `config.js` contém chaves públicas (anon key), que são seguras para subir no GitHub. No entanto, nunca suba chaves de serviço (service_role) ou segredos sensíveis.

---

## 🌐 Deploy na Vercel

O projeto já está configurado com `vercel.json` para funcionar perfeitamente na Vercel como um SPA (Single Page Application).

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard).
2. Clique em **Add New** > **Project**.
3. Importe o repositório que você acabou de subir para o GitHub.
4. A Vercel detectará as configurações automaticamente. Clique em **Deploy**.
5. Seu sistema estará online em poucos segundos!

---

## 📂 Estrutura de Arquivos

- `index.html`: Ponto de entrada principal.
- `app.js`: Lógica central e gerenciamento de estado.
- `auth.js` / `auth.css`: Sistema de autenticação.
- `supabase.js`: Camada de dados e integração com Supabase.
- `modules/`: Módulos específicos (leads, pacientes, agendamentos, etc).
- `utils/`: Utilitários (máscaras, higienização de dados, WhatsApp).
- `schema.sql`: Script de criação do banco de dados.

---

## 📝 Licença

Este projeto é de uso interno para Odonto Company.

---
🤖 *Checkup e preparação realizados com assistência técnica especializada.*
