import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * POST /api/upload
 * Handles file uploads for the file upload feature demo
 */
export async function POST(request: NextRequest) {
  try {
    const form_data = await request.formData();
    const file = form_data.get("file") as File;
    const field_id = form_data.get("field_id") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!field_id) {
      return NextResponse.json(
        { success: false, error: "No field_id provided" },
        { status: 400 }
      );
    }

    // Generate unique file ID
    const file_id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    // Sanitize filename
    const safe_filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    // Create upload path
    const upload_dir = path.join(process.cwd(), "public", "uploads", field_id);
    const upload_path = `/uploads/${field_id}/${file_id}-${safe_filename}`;
    const full_path = path.join(upload_dir, `${file_id}-${safe_filename}`);

    // Ensure directory exists
    await mkdir(upload_dir, { recursive: true });

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(full_path, Buffer.from(bytes));

    // Return success with uploaded file info
    return NextResponse.json({
      success: true,
      uploaded_file: {
        file_id,
        filename: file.name,
        url: upload_path,
        mime_type: file.type,
        size: file.size,
        uploaded_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Handles file deletions for the file upload feature demo
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const field_id = searchParams.get("field_id");
    const file_id = searchParams.get("file_id");
    const filename = searchParams.get("filename");

    if (!field_id || !file_id) {
      return NextResponse.json(
        { success: false, error: "Missing field_id or file_id" },
        { status: 400 }
      );
    }

    // Construct file path
    const file_path = path.join(
      process.cwd(),
      "public",
      "uploads",
      field_id,
      filename ? `${file_id}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}` : file_id
    );

    // Try to delete the file
    try {
      await unlink(file_path);
    } catch (e) {
      // File might not exist, that's okay
      console.warn("File not found for deletion:", file_path);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
