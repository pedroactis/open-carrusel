import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { generateId } from "@/lib/utils";
import { addImages, listCategories, listImages, parseTags } from "@/lib/image-library";

const LIB_DIR = path.resolve(process.cwd(), "public/library");
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const images = await listImages({
    q: sp.get("q") ?? undefined,
    category: sp.get("category") ?? undefined,
    tag: sp.get("tag") ?? undefined,
  });
  const categories = await listCategories();
  return NextResponse.json({ images, categories, total: images.length });
}

// Multipart: one or many "file" fields + optional "category" and "tags" (comma separated).
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const files = form.getAll("file").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }
    const category = String(form.get("category") ?? "geral").trim().toLowerCase() || "geral";
    const tags = parseTags(form.get("tags") ?? "");
    await mkdir(LIB_DIR, { recursive: true });

    const items = [];
    const errors: string[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: maior que 15MB`);
        continue;
      }
      try {
        // sharp validates the real format (SVG excluded); keep photos as JPG, 1600px max.
        const img = sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" }).rotate();
        const meta = await img.metadata();
        if (!meta.format || !["jpeg", "png", "webp"].includes(meta.format)) {
          errors.push(`${file.name}: formato não suportado`);
          continue;
        }
        const buf = await img
          .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
          .toColorspace("srgb")
          .jpeg({ quality: 88 })
          .toBuffer({ resolveWithObject: true });
        const filename = `${generateId()}.jpg`;
        await writeFile(path.join(LIB_DIR, filename), buf.data);
        items.push({
          url: `/library/${filename}`,
          name: path.parse(file.name).name,
          category,
          tags,
          width: buf.info.width,
          height: buf.info.height,
        });
      } catch {
        errors.push(`${file.name}: arquivo inválido`);
      }
    }
    const created = await addImages(items);
    return NextResponse.json({ created, errors }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível processar o envio" }, { status: 500 });
  }
}
