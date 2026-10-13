export type AspectRatio = "1:1" | "4:5" | "9:16";

export interface Slide {
  id: string;
  html: string;
  previousVersions: string[];
  order: number;
  notes: string;
}

export interface ReferenceImage {
  id: string;
  url: string;       // e.g. "/uploads/abc.png"
  absPath: string;    // absolute path for Claude to Read
  name: string;       // original filename or description
  addedAt: string;
}

/** Material que a palavra-chave entrega no Direct (PDF do caso). */
export interface CarouselMaterial {
  keyword: string;   // palavra que a pessoa comenta, ex.: "SIX"
  title: string;     // nome do PDF
  html: string;      // páginas A4: cada <section> vira uma página
  dmText: string;    // mensagem do Direct, com [LINK DO PDF] no lugar do link
}

/** Números do post publicado, digitados pelo usuário. */
export interface CarouselResult {
  url: string;
  likes: number;
  comments: number;
  saves?: number;
  shares?: number;
  follows?: number;
  recordedAt: string;
}

export interface Carousel {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  slides: Slide[];
  referenceImages: ReferenceImage[];
  caption?: string;
  hashtags?: string[];
  material?: CarouselMaterial;
  result?: CarouselResult;
  chatSessionId: string | null;
  isTemplate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CarouselsData {
  carousels: Carousel[];
}

export const DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
  "9:16": { width: 1080, height: 1920 },
};

export const MAX_SLIDES = 20;
/** Teto da publicação pela API da Meta (o app aceita 20). */
export const MAX_SLIDES_API = 10;
/** Teto de hashtags do Instagram desde dez/2025. */
export const MAX_HASHTAGS = 5;
export const MAX_VERSIONS = 5;
