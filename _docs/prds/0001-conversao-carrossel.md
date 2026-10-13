# PRD 0001 · Conversão do carrossel

**Data:** 13/10/2026 · **Origem:** benchmark de 60 posts do @pedroactiss e 250 de 5 referências do formato print de tweet (@mazzacaio, @brunofragaoficial, @leo.rossetto_, @soumarcusaraujo, @rodrigogunter_), cruzado com o que o Instagram declarou em 2025 e 2026. Página: https://claude.ai/artifact/VcJfVDocnUVvEGyTJ9ZsXD

## Problema

- As cópias de casos do @mazzacaio renderam de 290x a 1.415x menos curtidas que os originais, com conta do mesmo tamanho. Desde 30/04/2026 a regra de originalidade do Instagram vale para carrossel.
- 14 de 20 carrosséis pedem palavra-chave para live ou aula: mediana de 0 comentário. No Mazza, a palavra é o nome do caso e entrega um PDF: 599 comentários.
- O melhor carrossel do Pedro (63,8x) abriu com assunto universal e só falou de clínica no slide 13. Os piores falam de clínica desde a capa.
- O slide "Me segue" com a grade é regra do projeto e não apareceu em nenhum dos 8 posts abertos.
- O app marca o recorte da grade como 1:1 (é 3:4 desde jan/2025) e pede 20 a 30 hashtags (o teto é 5).

## O que entra

| # | Função | Onde |
|---|---|---|
| 1 | Referência vira estrutura, nunca cópia (aviso se pedirem slide a slide) | prompt |
| 2 | Estrutura campeã: capa universal, slide 2 com número (segunda capa), virada, nicho no fim, "Me segue", palavra-chave = nome do material | prompt |
| 3 | Botão "Revisar": checklist da estrutura aplicada e corrigida pelo agente | editor + prompt |
| 4 | Recorte da grade em 3:4 na área segura | `SafeZoneOverlay` + prompt |
| 5 | Legenda com 0 a 3 hashtags (teto de 5 na API), primeira linha buscável, sem isca de engajamento | prompt + rota de legenda |
| 6 | Material da palavra-chave: PDF do caso e texto do Direct gerados junto | `material` no carrossel, rota de PDF, painel |
| 7 | Post de opinião em foto única | prompt + sugestão no chat |
| 8 | Diário de resultados: números do post publicado entram no prompt como o que funciona no perfil | `result` no carrossel, diálogo, prompt |

## Fora (por quê)

- Texto alternativo por slide: sem evidência de efeito em conversão e cada slide viraria um passo manual a mais na publicação.
- Puxar métricas do Instagram automaticamente: exige app na Meta; digitar 3 números por post resolve.
- Bloquear o export sem revisão: a revisão é sugestão, o Pedro decide.

## Pronto quando

- Carrossel gerado pelo chat segue a estrutura e fecha com material e legenda válidos.
- "Revisar" roda a checklist e corrige o carrossel aberto.
- PDF do material baixa pelo painel; resultado digitado aparece no prompt do próximo carrossel.
- `npm run build` passa; QA visual do editor aprovado.
