# Blueprint de Estrutura, Copy e Design do Quiz Express com IA

Este documento descreve detalhadamente a arquitetura do aplicativo de quiz interativo, dividida em pilares de **Estratégia de Marketing/Copy**, **Design Visual/UI** e **Lógica de Funcionamento/Código**. Você pode usar este documento como prompt para instruir outra IA a criar um projeto semelhante em qualquer segmento.

---

## 1. Visão Geral do Projeto (O "Core")
O projeto é um **Funil de Vendas de Alta Conversão em Formato de Quiz/Diagnóstico Interativo**. Ele é projetado para dispositivos móveis (mobile-first, largura máxima de 400px, simulando um aplicativo nativo), focado em qualificar leads corporativos (B2B), calcular dores financeiras estimadas, apresentar provas sociais e direcionar o lead para duas ofertas diferentes com base em seu perfil (ICP - Cliente Ideal de Alto Faturamento, ou MOFU - Leads em fase de meio de funil que precisam de uma solução de menor ticket).

---

## 2. Fluxo Passo a Passo & Copywriting (A Jornada do Usuário)

O quiz é composto por **16 telas (steps)** com fluxos condicionais. A linguagem é direta, focada em "quanto dinheiro você está perdendo" (dor financeira).

### Passo 0: Tela de Boas-vindas (Welcome Step)
*   **Copy/Conteúdo:**
    *   *Kicker:* "Diagnóstico Express com IA"
    *   *Título Principal:* "Descubra quanto dinheiro sua loja está deixando na mesa todos os meses."
    *   *Caminho visual em 2 etapas:*
        1. "Libere seu Diagnóstico": Explica que leva menos de 2 minutos para estimar as perdas. Imagem estática com badge de cadeado.
        2. "Crie um Plano de Ação": Promete uma consultoria estratégica em vídeo de 60 minutos para consertar os erros. Vídeo em loop (`webm`) mostrando um mockup do celular.
    *   *Botão de Ação:* "Iniciar diagnóstico"
*   **Design:** Iluminação de fundo degradê sutil e dinâmico, simulando refração de luz (glassmorphism/neon glow).

### Passo 1 a 4: Perguntas de Qualificação Quantitativa (Single-Select)
A cada clique nessas opções, o quiz avança automaticamente após 250ms, dando sensação de rapidez.
*   **Passo 1 (Segmento):** Identifica o nicho do cliente (ex: Vestuário, Casa, Beleza). *Badge superior: "Diagnóstico ECOM".*
*   **Passo 2 (Volume de vendas):** Quantidade de vendas mensais. **Condicional:** Se o usuário escolher "Não tenho site próprio", ele é redirecionado imediatamente para o **Passo 15 (Fallback/Desqualificação)**.
*   **Passo 3 (Investimento em tráfego):** Faixa de investimento em anúncios mensais (R$ 0 a R$ 50k+).
*   **Passo 4 (Faturamento):** Faixa de faturamento mensal atual do site (R$ 0 a R$ 300k+). Este dado define o tamanho da dor financeira calculada.

### Passo 5: Alavancas e Estratégias (Multi-Select)
*   **Copy/Conteúdo:** "Selecione todas as alavancas e estratégias que você aplica atualmente..." (Tráfego Pago, E-mail Marketing, Automação, Influenciadores, etc.).
*   **Funcionamento:** Chips clicáveis que mudam de estado visual. O botão "Continuar" só é habilitado se pelo menos 1 opção for marcada. Serve para calcular o nível de maturidade operacional.

### Passo 6: Validação da URL (Entrada de Dados)
*   **Copy/Conteúdo:** Solicita o link/URL do site.
*   **Design:** Input limpo com placeholder de exemplo. Um aviso (`urlWarning`) que avisa se o domínio inserido é inválido ou pertence a plataformas proibidas (redes sociais, concorrentes diretos, termos impróprios).
*   **Validação técnica:** O botão "Analisar Agora" faz uma chamada de validação (ou fallback se falhar) para garantir que o site de fato existe antes de prosseguir.

