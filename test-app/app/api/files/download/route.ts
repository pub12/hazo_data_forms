import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const UPLOAD_BASE = join(process.cwd(), "public");

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { success: false, error: "Missing path" },
        { status: 400 }
      );
    }

    const full_path = join(UPLOAD_BASE, path);

    if (!existsSync(full_path)) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    const data = readFileSync(full_path);
    return new NextResponse(data, {
      headers: { "Content-Type": "application/octet-stream" },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
