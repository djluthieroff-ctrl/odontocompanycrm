# Módulo de Campanhas - CRM Odonto Company

## Visão Geral

O Módulo de Campanhas é um sistema completo para gestão de disparos em massa de mensagens via WhatsApp, integrado ao CRM Odonto Company. Este módulo permite criar, gerenciar e monitorar campanhas de marketing, cobrança, aniversários, lembretes e recuperação de leads.

## Funcionalidades Principais

### 📊 Dashboard de Campanhas
- Visão geral das campanhas ativas e concluídas
- Métricas de desempenho em tempo real
- Taxa de entrega, leitura e falhas
- Progresso das metas diárias e semanais

### 📤 Importação de Contatos
- Importação de arquivos CSV com validação automática
- Detecção automática de delimitadores e codificação
- Validação de números de telefone brasileiros
- Identificação de duplicatas e contatos inválidos
- Modelo de CSV pronto para download

### 📝 Sistema de Templates
- Criação e gerenciamento de templates com variáveis
- 50+ variáveis prontas para uso (nome, telefone, tratamento, etc.)
- Categorias de templates (Marketing, Pasta Vermelha, Cobrança, etc.)
- Substituição automática de variáveis
- Validação de templates antes da criação

### ⏰ Agendamento Inteligente
- Agendamento de campanhas para datas e horários específicos
- Controle de limites diários, horários e intervalos
- Sistema de filas e processamento automático
- Integração com limitador de taxa para evitar bloqueios

### 🛡️ Rate Limiting e Anti-Ban
- Limites configuráveis de mensagens por minuto/hora/dia
- Intervalos aleatórios entre mensagens para evitar detecção
- Sistema de pausa e retomada automática
- Monitoramento em tempo real de limites e status

### 🔗 Integração com Módulos Existentes
- Sincronização automática com Leads
- Integração com Pacientes para campanhas de fidelização
- Lembretes automáticos baseados em agendamentos
- Campanhas de recuperação para Pasta Vermelha

### 📈 Relatórios e Métricas
- Relatórios detalhados de desempenho
- Taxas de entrega, leitura e falhas por campanha
- Comparativo de performance entre campanhas
- Exportação de dados para Excel

## Arquitetura do Sistema

### Estrutura de Arquivos

```
crm-odonto-company/
├── modules/campaigns.js              # Módulo principal de campanhas
├── styles/campaigns.css              # Estilos específicos do módulo
├── utils/
│   ├── csv-parser.js                 # Parser de arquivos CSV
│   ├── rate-limiter.js               # Sistema de limitação de taxa
│   ├── campaign-scheduler.js         # Agendador de campanhas
│   ├── template-system.js            # Sistema de templates
│   ├── module-integration.js         # Integração com outros módulos
│   └── test-validation.js            # Testes e validação
├── docs/
│   └── CAMPAIGNS_MODULE.md           # Documentação (este arquivo)
└── supabase-campaigns-schema.sql     # Schema do banco de dados
```

### Banco de Dados

O módulo utiliza o mesmo banco de dados Supabase do CRM, com as seguintes tabelas:

- **campaigns**: Dados das campanhas
- **campaign_templates**: Templates de mensagens
- **contact_lists**: Listas de contatos
- **contacts**: Contatos individuais
- **campaign_messages**: Mensagens enviadas
- **blacklist**: Contatos bloqueados

## Configuração e Uso

### 1. Inicialização do Módulo

O módulo é carregado automaticamente quando o CRM inicia. Para garantir que todas as dependências estejam carregadas:

```javascript
// No app.js principal
import './modules/campaigns.js';
import './utils/csv-parser.js';
import './utils/rate-limiter.js';
import './utils/campaign-scheduler.js';
import './utils/template-system.js';
import './utils/module-integration.js';
import './utils/test-validation.js';

// Inicializar módulo
document.addEventListener('DOMContentLoaded', () => {
    initCampaignsModule();
    initCSVParser();
    initRateLimiter();
    initCampaignScheduler();
    initTemplateSystem();
    initModuleIntegration();
    initTestValidation();
});
```