### Passo 7: Tela de Transição "Analisando com IA..." (Radar Scanner)
*   **Design:** Uma animação de radar circular com feixe de varredura que gira 360° em loop. Pontos aleatórios piscam na teia do radar para simular o processamento da IA. 
*   **Copy:** "Analisando com IA..."
*   **Funcionamento:** Avanço automático para a próxima tela após 8 segundos.

### Passo 8: Formulário de Lead (Captura)
*   **Copy/Conteúdo:** "Análise concluída. Insira seus dados para liberar sua análise..."
*   **Campos:** Nome (bloqueia números/caracteres especiais), E-mail (força minúsculas e valida formato), WhatsApp (com máscara automática de telefone brasileiro).
*   **Segurança:** Badge "Seus dados estão 100% seguros".
*   **Funcionamento:** Validação rígida que impede submissão de nomes repetidos, domínios falsos (ex: @teste.com) ou palavras ofensivas. Dispara os dados para o banco/CRM.

### Passo 9: Carregando Diagnóstico (Montagem do Gráfico)
*   **Design:** Segunda tela de carregamento animada. Desta vez, pontos definitivos aparecem sequencialmente nas intersecções da teia para simbolizar a plotagem dos resultados específicos do cliente.
*   **Funcionamento:** Avanço automático após 8 segundos. Se a soma do score de faturamento e tráfego for alta ($\ge 10$ pontos), o lead vai para o **Passo 10 (Resultado ICP - Lead Quente)**. Caso contrário, vai para o **Passo 12 (Resultado MOFU - Lead Frio/Morno)**.

### Passo 10 e 12: Telas de Resultado (ICP vs MOFU)
*   **Copy/Conteúdo:**
    *   Estimativa de perda financeira: "Sua loja está deixando aproximadamente R$ [X] na mesa todos os meses." (O valor conta de R$ 0 até o total em uma animação de contagem regressiva acelerada).
    *   Maturidade: Barra horizontal indicando nível (Iniciante, Intermediário, Avançado).
    *   Gráfico de Radar SVG: Gráfico octogonal renderizado dinamicamente pelo JavaScript com cores degradê do vermelho (ruim), laranja/amarelo (médio) ao verde (excelente).
    *   Lista de Observações Detalhadas: Caixa de texto para cada pilar avaliado (Ticket Médio, Conversão, Confiança, etc.), exibindo críticas personalizadas de acordo com o score do usuário.
*   **Diferença das Telas:**
    *   **ICP (Lead Quente - Passo 10):** Direciona para a marcação de reunião estratégica ("Próximo Passo" -> Consultoria 1-on-1).
    *   **MOFU (Lead Frio/Morno - Passo 12):** Direciona para uma oferta automatizada de menor custo ("Iniciar Otimização" -> IA Meca + Bônus).

### Passo 11 (A) e 13 (B): Telas de Oferta (Pitch de Vendas)
*   **Oferta A (Consultoria - Passo 11):** Pitch focado em agendamento. Caixa com foto do especialista, biografia curta, cases de sucesso com capturas de tela reais, logos de marcas atendidas e carrosséis interativos de depoimentos. Botão "Agendar Consultoria" direciona para o Calendário.
*   **Oferta B (Venda de Produto/IA - Passo 13):** Pitch para compra de um acesso vitalício a um software/IA auxiliar (Meca.IA) com desconto agressivo de 70% (De R$ 599 por R$ 179). Inclui bônus (consultoria gratuita se comprar), caixas de benefícios, garantias de 15 dias e botão de checkout externo.

### Passo 14: Calendário Interativo de Agendamento (Booking System)
*   **Copy/Conteúdo:** "Escolha um dia e horário."
*   **Funcionamento:** Calendário funcional que renderiza o mês atual e o próximo. O JavaScript consome uma API de slots livres para habilitar apenas os dias com horários disponíveis (máximo de 10 dias úteis no futuro). Ao clicar em um dia, os horários de Brasília são exibidos. Após confirmar o horário, exibe uma tela de sucesso com o resumo do agendamento e link direto para iniciar chat no WhatsApp.

