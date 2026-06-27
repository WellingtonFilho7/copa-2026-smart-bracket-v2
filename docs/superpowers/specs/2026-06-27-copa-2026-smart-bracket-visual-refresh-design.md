# Copa 2026 Smart Bracket Visual Refresh Design

Data: 2026-06-27
Status: aprovado em conversa, aguardando revisão do arquivo

## 1. Resumo

Esta rodada não muda regras, dados ou fluxos do produto. Ela redesenha a home e as superfícies principais para sair de um visual híbrido e indeciso e assumir uma identidade clara de pôster esportivo.

O foco é mobile-first, mantendo o bracket como peça central, mas com mais contraste, hierarquia e unidade visual.

## 2. Problema atual

O app já funciona, mas a interface mistura:

- papel editorial;
- dashboard utilitário;
- cards genéricos de app.

Essa mistura enfraquece a identidade e faz a página parecer "bonita em partes", sem direção única.

## 3. Objetivo

Dar uma cara nova para a página com três resultados concretos:

- aparência memorável e coerente;
- leitura mais nítida no celular;
- sensação de produto intencional, não de protótipo enfeitado.

## 4. Direção visual aprovada

Direção principal:

- pôster clássico esportivo.

Interpretação prática:

- base clara e quente;
- tipografia condensada forte para títulos, fases e placares;
- blocos retos e com contraste alto;
- ornamento reduzido;
- cor usada como sinalização, não como decoração espalhada.

## 5. Princípios visuais

### 5.1 Um acento dominante

O layout deve girar em torno de um azul escuro dominante, com apoio de um tom quente para destaque de conflitos e chamadas.

### 5.2 Contraste antes de textura

Se houver conflito entre atmosfera visual e legibilidade, vence a legibilidade.

### 5.3 Números e fases como protagonistas

Placares, IDs de partidas e nomes de fases devem carregar o caráter visual principal da página.

### 5.4 Menos cartões, mais peças

Blocos devem parecer partes de um pôster/tabela esportiva, e não uma coleção de widgets independentes.

## 6. Mudanças de interface

### 6.1 Hero

O hero deixa de ser um bloco com métricas dispersas e vira cabeçalho de pôster:

- título maior e mais agressivo;
- subtítulo curto;
- linha de contexto do torneio;
- métricas reduzidas ou integradas como faixa técnica, não como mini-cards decorativos.

### 6.2 Toolbar

A toolbar deve parecer uma faixa de controle editorial:

- mais simples;
- menos aparência de dashboard;
- ações claras e alinhadas com o restante da página.

### 6.3 Partidas rápidas

Essa área vira o ponto de entrada mobile principal:

- cards mais densos;
- placar muito mais dominante;
- fase e horário menores;
- botão integrado ao card;
- melhor distinção entre jogo neutro, manual e em conflito.

### 6.4 Grupos

Os grupos deixam de parecer cards coloridos repetidos:

- estrutura mais uniforme;
- cor apenas como assinatura fina;
- mais semelhança com uma tabela impressa.

### 6.5 Chaveamento

O bracket continua sendo a home, mas precisa parecer mais oficial:

- colunas mais limpas;
- cabeçalhos de fase mais fortes;
- cards de partida menos fofos;
- contraste maior entre estrutura e conteúdo.

### 6.6 Conflitos

O painel de conflitos precisa parar de parecer secundário:

- visual de aviso editorial;
- status mais óbvio;
- leitura rápida do que divergiu.

### 6.7 Modal de partida

O modal deve acompanhar a nova linguagem:

- título, fase e placar com mais presença;
- ações principais mais objetivas;
- seção de estrutura claramente secundária.

## 7. Paleta e tipografia

Paleta proposta:

- fundo claro quente;
- texto quase preto;
- azul profundo como cor principal;
- ocre/laranja queimado para alertas e destaques;
- verde apenas para sinais de estado positivo.

Tipografia:

- display condensada para títulos, fases, IDs e placares;
- fonte de leitura mais discreta para apoio e descrições;
- evitar aparência genérica de app SaaS.

## 8. Escopo desta implementação

Incluído:

- atualização visual de `App`, `MatchHub`, `BracketHome`, `WorkspaceToolbar`, `GroupCards`, `ConflictPanel`, `MatchModal`;
- refatoração de CSS para consolidar a nova linguagem;
- manutenção integral do comportamento atual;
- ajustes de responsividade voltados a mobile.

Fora desta rodada:

- mudança do modelo de dados;
- novos fluxos de produto;
- animações elaboradas;
- redesign completo do backend ou sync.

## 9. Verificação

Esta rodada deve ser validada com:

- testes existentes passando;
- build de produção passando;
- checagem visual da home mobile;
- revisão do contraste em texto, fases, placares e conflitos.
