import { NextResponse, type NextRequest } from "next/server";
import { isLocalRequest } from "@/lib/local-only";

export function proxy(request: NextRequest) {
  if (isLocalRequest(request.headers.get("host"), request.headers.get("origin"))) {
    return NextResponse.next();
  }
  return new NextResponse("Acesso permitido só a partir deste computador.", { status: 403 });
}
