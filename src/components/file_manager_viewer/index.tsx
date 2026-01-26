"use client";

import * as React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Button } from "../ui/button";
import { cn, format_file_size, is_mime_type_allowed } from "../../lib/utils";
import { FileList } from "./file_list";
import { FileViewer } from "./file_viewer";
import type { FileManagerProps, FileItem, UploadProgress } from "./types";

/**
 * FileManager Component
 * Main file management component that can render as sidebar OR dialog
 * Displays file list, upload zone, and file viewer
 */
export function FileManager({
  files,
  is_open,
  on_close,
  display_mode,
  config,
  pdf_viewer_component,
  on_pdf_save,
  upload_enabled,
  field_label,
  field_id,
  on_upload,
  on_delete,
  on_popout,
  class_name,
  // hazo_pdf 1.3.2 features
  enable_file_conversion,
  on_file_convert,
  // Service injection
  logger,
}: FileManagerProps) {
  // Selected file state - defaults to first file
  const [selected_index, set_selected_index] = React.useState(0);

  // Upload state
  const [is_uploading, set_is_uploading] = React.useState(false);
  const [upload_progress, set_upload_progress] = React.useState<UploadProgress[]>([]);

  // Reset selection when files change
  React.useEffect(() => {
    if (selected_index >= files.length) {
      set_selected_index(Math.max(0, files.length - 1));
    }
  }, [files, selected_index]);

  // File validation
  const validate_file = (file: File): string | null => {
    const upload_config = config.file_upload;

    if (!is_mime_type_allowed(file.type, upload_config.allowed_types)) {
      return `File type "${file.type}" is not allowed`;
    }

    if (file.size > upload_config.max_file_size) {
      return `File size exceeds maximum of ${format_file_size(upload_config.max_file_size)}`;
    }

    if (files.length >= upload_config.max_files_per_field) {
      return `Maximum of ${upload_config.max_files_per_field} files per field`;
    }

    return null;
  };

  // Handle files dropped or selected
  const handle_files_dropped = async (dropped_files: File[]) => {
    if (!on_upload) return;

    const valid_files: File[] = [];
    const errors: UploadProgress[] = [];

    for (const file of dropped_files) {
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

  // Generate accept string for file input
  const get_accept_types = (): string => {
    return config.file_upload.allowed_types
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
  };

  if (!is_open) {
    return null;
  }

  const has_files = files.length > 0;
  const selected_file = has_files ? (files[selected_index] || files[0]) : null;

  // Header title based on mode
  const header_title = upload_enabled && field_label
    ? `Files for "${field_label}"`
    : `Documents (${files.length})`;

  // Determine if delete is available for selected file
  const selected_deletable =
    upload_enabled &&
    selected_file?.source === "upload" &&
    !!selected_file?.file_id &&
    !!on_delete;

  const handle_delete_selected = async () => {
    if (selected_file?.file_id && on_delete) {
      await on_delete(selected_file.file_id);
    }
  };

  const content = (
    <div
      className={cn(
        "cls_file_manager bg-background flex flex-col h-full",
        class_name
      )}
    >
      {/* TOP ROW: Header + File List */}
      <div className="cls_file_manager_header border-b bg-muted shrink-0">
        {/* Header with popout and close buttons */}
        <div className="flex items-center justify-between p-2 border-b">
          <span className="text-sm font-medium text-foreground">
            {header_title}
          </span>
          <div className="flex items-center gap-1">
            {/* Popout button - only show if on_popout provided and file selected */}
            {on_popout && selected_file && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => on_popout({
                  files,
                  selected_file,
                  selected_index,
                  field_id,
                  field_label,
                })}
                className="h-8 w-8 p-0"
                title="Open in new tab"
              >
                <FaExternalLinkAlt size={14} />
              </Button>
            )}
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={on_close}
              className="h-8 w-8 p-0"
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* File list with integrated dropzone */}
        <FileList
          files={files}
          selected_index={selected_index}
          on_select={set_selected_index}
          on_delete={on_delete}
          upload_enabled={upload_enabled}
          show_add_button={upload_enabled && !!on_upload}
          config={config}
          on_files_dropped={upload_enabled && on_upload ? handle_files_dropped : undefined}
          drag_drop_enabled={upload_enabled && !!on_upload}
          accept_types={get_accept_types()}
          is_uploading={is_uploading}
          upload_progress={upload_progress}
        />
      </div>

      {/* BOTTOM ROW: Viewer Area */}
      <div className="cls_file_manager_viewer flex-1 overflow-hidden">
        <FileViewer
          file={selected_file}
          config={config}
          pdf_viewer_component={pdf_viewer_component}
          on_pdf_save={on_pdf_save}
          deletable={selected_deletable}
          on_delete={handle_delete_selected}
          enable_file_conversion={enable_file_conversion}
          on_convert_to_pdf={on_file_convert}
          logger={logger}
        />
      </div>
    </div>
  );

  // For sidebar mode, just return the content
  // Dialog mode is handled by FileManagerDialog wrapper
  return content;
}

// Re-export all components
export { FileManagerButton } from "./file_manager_button";
export { FileManagerDialog } from "./file_manager_dialog";
export { FileList } from "./file_list";
export { FileViewer } from "./file_viewer";
export { UploadZone } from "./upload_zone";
export { FileManagerPage } from "./file_manager_page";
export type { FileManagerPageProps } from "./file_manager_page";
export type {
  FileManagerProps,
  FileManagerButtonProps,
  FileManagerDialogProps,
  FileItem,
  FileManagerDisplayMode,
  UploadProgress,
} from "./types";
export { doc_link_to_file_item } from "./types";
