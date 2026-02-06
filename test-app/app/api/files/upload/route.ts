import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

const UPLOAD_BASE = join(process.cwd(), "public");

export async function POST(request: NextRequest) {
  try {
    const form_data = await request.formData();
    const file = form_data.get("file") as File | null;
    const remote_path = form_data.get("remote_path") as string | null;

    if (!file || !remote_path) {
      return NextResponse.json(
        { success: false, error: "Missing file or remote_path" },
        { status: 400 }
      );
    }

    const full_path = join(UPLOAD_BASE, remote_path);
    const dir = dirname(full_path);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const array_buffer = await file.arrayBuffer();
    writeFileSync(full_path, Buffer.from(array_buffer));

    const filename = remote_path.split("/").pop() || "file";

    return NextResponse.json({
      success: true,
      data: {
        id: `file_${Date.now()}`,
        name: filename,
        path: remote_path,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
