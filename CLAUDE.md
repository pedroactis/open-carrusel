# Open Carrusel

AI-powered Instagram carousel builder. Next.js 16 + React 19 + TypeScript + Tailwind v4.

## Como rodar (sem Claude Code)

- Servidor sempre ligado via launchd (`~/Library/LaunchAgents/com.pedroactis.open-carrusel.plist`), **modo produção** (`next start`, porta 3000), sobe sozinho com o Mac. Logs: `~/Library/Logs/open-carrusel/`.
- Abrir: app **Carrossel** em `~/Applications/Carrossel.app` (pode arrastar pro Dock) ou http://localhost:3000. O chat do app usa o Claude CLI local, não precisa do Claude Code aberto.
- Depois de qualquer mudança de código: `scripts/redeploy.sh` (build + reinicia). Voltar ao modo dev com hot reload: restaurar `com.pedroactis.open-carrusel.plist.dev.bak`.
- Em produção, fotos novas de `public/` só são servidas pela rota `/api/files/[dir]/[...path]` (rewrites no `next.config.ts` para `/library` e `/uploads`).
- Vercel não serve: o chat depende do Claude CLI da máquina e o storage é JSON em disco.

## Architecture

- **Frontend**: React app at localhost:3000 with chat panel (left), carousel preview (center), slide filmstrip (bottom)
- **AI Agent**: Claude CLI spawned as subprocess via `/api/chat`, communicates through SSE streaming
- **Storage**: JSON files in `/data/` with async-mutex locking and atomic writes
- **Export**: Puppeteer screenshots HTML slides to PNG at exact Instagram dimensions
- **Slides**: Full HTML documents rendered in sandboxed iframes. `wrapSlideHtml()` in `src/lib/slide-html.ts` is the shared rendering contract between preview and export.

## Key Files

- `src/lib/chat-system-prompt.ts` — Dynamic system prompt (injects brand config + carousel context)
- `src/lib/slide-html.ts` — `wrapSlideHtml()` wraps slide body HTML into full documents
- `src/lib/data.ts` — JSON storage with proper async-mutex and atomic writes
- `src/lib/carousels.ts` — Carousel and slide CRUD with version history
- `src/lib/claude-path.ts` — Portable Claude CLI discovery

## API Routes

All at localhost:3000. **Só respondem a pedido feito neste computador** (`src/proxy.ts` + `src/lib/local-only.ts`): Host tem que ser `localhost`/`127.0.0.1`/`[::1]` e, se vier Origin, também local. Outro aparelho no Wi-Fi ou outro site aberto no navegador leva 403, porque o `/api/chat` dá Bash ao Claude. Abrir sempre por `http://localhost:3000`. Teste: `node --test src/lib/local-only.test.ts`.

- `POST /api/chat` — Claude CLI subprocess + SSE streaming
- `GET/POST /api/carousels` — List/create carousels
- `GET/PUT/DELETE /api/carousels/[id]` — Single carousel
- `POST /api/carousels/[id]/slides` — Add slide
- `PUT/DELETE /api/carousels/[id]/slides/[slideId]` — Update/delete slide
- `PUT /api/carousels/[id]/slides` — Reorder slides (body: { slideIds: [...] })
- `POST /api/carousels/[id]/slides/[slideId]/undo` — Undo slide change
- `POST /api/carousels/[id]/export` — Export all slides to PNG ZIP
- `PUT /api/carousels/[id]/caption`: legenda e hashtags (recusa mais de 5 hashtags, o teto do Instagram)
- `PUT /api/carousels/[id]/material`: material da palavra-chave `{keyword,title,html,dmText}` (cada `<section>` do html vira uma página A4) · `GET` baixa o PDF
- `PUT /api/carousels/[id]/result`: números do post publicado `{url,likes,comments,saves?,shares?,follows?}`; os melhores e piores entram no prompt do chat (`src/lib/results.ts`)
- `GET/PUT /api/brand` — Brand configuration
- `GET/POST /api/templates` — Templates
- `POST /api/upload` — Image upload (PNG/JPG/WebP only, max 10MB)
- `GET/POST /api/library` — Image bank: search (`q`, `category`, `tag`) / multi-upload (stored in `public/library/`)
- `PUT/DELETE /api/library/[id]` — Edit category/tags / remove from index
- `POST /api/library/import` — Index curated files already in `public/uploads/` by filename prefix
- `GET /api/library/web-search?q=&limit=` — Pinterest search (puppeteer, no login), returns candidates only (~17s, ~25 results max)
- `POST /api/library/web-import` — `{query,limit,category}` search+import in one shot (agent), or `{items,category,tags}` to import picked results
- `GET/POST /api/library/pinterest` — Login state of the saved Pinterest profile (`data/pinterest-profile`) / `{action:"open"|"close"}` visible login window (user types own credentials)
- `GET /api/fonts` — Google Fonts list

## Conventions

- Components max ~300 lines per file
- Use `cn()` from `src/lib/utils.ts` for class merging
- Types in `src/types/`, libs in `src/lib/`, components in `src/components/`
- All data mutations go through `src/lib/data.ts` (never direct fs writes for JSON)
- iframe slides always use `sandbox=""` attribute (no JavaScript execution)
- The Claude subprocess gets `--allowedTools Bash WebFetch` and uses curl to call local API routes

