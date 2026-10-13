import { NextResponse } from "next/server";
import { getCarousel, updateCarousel } from "@/lib/carousels";
import { exportMaterialPdf } from "@/lib/export-slides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Saves the keyword material. The keyword becomes one uppercase word, as people type it in the comment. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const keyword = text(body?.keyword).replace(/\s+/g, "").toUpperCase();
  const title = text(body?.title);
  const html = text(body?.html);
  const dmText = text(body?.dmText);

  if (!keyword || !title || !html || !dmText) {
    return NextResponse.json(
      { error: "Envie keyword, title, html e dmText preenchidos" },
      { status: 400 }
    );
  }
  if (!/<section[\s>]/i.test(html)) {
    return NextResponse.json(
      { error: "O html precisa ter ao menos uma <section> (cada uma vira uma página A4)" },
      { status: 400 }
    );
  }

  const updated = await updateCarousel(id, { material: { keyword, title, html, dmText } });
  if (!updated) {
    return NextResponse.json({ error: "Carrossel não encontrado" }, { status: 404 });
  }
  return NextResponse.json(updated.material);
}

/** Downloads the material as a PDF. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const carousel = await getCarousel(id);
  if (!carousel?.material) {
    return NextResponse.json({ error: "Este carrossel ainda não tem material" }, { status: 404 });
  }

  try {
    const pdf = await exportMaterialPdf(carousel.material.html);
    const filename = `${carousel.material.title}.pdf`;
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="material.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (err) {
    console.error("[material] PDF falhou", err);
    return NextResponse.json({ error: "Não foi possível gerar o PDF" }, { status: 500 });
  }
}
