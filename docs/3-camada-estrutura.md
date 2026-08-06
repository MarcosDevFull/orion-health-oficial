# 3ª Camada - Estrutura

Nesta camada, serão desenvolvidos os 3 artefatos entregáveis:

1. Arquitetura de Informação
2. Fluxos de Interação
3. Mapa de Navegação Geral

---

## 1️⃣ PRIMEIRO ENTREGÁVEL: ARQUITETURA DA INFORMAÇÃO

### Estrutura Hierárquica

```plaintext
🔐 ACESSO
├─ Cadastro
├─ Login / Recuperação de acesso
└─ Validação de profissional

👤 ÁREA DO PACIENTE
├─ 📋 Meu Perfil de Saúde
│  ├─ Dados pessoais
│  ├─ Anamnese única
│  ├─ Histórico consolidado
│  ├─ Exames, receitas, encaminhamentos
│  ├─ Vacinas
│  ├─ Registro de bem-estar, alimentação e efeitos
│  └─ Metas de acompanhamento
├─ 📅 Agendamento
│  ├─ Busca por especialidade/local
│  ├─ Horários disponíveis
│  ├─ Pagamento e confirmação
│  └─ Reembolso automático
├─ 📹 Minhas Consultas
│  ├─ Próximas
│  ├─ Realizadas
│  └─ Consulta online integrada
├─ 🔒 Privacidade e Acesso
│  ├─ Permissões por profissional
│  ├─ Convite a cuidador
│  └─ Revogação de acesso
└─ ⚙️ Configurações e Relatórios
   ├─ Notificações
   ├─ Relatórios em PDF
   └─ Importação de dados

🩺 ÁREA DO PROFISSIONAL
├─ 📋 Meu Cadastro e Validação
├─ 📅 Agenda e Horários
├─ 📂 Prontuários e Atendimentos
│  ├─ Dados pré-consulta
│  ├─ Receita, encaminhamento, relatório
│  └─ Confirmação de atendimento
└─ 🤝 Acompanhamento
   ├─ Definição de metas
   └─ Sugestão de especialistas
```

---

## 2️⃣ SEGUNDO ENTREGÁVEL: FLUXOS DE INTERAÇÃO

**Atualizado conforme sua observação essencial sobre usabilidade e cadastro progressivo**

**Objetivo:** Sequência lógica, fluida e sem bloqueios desnecessários — sempre ligada à Arquitetura de Informação e ao Escopo definido.

---

### 📌 FLUXO 01: CRIAR CONTA E ACESSAR O PERFIL DE SAÚDE

*(Ajuste fundamental: anamnese não é exigida no cadastro — só quando for necessária para uma ação)*

`Página Inicial` → `Entrar / Criar Conta` → `Escolher perfil: Paciente` → `Criar conta gratuita (dados básicos apenas)` → `Confirmação por e-mail` → `Acesso direto ao Perfil de Saúde`

> **Regra:** A anamnese única será solicitada apenas no primeiro agendamento ou primeiro registro clínico — nunca no início, para não causar abandono.

---

### 📌 FLUXO 02: BUSCAR E AGENDAR CONSULTA

*(Ajuste solicitado: compartilhamento granular antes do pagamento)*

`Tela Inicial` → `Agendamento` → `Escolher especialidade / local / tipo de atendimento` → `Selecionar profissional verificado` → `Escolher horário disponível` → `Confirmar dados` → `Autorizar compartilhamento granular dos dados de saúde pertinentes ao atendimento` → `Pagamento via PIX` → `Confirmação do agendamento + notificação automática`

---

### 📌 FLUXO 03: REALIZAR CONSULTA ONLINE

*(Mantido como estava — totalmente correto)*

`Minhas Consultas` → `Selecionar consulta agendada` → `Acessar sala de vídeo integrada` → `Atendimento` → `Médico preenche receita/encaminhamento/relatório` → `Ambos confirmam atendimento` → `Pagamento liberado` → `Documentos enviados diretamente ao Perfil de Saúde`

