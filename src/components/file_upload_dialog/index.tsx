"use client";

import * as React from "react";
import { FaUpload, FaTrash, FaEye, FaFile, FaFilePdf, FaFileImage } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { cn, format_file_size, is_mime_type_allowed } from "../../lib/utils";
import type {
  FormConfig,
  FieldUploads,
  UploadedFile,
  FileUploadResult,
} from "../../lib/types";

export interface FileUploadDialogProps {
  /** Whether dialog is open */
  is_open: boolean;
  /** Callback when dialog closes */
  on_close: () => void;
  /** Field ID being uploaded to */
  field_id: string;
  /** Field label for display */
  field_label: string;
  /** Existing uploads for this field */
  existing_uploads: FieldUploads;
  /** Upload handler callback */
  on_upload: (files: File[]) => Promise<FileUploadResult[]>;
  /** Delete handler callback */
  on_delete: (file_id: string) => Promise<boolean>;
  /** View file callback */
  on_view: (uploaded_file: UploadedFile) => void;
  /** Configuration */
  config: FormConfig;
}

interface UploadProgress {
  filename: string;
  progress: number; // 0-100
  status: "uploading" | "success" | "error";
  error?: string;
}

/**
 * File upload dialog component
 * Provides drag-and-drop and click-to-select file upload with file management
 *
 * @deprecated Use DocPanel with upload_mode=true instead.
 * The DocPanel provides integrated file management within the document viewer panel,
 * offering a more intuitive and streamlined user experience.
 *
 * Migration:
 * - Open DocPanel with upload_mode={true} instead of FileUploadDialog
 * - Pass field's uploaded files as doc_links using uploads_to_doc_links()
 * - Use on_upload and on_delete props on DocPanel
 */
export function FileUploadDialog({
  is_open,
  on_close,
  field_id,
  field_label,
  existing_uploads,
  on_upload,
  on_delete,
  on_view,
  config,
}: FileUploadDialogProps) {
  const file_input_ref = React.useRef<HTMLInputElement>(null);
  const [is_dragging, set_is_dragging] = React.useState(false);
  const [upload_progress, set_upload_progress] = React.useState<UploadProgress[]>([]);
  const [is_uploading, set_is_uploading] = React.useState(false);
  const [delete_in_progress, set_delete_in_progress] = React.useState<string | null>(null);

  const upload_config = config.file_upload;

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!is_open) {
      set_upload_progress([]);
      set_is_uploading(false);
      set_is_dragging(false);
    }
  }, [is_open]);

  const validate_file = (file: File): string | null => {
    // Check file type
    if (!is_mime_type_allowed(file.type, upload_config.allowed_types)) {
      return `File type "${file.type}" is not allowed`;
    }

    // Check file size
    if (file.size > upload_config.max_file_size) {
      return `File size exceeds maximum of ${format_file_size(upload_config.max_file_size)}`;
    }

    // Check max files per field
    if (existing_uploads.length >= upload_config.max_files_per_field) {
      return `Maximum of ${upload_config.max_files_per_field} files per field`;
    }

    return null;
  };

  const handle_files = async (files: FileList | File[]) => {
    const file_array = Array.from(files);
    const valid_files: File[] = [];
    const errors: UploadProgress[] = [];

    // Validate all files first
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

    // Start uploading
    set_is_uploading(true);
    const progress_entries: UploadProgress[] = valid_files.map((f) => ({
      filename: f.name,
      progress: 0,
      status: "uploading" as const,
    }));
    set_upload_progress([...errors, ...progress_entries]);

    try {
      const results = await on_upload(valid_files);

      // Update progress based on results
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
      }, 2000);
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
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handle_delete = async (file_id: string) => {
    set_delete_in_progress(file_id);
    try {
      await on_delete(file_id);
    } finally {
      set_delete_in_progress(null);
    }
  };

  const get_file_icon = (mime_type: string) => {
    if (mime_type === "application/pdf") {
      return <FaFilePdf className="text-red-500" size={24} />;
    }
    if (mime_type.startsWith("image/")) {
      return <FaFileImage className="text-blue-500" size={24} />;
    }
    return <FaFile className="text-gray-500" size={24} />;
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
    <Dialog open={is_open} onOpenChange={(open) => !open && on_close()}>
      <DialogContent className="cls_file_upload_dialog sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Files for "{field_label}"</DialogTitle>
          <DialogDescription>
            Upload, view, or delete files associated with this field.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Drag and drop zone */}
            <div
              className={cn(
                "cls_upload_dropzone border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                is_dragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
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
                  "mx-auto mb-4",
                  is_dragging ? "text-blue-500" : "text-gray-400"
                )}
                size={32}
              />
              <p className="text-sm text-gray-600">
                {is_dragging
                  ? "Drop files here..."
                  : "Drag and drop files here, or click to select"}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Max size: {format_file_size(upload_config.max_file_size)} |
                Max files: {upload_config.max_files_per_field}
              </p>
            </div>

            {/* Upload progress */}
            {upload_progress.length > 0 && (
              <div className="cls_upload_progress space-y-2">
                {upload_progress.map((progress, index) => (
                  <div
                    key={`${progress.filename}-${index}`}
                    className={cn(
                      "p-2 rounded text-sm",
                      progress.status === "uploading" && "bg-blue-50 text-blue-700",
                      progress.status === "success" && "bg-green-50 text-green-700",
                      progress.status === "error" && "bg-red-50 text-red-700"
                    )}
                  >
                    <span className="font-medium">{progress.filename}</span>
                    {progress.status === "uploading" && " - Uploading..."}
                    {progress.status === "success" && " - Uploaded successfully"}
                    {progress.status === "error" && ` - ${progress.error}`}
                  </div>
                ))}
              </div>
            )}

            {/* Existing files list */}
            {existing_uploads.length > 0 && (
              <div className="cls_uploaded_files space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Uploaded Files ({existing_uploads.length})
                </h4>
                <div className="border rounded-lg divide-y">
                  {existing_uploads.map((file) => (
                    <div
                      key={file.file_id}
                      className="cls_uploaded_file_item flex items-center gap-3 p-3"
                    >
                      {get_file_icon(file.mime_type)}
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format_file_size(file.size)} |{" "}
                          {new Date(file.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => on_view(file)}
                          title="View file"
                        >
                          <FaEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handle_delete(file.file_id)}
                          disabled={delete_in_progress === file.file_id}
                          title="Delete file"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <FaTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {existing_uploads.length === 0 && upload_progress.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No files uploaded yet. Drag and drop or click above to upload.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export { UploadIconButton } from "./upload_icon_button";
