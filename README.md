# OrbitFire

OrbitFire é uma plataforma web criada para a Global Solution da FIAP com foco em monitoramento espacial de focos de fogo detectados por satélite no território brasileiro.

O projeto transforma dados públicos do Programa Queimadas do INPE em uma experiência visual com landing page institucional, transição cinematográfica e dashboard analítico com mapa, filtros, gráficos, rankings e detalhes das ocorrências.

## Sobre o projeto

- Landing page com contexto do problema e da solução
- Dashboard funcional com dados reais do CSV do INPE
- Mapa geográfico do Brasil com focos posicionados por latitude e longitude
- Filtros por estado, município, bioma, satélite e variáveis ambientais
- Gráficos, tabelas e painéis de detalhe com métricas calculadas dinamicamente
- Identidade visual escura, com laranja e âmbar como cores de destaque

## Tecnologias

- Next.js
- TypeScript
- Tailwind CSS
- React Leaflet / Leaflet
- Recharts
- Lucide React

## Estrutura principal

- `/` landing page
- `/dashboard` painel principal
- `src/data/focos-processados.json` dados processados usados pela aplicação

## Como rodar localmente

Não é necessario fazer nenhuma instalação local, pois o projeto esta deployado e rodando em sua totalidade em: https://orbitfire-project.vercel.app/

Mas se por alguma razão ainda ouver interesse em rodar em um servidor local, segue as instruções:

### Pré-requisitos

- Node.js instalado
- npm instalado

### Instalação

```bash
npm install
```

### Rodar em desenvolvimento

```bash
npm run dev
```

Depois, abra:

```text
http://localhost:3000
```

### Gerar a versão de produção

```bash
npm run build
```

### Iniciar a aplicação em produção

```bash
npm run start
```

## Processamento dos dados

O projeto utiliza o arquivo original do INPE e um pipeline local de processamento para gerar a base consumida pela interface.

Se for necessário regenerar os dados processados, execute:

```bash
npm run process:data
```

## Observações

- Os registros representam focos detectados por satélite, e não incêndios confirmados.
- Os valores visuais de risco usados no dashboard são interpretações do OrbitFire baseadas no campo `risco_fogo`.
- O projeto foi pensado para funcionar bem em apresentação, gravação de vídeo e uso local.
