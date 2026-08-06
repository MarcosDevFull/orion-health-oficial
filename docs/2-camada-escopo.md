📑 DOCUMENTO ATUALIZADO: CAMADA ESCOPO
Modelo Jesse James Garrett | Orion Health – Versão 1.0
Objetivo: Definir exatamente o que faz parte do lançamento inicial, mantendo o foco claro: paciente e profissional de saúde, deixando a integração com operadoras, clínicas e laboratórios para a evolução futura.

1. ALINHAMENTO E ATUALIZAÇÕES
✅ Foco da V1.0: Relacionamento direto e seguro entre Paciente ↔ Médico
✅ Consultas online integradas mantidas nesta versão
📌 Itens reservados para versões futuras / Roadmap:

Integração direta com operadoras de saúde
Cadastro e gestão própria de clínicas
Conexão automática com laboratórios
Bot de acompanhamento pós-consulta
Convênios com farmácias
Área de marketing e aquisição

Todos os requisitos elaborados por você foram revisados e mantidos apenas o que cabe ao escopo inicial.
2. O QUE FAZ PARTE DESTA VERSÃO
2.1 Lista de Funcionalidades (Resumo Alinhado ao Foco)

Tabela
Funcionalidade Principal
Inclui
Prioridade
Busca e agendamento
Por especialidade, local, tipo atendimento + horário real + pagamento PIX + reembolso
Essencial
Perfil de Saúde Centralizado
Anamnese única, registros diários, exames, receitas, evolução
Essencial
Controle de Privacidade
Permissões, compartilhamento controlado, convite a cuidador
Essencial
Consulta Online Integrada
Sala de vídeo nativa, sem apps externos
Essencial
Fluxo Clínico Completo
Confirmação dupla, receita digital, encaminhamento, relatórios
Essencial / Alta
Apoio e Acompanhamento
Lembretes, metas, importação de dados, envio manual de resultados
Alta
Validação de Profissionais
Cadastro verificado e selo de confiança
Alta

2.2 REQUISITOS FUNCIONAIS (RF)
(Ótica do Design: o que o sistema entrega ao usuário/negócio)

Tabela
ID
Nome
Prioridade
Descrição
RF01
Busca por Especialidade e Localização
Essencial
O usuário deve poder buscar profissionais por especialidade, localização e tipo de atendimento.
RF02
Agendamento em Tempo Real
Essencial
Exibir horários disponíveis atualizados após selecionar o profissional.
RF03
Pagamento Antecipado via PIX
Essencial
Permitir pagamento com PIX e geração de QR Code.
RF04
Reembolso Automático
Essencial
Devolver 100% do valor se o atendimento não ocorrer em até 24h.
RF05
Perfil de Saúde Centralizado
Essencial
Armazenar receitas, exames, anamnêses e registros em um só lugar.
RF06
Anamnese Única
Alta
Preencher uma vez e reutilizar em todas as consultas.
RF07
Registro de Bem-Estar
Alta
Anotar sono, humor e dores para acompanhamento.
RF08
Compartilhamento Controlado
Essencial
O usuário decide o que cada profissional pode ver.
RF09
Lembretes de Medicação
Alta
Notificações após confirmação do paciente.
RF10
Encaminhamento Clínico
Alta
Médico registra encaminhamento diretamente no perfil.
RF11
Sugestão de Especialistas
Alta
Indicar profissionais disponíveis após encaminhamento.
RF12
Confirmação Dupla
Essencial
Paciente e médico confirmam; liberação de pagamento.
RF13
Receita Eletrônica
Alta
Gerar e enviar receita diretamente ao perfil.
RF14
Visualização Pré-Consulta
Essencial
Médico acessa histórico antes do atendimento.
RF15
Acompanhamento Pós-Consulta
Alta
Propor ciclo de acompanhamento com check-ins.
RF16
Consulta Online Integrada
Essencial
Vídeo nativo, sem instalação extra.
RF19
Envio de Resultados
Essencial
Receber arquivos de exames enviados manualmente ou por link seguro.
RF20
Convite ao Cuidador
Essencial
Autorizar acesso parcial a familiares.
RF21
Mensagem via Cuidador
Essencial
Comunicar necessidades diretamente ao médico.
RF22
Notificação Pré-Consulta
Essencial
Alerta 10 minutos antes do início.
RF23
Registro de Alimentação
Alta
Anotar refeições diárias.
RF24
Solicitar Receita
Essencial
Editor digital com dosagem e observações.
RF25
Criar Encaminhamento
Alta
Documento com motivo e recomendações.
RF27
Relatório Clínico Completo
Essencial
PDF unificado com todo o atendimento.
RF28
Assinatura Digital Simulada
Alta
Carimbo com CRM e dados do profissional.
RF29
Histórico Consolidado
Essencial
Ver todas as consultas e documentos.
RF30
Efeitos de Medicação
Alta
Registrar reações ao tratamento.
RF31
Metas de Acompanhamento
Alta
Definir o que será monitorado até a próxima consulta.
RF32
Relatório Geral
Essencial
Visão macro de todos os atendimentos.
RF33
Importar Dados Externos
Alta
Trazer informações de apps de saúde.
RF34
Link Seguro para Exames
Alta
Receber arquivos de laboratórios externos.
RF35
Validação de Profissionais
Alta
Cadastro com verificação; só aprovados atuam.

