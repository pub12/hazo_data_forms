import { NextRequest, NextResponse } from "next/server";
import { unlinkSync, existsSync } from "fs";
import { join } from "path";

const UPLOAD_BASE = join(process.cwd(), "public");

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const file_path = body.path as string;

    if (!file_path) {
      return NextResponse.json(
        { success: false, error: "Missing path" },
        { status: 400 }
      );
    }

    const full_path = join(UPLOAD_BASE, file_path);

    if (existsSync(full_path)) {
      unlinkSync(full_path);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}