## Estrutura de conversão (PRD `_docs/prds/0001-conversao-carrossel.md`)

O prompt do chat (`src/lib/chat-system-prompt.ts`) aplica a estrutura medida no benchmark de 13/10/2026: capa sem jargão do nicho, slide 2 com o número mais forte, virada explícita, nicho só depois da virada, "Me segue" no penúltimo, palavra-chave = nome do caso entregando o PDF do material. Referência de outro perfil vira só estrutura, nunca cópia. O botão **Revisar** do editor roda a checklist e corrige; o botão **Resultado** guarda os números do post publicado. Testes: `node --test src/lib/*.test.ts`.

## Brand identity (ativa desde 19/09/2026)

**Design system do NotebookLM** — extraído da UI do NotebookLM (Google) e adotado como identidade padrão do projeto (`data/brand.json`, também salvo como style preset `bd83e1de-4ab2-46cc-bb62-f4e7ff7121be`). Copiar a LÓGICA do sistema, nunca a marca/logo do Google.

- Fundo lavanda `#EDEFFA` em todo slide; painéis/cards/balões brancos `#FFFFFF`, raio 16px, SEM sombra (separação por traço 1px `#DDE1EB`).
- CTA principal sempre PRETO `#000000` em pílula — nunca botão azul como ação principal. Azul `#4259FF` só pra link/foco/"+"; verde `#45EC6D` é acento raro (máx. 1 por slide). Gradiente `#7182FF → #3CFF52` só na capa.
- Tipografia única (heading = body): **DM Sans** — substituto do Google Sans original, que não está disponível fora do Google. Peso 400 em título/corpo, 500 só em botão/label/tile. Validar visualmente em `/style-guide/typography` antes de trocar.
- Hierarquia só por tamanho, nunca negrito. Raio por elemento: 4px campo, 8px badge, 12px tile/card, 16px painel, 24px chip, pílula em todo botão.
- O brand anterior (NSM — Funil Blindado: branco + lima/lavanda, Big Shoulders Text) está preservado como style preset `"Funil Blindado — Branco + Lima/Lavanda"` em `data/style-presets.json`, não foi perdido.

## Instagram Dimensions

- 1:1 = 1080x1080 (square)
- 4:5 = 1080x1350 (portrait, recommended)
- 9:16 = 1080x1920 (story)
- Max 10 slides per carousel

## Slide HTML Rules

Slides store body-level HTML only (no `<html>`, `<head>`, `<!DOCTYPE>`). The `wrapSlideHtml()` function adds the full document structure, font loading, and dimension constraints. Slides should:

- Use inline styles or `<style>` tags
- Reference images as `/uploads/{filename}` paths
- Use Google Font family names in font-family declarations
- NOT contain `<script>` tags (enforced by iframe sandbox)
- Target the carousel's aspect ratio dimensions

## Regra fixa: slide de "me segue" leva o print do perfil (definida 10/10/2026)

Todo carrossel do @pedroactiss que tenha o slide de pedido de seguir ("Me segue pra não perder os próximos") **sempre leva a imagem `/uploads/perfil-grid-pedroactiss.jpg`** (print da grade do perfil, 1206x1063) no bloco de foto desse slide, com a seta de continuar. Objetivo: viralizar, quem chega no meio do carrossel vê o perfil e decide seguir. Não remover, não trocar por outra imagem sem o Pedro pedir. Se a grade do perfil mudar muito, o Pedro manda um print novo e a imagem é substituída pelo mesmo nome.

## Regra fixa: imagem tem que comunicar com a copy (definida 13/10/2026)

Nunca aproveitar imagem só porque está na biblioteca. **Antes de colocar qualquer foto numa lâmina, perguntar: "essa imagem faz sentido com o que a copy desta lâmina está dizendo?"** Se a resposta não for um sim claro, não entra. Sem foto adequada, o bloco fica vazio e eu peço frase de busca ao Pedro, nunca preencho com a foto "mais próxima". Cada imagem aponta pra uma palavra/ideia específica do texto (ex: "sócios" = foto de sócios, "robô entrega toalha" = robô entregando toalha). Foto de outro cliente/marca com logo visível não entra em carrossel de outro caso. Vale pra toda lâmina, inclusive as geradas via API/script.

### Complemento: imagem de case é ESPECÍFICA da empresa (13/10/2026)

Quando o carrossel é sobre um case real (empresa, marca, pessoa), as fotos têm que ser **daquela empresa**: fachada, produto, evento, sócios e material reais dela. Foto genérica de "academia de luxo" não serve. É isso que dá prova e credibilidade na referência (ex: @mazzacaio usa fachada da Six, robô com toalha Six, revista WOWness). Frase de busca sempre leva o **nome da empresa + o elemento específico** do slide (ex: "Six Sport Life robô toalha"), nunca só a categoria. Só vale foto genérica quando o slide não fala de uma empresa específica (ex: CTA).
