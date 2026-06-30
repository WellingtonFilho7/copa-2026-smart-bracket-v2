# Copa 2026 Smart Bracket V2

Primeira implementação da V2 em React + Vite com backend mínimo ligado ao feed oficial da FIFA.

## Rodar localmente

Instale dependências:

```bash
npm install
```

Em um terminal, suba o backend mínimo local:

```bash
npm run server
```

Em outro terminal, suba o frontend:

```bash
npm run dev
```

O frontend consome `http://localhost:3016/api/worldcup-feed` via proxy do Vite.

## Produção na Vercel

Em produção, o feed é servido por uma Vercel Function em `api/worldcup-feed.js`.

O arquivo `vercel.json` fixa o preset do projeto como `vite`, evitando que a presença do servidor Express local de desenvolvimento confunda a detecção do framework no deploy.

## Testes

```bash
npm test
```

## Build

```bash
npm run build
```

## O que já existe

- home em formato de bracket;
- cards de grupos;
- modal central para partidas do mata-mata;
- leitura oficial dos jogos da Copa 2026 via `api.fifa.com`;
- classificação de grupos derivada do calendário oficial;
- bracket mata-mata normalizado para a interface;
- persistência local do último feed válido em `localStorage`;
- fallback para snapshot oficial se a FIFA falhar temporariamente.