2.3 REQUISITOS NÃO FUNCIONAIS (RNF)
(Ótica do Design: como o sistema deve se comportar)

Tabela
ID
Nome
Prioridade
Descrição
RNF01
Armazenamento
Essencial
Capacidade mínima para todos os dados clínicos.
RNF02
Tempo de Resposta
Essencial
Carregamento em até 2 segundos.
RNF03
Disponibilidade
Essencial
24h por dia, 7 dias por semana.
RNF04
Multiplataforma
Essencial
Celular, tablet e desktop.
RNF06
Conformidade LGPD
Essencial
Garantir todos os direitos do titular.
RNF07
Funcionamento Offline
Alta
Visualizar dados salvos; sincronizar depois.
RNF09
Notificações
Essencial
Alertas para eventos importantes.
RNF10
Escalabilidade
Essencial
Suportar crescimento gradativo.
RNF11
Usabilidade
Essencial
Simples, clara e acessível.
RNF12
Autenticação Segura
Essencial
Proteção de acesso e dados.
RNF13
Hospedagem
Essencial
Nuvem com backup.
RNF14
Suporte
Alta
Canal de atendimento.
RNF15
Documentação
Alta
Registro completo do sistema.
RNF16
Mobile-First
Essencial
Projeto prioriza telas de celular.
RNF17
Geração de PDF
Alta
Relatórios formatados.
RNF18
Backup
Alta
Cópia diária automática.

3. O QUE FICA FORA DESTA VERSÃO (PARA O ROADMAP)

Tabela
Item
Motivo
Operadoras de Saúde
Integração futura após consolidação da base usuário-médico
Clínicas próprias
Gestão direta por unidades será implementada posteriormente
Laboratórios integrados
Recebimento automático via rede após lançamento inicial
Bot de acompanhamento
Automação após validação do fluxo humano
Farmácias parceiras
Convênios após estruturação do atendimento
Área de marketing
Ações de crescimento em etapa seguinte

4. VALIDAÇÃO FINAL
✅ Foco mantido: Tudo serve ao vínculo Paciente ↔ Profissional
✅ Requisitos: 32 RF + 16 RNF — todos alinhados ao propósito
✅ Corte estratégico: Nada foi excluído por falta de importância — apenas organizado na ordem certa de evolução
✅ Próxima etapa: Camada Estrutura — definir como essas funcionalidades se conectam e fluem.
