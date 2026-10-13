import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeResults, slideText } from "./results.ts";
import type { Carousel } from "../types/carousel.ts";

const mk = (id: string, likes: number, comments: number, cover: string, keyword?: string): Carousel => ({
  id, name: id, aspectRatio: "4:5", referenceImages: [], chatSessionId: null, isTemplate: false, tags: [],
  createdAt: "", updatedAt: "",
  slides: [
    { id: "b", html: "<p>segundo</p>", previousVersions: [], order: 1, notes: "" },
    { id: "a", html: `<style>p{color:red}</style><div><p>${cover}</p></div>`, previousVersions: [], order: 0, notes: "" },
  ],
  ...(keyword && { material: { keyword, title: "t", html: "<section></section>", dmText: "d" } }),
  result: { url: "https://www.instagram.com/p/x/", likes, comments, recordedAt: "" },
});

test("ranqueia pela mediana e cita a capa do slide de ordem 0", () => {
  const out = summarizeResults([
    mk("a", 2088, 17, "Filho de bilionário não joga futebol", "SESSAO"),
    mk("b", 31, 1, "Dentistas, a odontologia morreu?"),
    mk("c", 20, 0, "Por que ela nunca te segue?"),
    { ...mk("d", 0, 0, "sem resultado"), result: undefined },
  ]);
  assert.match(out, /Mediana de engajamento \(curtidas \+ comentários\): 32 em 3 posts/);
  assert.match(out, /Melhores:\n- 65,8x · 2088 curt\. · 17 com\. · 2 slides · palavra: SESSAO · capa: "Filho de bilionário/);
  assert.ok(!out.includes("sem resultado"));
  assert.ok(!out.includes("color:red"));
});

test("sem resultado registrado não gera seção", () => {
  assert.equal(summarizeResults([{ ...mk("a", 1, 1, "x"), result: undefined }]), "");
});

test("texto do slide sem tags e cortado", () => {
  assert.equal(slideText("<h1>Olá&nbsp;&amp; tchau</h1>"), "Olá & tchau");
  assert.equal(slideText(`<p>${"a".repeat(200)}</p>`, 10).length, 10);
});
