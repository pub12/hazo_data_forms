import { NextRequest, NextResponse } from "next/server";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

const UPLOAD_BASE = join(process.cwd(), "public");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dir_path = body.path as string;

    if (!dir_path) {
      return NextResponse.json(
        { success: false, error: "Missing path" },
        { status: 400 }
      );
    }

    const full_path = join(UPLOAD_BASE, dir_path);

    if (!existsSync(full_path)) {
      mkdirSync(full_path, { recursive: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to ensure directory" },
      { status: 500 }
    );
  }
}
