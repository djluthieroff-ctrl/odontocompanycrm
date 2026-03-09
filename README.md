# CRM Odonto Company

Sistema de gestão de leads, pacientes e agendamentos para a Odonto Company.

## 🚀 Como Executar Localmente
1. Abra o arquivo `index.html` em seu navegador (recomendado usar uma extensão de "Live Server").
2. O sistema iniciará em modo nuvem se as credenciais do Supabase estiverem configuradas em `supabase.js`.

## ☁️ Deployment (Vercel)
Este projeto está pronto para o deploy no Vercel.
1. Conecte este repositório ao seu painel da Vercel.
2. Certifique-se de que o `vercel.json` está na raiz.
3. Acesse a URL gerada e faça login.

## 🔄 Integração Unisoft (Firebird)
O sistema possui uma integração automática com o banco Firebird via n8n.
1. O n8n deve ler os novos registros da tabela `PACIENTE` do Firebird.
2. O n8n deve postar esses dados no Supabase na tabela `unisoft_sync`.
3. O CRM verificará a cada 5 minutos novos registros nessa tabela e os importará automaticamente como novos pacientes e cards no Kanban.

### Estrutura da tabela unisoft_sync:
- `source_table`: 'PACIENTE'
- `source_id`: Código do paciente no Firebird
- `data`: JSON com os campos `NOME`, `CELULAR`, `ENDERECO`, etc.
- `processed`: boolean (controle interno do CRM)

## 🛠️ Tecnologias
- HTML5 / CSS3 (Design Premium)
- JavaScript Vanilla
- Supabase (Backend/Auth)
- XLSX.js (Importação/Exportação)