### Passo 15: Tela de Fallback (Desqualificação/Sem Site)
*   **Copy/Conteúdo:** Informa educadamente que o diagnóstico é apenas para lojas ativas e direciona o usuário a seguir a marca no Instagram para consumir outros conteúdos. Exibe um card visual do perfil com contagem de seguidores e selo de verificado.

---

## 3. Design System & Identidade Visual (UI)

*   **Paleta de Cores:**
    *   *Fundo Geral:* Cinza claro suave (`#E8E8E8`) com o cartão do formulário centralizado em Off-White (`#FAFAFA`) para dar contraste físico.
    *   *Acentos Principais:* Preto profundo (`#0E0E0E`) e Verde Folha (`#67A500`) para estados ativos, sucesso e CTA de destaque.
    *   *Alertas/Erros:* Vermelho coral sutil e degradês que mudam do vermelho ao verde de forma suave (escala de trânsito).
*   **Tipografia:** Fonte geométrica *Stem* de peso variável (Regular 400, Medium 500, Bold 700). Dá um aspect corporativo, limpo e extremamente profissional.
*   **Estrutura de Layout:**
    *   *Card-Based:* A tela do quiz é contida em um bloco centralizado de no máximo 400px de largura e 100vh de altura, garantindo visual de "app mobile" em qualquer tela de computador.
    *   *Transições e Animações:* Efeitos de fade-in no topo das telas, barra de progresso no topo que se desloca de forma fluida à medida que os passos avançam, e micro-animações nas seleções de chips/botões.
    *   *Gráficos Dinâmicos:* Os gráficos de radar e barras de maturidade não usam bibliotecas externas pesadas (como Chart.js), mas sim SVGs gerados via Vanilla JS, reduzindo o tempo de carregamento e aumentando a performance no celular.

---

## 4. Lógica de Negócio & Cálculos Técnicos

Para reproduzir este quiz, a IA precisa programar as seguintes lógicas em JavaScript:

1.  **Cálculo da Perda Financeira Estimada:**
    Baseia-se na resposta da faixa de faturamento (Passo 4). Cada faixa tem um valor padrão de mercado de "dinheiro desperdiçado por falta de otimização" (ex: 20% a 30% do faturamento estimado).
2.  **Cálculo de Maturidade Operational:**
    Cada pergunta do quiz atribui pontos de 0 a 25. O total de pontos determina o nível de maturidade:
    *   *$\le 35$ pontos:* Iniciante.
    *   *Entre 36 e 65 pontos:* Intermediário.
    *   *$\ge 66$ pontos:* Avançado.
3.  **Geração Dinâmica do Gráfico SVG de Radar:**
    Usa equações trigonométricas básicas ($\sin$ e $\cos$) para mapear 8 pilares operacionais em um polígono de 8 lados. O código sorteia e calibra valores dentro de limites definidos pelo faturamento para gerar um gráfico único para cada lead, aplicando filtros de blur e degradês nas linhas do SVG.
4.  **Sistema de Calendário Funcional:**
    Mapeia os dias do mês, previne a seleção de datas no passado, finais de semana ou além do limite estipulado, e renderiza os horários disponíveis dinamicamente a partir de consultas HTTP para a API.
5.  **Sistema Anti-Fraude e Anti-Spam de Leads:**
    Implementa regex rigorosa para validar e-mails, validação matemática de repetição de dígitos em números de telefone (ex: impedir números como 99999-9999) e listas de bloqueio para termos inválidos ou fraudulentos.
6.  **Integração de Rastreamento (Meta Pixel / CAPI):**
    Monitora a navegação do usuário e dispara eventos personalizados para o Meta Pixel a cada etapa crítica concluída (`Lead`, `MOFULead`, `ICPLead`, `ViewCalendario`, `BookingConfirmado`).
