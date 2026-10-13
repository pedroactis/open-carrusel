import type { Carousel } from "@/types/carousel";

/** Visible text of a slide's HTML, for quoting the cover in the prompt. */
export function slideText(html: string, max = 160): string {
  const text = html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * What worked on this profile: carousels with typed results, ranked by
 * engagement (likes + comments) against the profile median. Empty string
 * when nothing was recorded yet.
 */
export function summarizeResults(carousels: Carousel[], top = 3): string {
  const rows = carousels
    .filter((c) => c.result && c.slides.length > 0)
    .map((c) => {
      const r = c.result!;
      const cover = slideText([...c.slides].sort((a, b) => a.order - b.order)[0].html);
      return { c, r, eng: r.likes + r.comments, cover };
    });
  if (rows.length === 0) return "";

  const med = median(rows.map((x) => x.eng));
  const line = (x: (typeof rows)[number]) => {
    const mult = med > 0 ? `${(x.eng / med).toFixed(1).replace(".", ",")}x` : "n/d";
    const extras = [
      x.r.saves !== undefined && `${x.r.saves} salv.`,
      x.r.shares !== undefined && `${x.r.shares} envios`,
      x.r.follows !== undefined && `${x.r.follows} seguidores`,
    ].filter(Boolean);
    return `- ${mult} · ${x.r.likes} curt. · ${x.r.comments} com.${extras.length ? ` · ${extras.join(" · ")}` : ""} · ${x.c.slides.length} slides · palavra: ${x.c.material?.keyword ?? "nenhuma"} · capa: "${x.cover}"`;
  };

  const sorted = [...rows].sort((a, b) => b.eng - a.eng);
  const best = sorted.slice(0, top);
  const worst = sorted.slice(-top).reverse().filter((x) => !best.includes(x));
  return [
    `Mediana de engajamento (curtidas + comentários): ${med} em ${rows.length} posts com resultado.`,
    "Melhores:",
    ...best.map(line),
    ...(worst.length ? ["Piores:", ...worst.map(line)] : []),
  ].join("\n");
}