### 2. Criação de uma Campanha

1. **Acesse o módulo**: Clique em "Campanhas" no menu lateral
2. **Crie uma nova campanha**: Clique em "Nova Campanha"
3. **Configure os parâmetros**:
   - Nome da campanha
   - Tipo de campanha (Marketing, Pasta Vermelha, etc.)
   - Template de mensagem
   - Lista de contatos
   - Agendamento e limites
4. **Salve e inicie**: A campanha pode ser iniciada imediatamente ou agendada

### 3. Importação de Contatos

1. **Prepare o CSV**: Use o modelo disponível no botão "Baixar Modelo"
2. **Importe o arquivo**: Clique em "Importar Contatos" e selecione o arquivo
3. **Revise a pré-visualização**: Verifique os dados antes da importação
4. **Confirme a importação**: Os contatos serão adicionados automaticamente

### 4. Criação de Templates

1. **Acesse o gerenciador**: Clique em "Gerenciar Templates"
2. **Crie um novo template**:
   - Nome e categoria
   - Conteúdo com variáveis (ex: `Olá {{nome}}!`)
   - Variáveis disponíveis são listadas automaticamente
3. **Valide e salve**: O sistema valida automaticamente

## Variáveis Disponíveis

O sistema oferece 50+ variáveis prontas para uso:

### Básicas
- `{{nome}}` - Nome do cliente
- `{{phone}}` - Número de telefone
- `{{email}}` - E-mail do cliente

### Odontológicas
- `{{unidade}}` - Unidade odontológica
- `{{data_consulta}}` - Data da consulta
- `{{horario}}` - Horário da consulta
- `{{tratamento_recomendado}}` - Tratamento recomendado
- `{{valor_total}}` - Valor total do tratamento

### Comerciais
- `{{valor}}` - Valor do tratamento
- `{{data_vencimento}}` - Data de vencimento
- `{{parcelas}}` - Número de parcelas
- `{{valor_parcela}}` - Valor de cada parcela
- `{{desconto}}` - Valor do desconto

### Médicas
- `{{data_nascimento}}` - Data de nascimento
- `{{cpf}}` - CPF do cliente
- `{{convenio}}` - Convênio do cliente
- `{{plano}}` - Plano do convênio
- `{{historico_medico}}` - Histórico médico

### De Vendas
- `{{score_lead}}` - Score do lead
- `{{etapa_vendas}}` - Etapa nas vendas
- `{{probabilidade_fechamento}}` - Probabilidade de fechamento
- `{{valor_potencial}}` - Valor potencial
- `{{fonte_lead}}` - Fonte do lead

## Configuração de Limites

### Limites Padrão (Conservadores)
- **Mensagens por minuto**: 20
- **Mensagens por hora**: 200
- **Mensagens por dia**: 1000
- **Intervalo mínimo**: 3 segundos
- **Intervalo máximo**: 8 segundos

### Personalização de Limites
Os limites podem ser ajustados nas configurações do rate limiter:

```javascript
// Exemplo de configuração personalizada
RateLimiterState.limits = {
    messagesPerMinute: 15,    // Mais conservador
    messagesPerHour: 150,
    messagesPerDay: 800,
    intervalMin: 5000,        // 5 segundos
    intervalMax: 12000        // 12 segundos
};
```

## Integração com Outros Módulos

### Leads
- **Sincronização automática**: Novos leads são adicionados como contatos
- **Campanhas automáticas**: Criação de campanhas de boas-vindas
- **Segmentação**: Leads podem ser segmentados por fonte e score

### Pacientes
- **Fidelização**: Campanhas de aniversário e pós-tratamento
- **Reengajamento**: Campanhas para pacientes inativos
- **Preventiva**: Lembretes de consultas de rotina

### Agendamentos
- **Lembretes automáticos**: 1 dia antes da consulta
- **Confirmação**: Solicitação de confirmação de presença
- **Cancelamento**: Comunicação sobre cancelamentos

### Pasta Vermelha
- **Recuperação automática**: Campanhas específicas para leads perdidos
- **Segmentação inteligente**: Baseado no motivo da perda
- **Templates específicos**: Mensagens de recuperação