---

### 📌 FLUXO 04: GERENCIAR DADOS E PERMISSÕES

*(Mantido como estava — totalmente correto)*

`Meu Perfil de Saúde` → `Privacidade e Acesso` → `Escolher profissional/cuidador` → `Definir o que ele pode ver` → `Definir prazo de acesso (se quiser)` → `Confirmar` → `Acesso liberado / revogado imediatamente`

---

### 📌 FLUXO 05: ACOMPANHAR TRATAMENTO E REGISTRAR DADOS

*(Mantido como estava — totalmente correto)*

`Meu Perfil de Saúde` → `Acompanhamento` → `Visualizar metas definidas pelo médico` → `Registrar medicação/alimentação/bem-estar/efeitos` → `Salvar` → `Dados atualizados automaticamente no perfil`

---

### 📌 FLUXO 06: GERAR RELATÓRIO CLÍNICO COMPLETO

*(Mantido como estava — totalmente correto)*

`Meu Perfil de Saúde` → `Relatórios` → `Escolher período/tipo de registro` → `Solicitar relatório consolidado` → `Visualizar / Baixar PDF / Compartilhar via link seguro`

---

### ✅ VALIDAÇÃO DAS ALTERAÇÕES

- ✅ **Cadastro progressivo:** Apenas o essencial no início; dados mais detalhados são pedidos só quando forem úteis — evita abandono e melhora a experiência
- ✅ **Controle granular:** O usuário decide exatamente o que compartilha antes de confirmar o agendamento — reforça autonomia e segurança
- ✅ **Todos os requisitos do Escopo continuam atendidos**
- ✅ **Nenhuma funcionalidade inventada ou excluída**

---

## 3️⃣ TERCEIRO ENTREGÁVEL: MAPA DE NAVEGAÇÃO GERAL

**Objetivo:** Apresentar a visão completa de todas as seções e como elas se conectam — garantindo que o usuário nunca se perca e sempre saiba onde está e para onde ir.

---

### 🗺️ ESTRUTURA GERAL DE NAVEGAÇÃO

```plaintext
🔐 ENTRADA
└─ Página Inicial
   ├─ Entrar
   └─ Criar Conta Gratuita

📱 MENU PRINCIPAL (APÓS ACESSO)
├─ 🏠 Início
│  ├─ Próximas consultas
│  ├─ Acessos recentes
│  └─ Ações mais frequentes
│
├─ 📋 Meu Perfil de Saúde
│  ├─ Dados pessoais
│  ├─ Histórico consolidado
│  ├─ Exames, receitas e encaminhamentos
│  ├─ Registro de bem-estar/alimentação/medicação
│  ├─ Metas de acompanhamento
│  └─ Relatórios e downloads
│
├─ 📅 Agendamento
│  ├─ Buscar profissionais
│  ├─ Meus agendamentos
│  └─ Pagamentos
│
├─ 📹 Minhas Consultas
│  ├─ Aguardando atendimento
│  ├─ Realizadas
│  └─ Acesso à sala de vídeo
│
├─ 🔒 Privacidade e Acesso
│  ├─ Permissões concedidas
│  ├─ Convite a cuidador
│  └─ Revogar acessos
│
└─ ⚙️ Configurações
   ├─ Dados da conta
   ├─ Preferências de notificação
   └─ Ajuda e suporte
```

---

### 🩺 NAVEGAÇÃO ESPECÍFICA - ÁREA DO PROFISSIONAL

```plaintext
🏠 Início
├─ Minha agenda
├─ Prontuários em atendimento
└─ Meu cadastro e validação
```

---

### ✅ REGRAS DE NAVEGAÇÃO

- O usuário retorna ao **Menu Principal** a qualquer momento em **1 clique**
- Nenhum conteúdo sensível é acessado sem confirmação ou permissão
- A ordem segue a frequência de uso: o que o usuário mais faz fica mais visível
- Tudo o que foi definido na **Arquitetura de Informação** e nos **Fluxos** está contemplado aqui
