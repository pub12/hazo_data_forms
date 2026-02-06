import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import { join } from "path";

const UPLOAD_BASE = join(process.cwd(), "public");

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get("path");

    if (!path) {
      return NextResponse.json({ exists: false });
    }

    const full_path = join(UPLOAD_BASE, path);
    return NextResponse.json({ exists: existsSync(full_path) });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