## Monitoramento e Relatórios

### Métricas em Tempo Real
- **Taxa de entrega**: Percentual de mensagens entregues
- **Taxa de leitura**: Percentual de mensagens lidas
- **Taxa de falhas**: Percentual de mensagens falhas
- **Velocidade de envio**: Mensagens por minuto/hora

### Relatórios Detalhados
- **Performance por campanha**: Comparativo entre campanhas
- **Performance por template**: Eficiência dos templates
- **Performance por segmento**: Resultados por tipo de cliente
- **Exportação**: Dados exportáveis para Excel

## Segurança e Conformidade

### Proteção contra Banimento
- **Limites conservadores**: Configurações que evitam bloqueios
- **Intervalos aleatórios**: Variação nos intervalos para parecer humano
- **Monitoramento ativo**: Detecção de possíveis bloqueios
- **Pausa automática**: Sistema para quando detecta risco

### Privacidade
- **Blacklist**: Sistema de bloqueio de contatos que não desejam receber mensagens
- **Opt-out**: Facilidade para os clientes se descadastrarem
- **Dados sensíveis**: Proteção de informações médicas e financeiras

## Testes e Validação

### Testes Automáticos
O módulo inclui um sistema de testes abrangente:

```javascript
// Executar todos os testes
runAllTests();

// Testes específicos
runCoreTests();           // Testes de núcleo
runIntegrationTests();    // Testes de integração
runPerformanceTests();    // Testes de performance
runUITests();            // Testes de interface
```

### Tipos de Testes
- **Armazenamento**: Persistência de dados
- **Validação**: Validação de entradas e saídas
- **Cálculo**: Métricas e estatísticas
- **Integração**: Comunicação entre módulos
- **Performance**: Grande volume de dados
- **UI**: Interface e usabilidade

## Troubleshooting

### Problemas Comuns

#### Importação de CSV Falha
- **Causa**: Formato incorreto do arquivo
- **Solução**: Use o modelo fornecido e verifique a codificação UTF-8

#### Mensagens Não São Enviadas
- **Causa**: Limites de taxa atingidos
- **Solução**: Verifique o status do rate limiter e aguarde o reset

#### Templates Não Funcionam
- **Causa**: Variáveis incorretas ou faltando
- **Solução**: Verifique a lista de variáveis disponíveis e a sintaxe

#### Integração com Módulos Falha
- **Causa**: Eventos não disparados corretamente
- **Solução**: Verifique se os módulos estão carregados e os eventos estão configurados

### Logs e Depuração
O sistema inclui logs detalhados para depuração:

```javascript
// Ativar logs detalhados
console.log('Campaign created:', campaign);
console.log('Rate limiter status:', getRateLimiterStatus());
console.log('Template validation:', validateTemplate(template));
```

## Atualizações e Manutenção

### Atualizações Futuras Planejadas
- **Integração com WhatsApp Business API**: Para maior volume e recursos
- **Aprendizado de Máquina**: Otimização automática de horários e conteúdos
- **Multicanal**: Expansão para SMS, e-mail e outros canais
- **Analytics Avançado**: Métricas preditivas e recomendções automáticas

### Manutenção Recomendada
- **Limpeza de dados**: Remoção periódica de contatos inválidos
- **Atualização de templates**: Revisão e atualização de mensagens
- **Monitoramento de limites**: Ajuste conforme necessidade e políticas do WhatsApp
- **Backup de dados**: Exportação regular dos dados importantes

## Suporte Técnico

Para suporte técnico, consulte:

1. **Documentação**: Este arquivo e comentários no código
2. **Logs do Sistema**: Console do navegador para erros detalhados
3. **Testes**: Sistema de testes para validação de funcionalidades
4. **Comunidade**: Fóruns e grupos de desenvolvedores

## Licença e Contribuições

Este módulo faz parte do CRM Odonto Company e segue os mesmos termos de licenciamento. Contribuições são bem-vindas através de pull requests com testes e documentação adequados.

---

**Última Atualização**: Março 2026
**Versão**: 1.0.0
**Status**: Produção