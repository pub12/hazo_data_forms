import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const form_data = await request.formData();
    const pdf_file = form_data.get("pdf") as File;
    const original_url = form_data.get("original_url") as string;

    if (!pdf_file || !original_url) {
      return NextResponse.json(
        { error: "Missing pdf file or original_url" },
        { status: 400 }
      );
    }

    // Convert the URL to a file path
    // URLs like "/sample.pdf" map to "public/sample.pdf"
    const url_path = original_url.startsWith("/") ? original_url : `/${original_url}`;
    const file_path = path.join(process.cwd(), "public", url_path);

    // Security check: ensure the path is within the public directory
    const public_dir = path.join(process.cwd(), "public");
    const resolved_path = path.resolve(file_path);
    if (!resolved_path.startsWith(public_dir)) {
      return NextResponse.json(
        { error: "Invalid file path - must be within public directory" },
        { status: 400 }
      );
    }

    // Read the file bytes
    const array_buffer = await pdf_file.arrayBuffer();
    const buffer = Buffer.from(array_buffer);

    // Write to the original file location
    await writeFile(resolved_path, buffer);

    return NextResponse.json({
      success: true,
      message: `PDF saved to ${url_path}`,
      path: url_path,
    });
  } catch (error) {
    console.error("Error saving PDF:", error);
    return NextResponse.json(
      { error: `Failed to save PDF: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
