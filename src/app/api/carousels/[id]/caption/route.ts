import { NextResponse } from "next/server";
import { getCarousel, updateCarousel } from "@/lib/carousels";
import { MAX_HASHTAGS } from "@/types/carousel";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const carousel = await getCarousel(id);
  if (!carousel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    caption: carousel.caption || "",
    hashtags: carousel.hashtags || [],
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { caption, hashtags } = body as {
      caption?: string;
      hashtags?: string[];
    };

    // O Instagram aceita no máximo 5 hashtags por post (dez/2025): recusa para o agente refazer.
    if (hashtags && hashtags.length > MAX_HASHTAGS) {
      return NextResponse.json(
        { error: `Máximo de ${MAX_HASHTAGS} hashtags por post; envie de 0 a 3 específicas` },
        { status: 400 }
      );
    }

    const updated = await updateCarousel(id, {
      caption,
      hashtags: hashtags?.map((h) => h.replace(/^#/, "")),
    });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      caption: updated.caption || "",
      hashtags: updated.hashtags || [],
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
