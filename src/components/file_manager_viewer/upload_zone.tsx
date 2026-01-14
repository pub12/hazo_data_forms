"use client";

import * as React from "react";
import { FaUpload } from "react-icons/fa";
import { cn, format_file_size, is_mime_type_allowed } from "../../lib/utils";
import type { FormConfig, FileUploadResult } from "../../lib/types";

export interface UploadProgress {
  filename: string;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

export interface UploadZoneProps {
  config: FormConfig;
  existing_file_count: number;
  on_upload: (files: File[]) => Promise<FileUploadResult[]>;
  on_upload_complete?: () => void;
}

/**
 * Drag-and-drop upload zone component
 */
export function UploadZone({
  config,
  existing_file_count,
  on_upload,
  on_upload_complete,
}: UploadZoneProps) {
  const file_input_ref = React.useRef<HTMLInputElement>(null);
  const [is_dragging, set_is_dragging] = React.useState(false);
  const [upload_progress, set_upload_progress] = React.useState<UploadProgress[]>([]);
  const [is_uploading, set_is_uploading] = React.useState(false);

  const upload_config = config.file_upload;

  const validate_file = (file: File): string | null => {
    if (!is_mime_type_allowed(file.type, upload_config.allowed_types)) {
      return `File type "${file.type}" is not allowed`;
    }

    if (file.size > upload_config.max_file_size) {
      return `File size exceeds maximum of ${format_file_size(upload_config.max_file_size)}`;
    }

    if (existing_file_count >= upload_config.max_files_per_field) {
      return `Maximum of ${upload_config.max_files_per_field} files per field`;
    }

    return null;
  };

  const handle_files = async (files: FileList | File[]) => {
    const file_array = Array.from(files);
    const valid_files: File[] = [];
    const errors: UploadProgress[] = [];

    for (const file of file_array) {
      const error = validate_file(file);
      if (error) {
        errors.push({
          filename: file.name,
          progress: 100,
          status: "error",
          error,
        });
      } else {
        valid_files.push(file);
      }
    }

    if (errors.length > 0) {
      set_upload_progress(errors);
    }

    if (valid_files.length === 0) return;

    set_is_uploading(true);
    const progress_entries: UploadProgress[] = valid_files.map((f) => ({
      filename: f.name,
      progress: 0,
      status: "uploading" as const,
    }));
    set_upload_progress([...errors, ...progress_entries]);

    try {
      const results = await on_upload(valid_files);

      const updated_progress: UploadProgress[] = [...errors];
      results.forEach((result, index) => {
        const file = valid_files[index];
        updated_progress.push({
          filename: file.name,
          progress: 100,
          status: result.success ? "success" : "error",
          error: result.error,
        });
      });
      set_upload_progress(updated_progress);

      // Clear success messages after a delay
      setTimeout(() => {
        set_upload_progress((prev) =>
          prev.filter((p) => p.status === "error")
        );
        on_upload_complete?.();
      }, 1500);
    } catch (error) {
      set_upload_progress(
        valid_files.map((f) => ({
          filename: f.name,
          progress: 100,
          status: "error" as const,
          error: error instanceof Error ? error.message : "Upload failed",
        }))
      );
    } finally {
      set_is_uploading(false);
    }
  };

  const handle_drag_over = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    set_is_dragging(true);
  };

  const handle_drag_leave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    set_is_dragging(false);
  };

  const handle_drop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    set_is_dragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handle_files(e.dataTransfer.files);
    }
  };

  const handle_file_select = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handle_files(e.target.files);
    }
    e.target.value = "";
  };

  const allowed_extensions = upload_config.allowed_types
    .map((t) => {
      if (t === "application/pdf") return ".pdf";
      if (t === "image/jpeg") return ".jpg,.jpeg";
      if (t === "image/png") return ".png";
      if (t === "image/gif") return ".gif";
      if (t === "image/webp") return ".webp";
      if (t.endsWith("/*")) return t.replace("/*", "/*");
      return "";
    })
    .filter(Boolean)
    .join(",");

  return (
    <div className="cls_upload_zone p-3 border-t bg-gray-50">
      {/* Drag and drop zone */}
      <div
        className={cn(
          "cls_upload_dropzone border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
          is_dragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-white"
        )}
        onDragOver={handle_drag_over}
        onDragLeave={handle_drag_leave}
        onDrop={handle_drop}
        onClick={() => file_input_ref.current?.click()}
      >
        <input
          ref={file_input_ref}
          type="file"
          multiple
          accept={allowed_extensions}
          onChange={handle_file_select}
          className="hidden"
        />
        <FaUpload
          className={cn(
            "mx-auto mb-2",
            is_dragging ? "text-blue-500" : "text-gray-400"
          )}
          size={24}
        />
        <p className="text-sm text-gray-600">
          {is_dragging
            ? "Drop files here..."
            : "Drag and drop files here, or click to select"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Max size: {format_file_size(upload_config.max_file_size)} |
          Max files: {upload_config.max_files_per_field}
        </p>
      </div>

      {/* Upload progress */}
      {upload_progress.length > 0 && (
        <div className="cls_upload_progress space-y-1 mt-2">
          {upload_progress.map((progress, index) => (
            <div
              key={`${progress.filename}-${index}`}
              className={cn(
                "p-2 rounded text-xs",
                progress.status === "uploading" && "bg-blue-50 text-blue-700",
                progress.status === "success" && "bg-green-50 text-green-700",
                progress.status === "error" && "bg-red-50 text-red-700"
              )}
            >
              <span className="font-medium">{progress.filename}</span>
              {progress.status === "uploading" && " - Uploading..."}
              {progress.status === "success" && " - Uploaded"}
              {progress.status === "error" && ` - ${progress.error}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
