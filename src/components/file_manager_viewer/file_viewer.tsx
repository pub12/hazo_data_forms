"use client";

import * as React from "react";
import { FaDownload, FaExternalLinkAlt, FaFilePdf, FaSpinner } from "react-icons/fa";
import { Button } from "../ui/button";
import type { FileViewerProps, FileItem } from "./types";
import type { PdfViewerProps } from "../hazo_data_form/types";
import { is_potentially_convertible, get_hazo_pdf_conversion_utils } from "../../lib/hazo_pdf_exports";

/**
 * Empty state when no files
 */
function EmptyState({ upload_enabled }: { upload_enabled?: boolean }) {
  return (
    <div className="flex items-center justify-center h-full p-4 text-center text-muted-foreground">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-4 text-muted-foreground/50"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p className="text-sm text-muted-foreground">No files yet</p>
        {upload_enabled && (
          <p className="text-xs text-muted-foreground/80 mt-1">
            Click "Add file" to upload
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Error state for missing PDF
 */
function ErrorState({
  message,
  filename,
  deletable,
  on_delete,
}: {
  message: string;
  filename: string;
  deletable?: boolean;
  on_delete?: () => void;
}) {
  const is_404 = message.includes("404");

  return (
    <div className="flex items-center justify-center h-full p-4 text-center text-muted-foreground">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-4 text-muted-foreground"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" x2="15" y1="15" y2="15" />
        </svg>
        <p className="text-sm text-foreground/80">
          {is_404 ? `Missing PDF "${filename}".` : message}
        </p>
        {is_404 && (
          <p className="text-xs mt-2 text-muted-foreground/80">
            The file may have been deleted or moved.
          </p>
        )}
        {deletable && on_delete && (
          <button
            type="button"
            onClick={on_delete}
            className="mt-4 px-3 py-1.5 text-sm bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors"
          >
            Remove this file reference
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Image preview component with optional PDF conversion
 */
function ImageViewer({
  file,
  enable_conversion,
  on_convert_to_pdf,
  is_converting,
}: {
  file: FileItem;
  enable_conversion?: boolean;
  on_convert_to_pdf?: () => void;
  is_converting?: boolean;
}) {
  const handle_open = () => {
    window.open(file.url, "_blank");
  };

  return (
    <div className="cls_file_viewer_image flex flex-col items-center justify-center h-full p-4">
      <img
        src={file.url}
        alt={file.filename}
        className="max-w-full max-h-[70%] object-contain rounded border"
      />
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={handle_open}>
          <FaExternalLinkAlt className="mr-2" size={14} />
          Open in New Tab
        </Button>
        {enable_conversion && on_convert_to_pdf && (
          <Button
            variant="outline"
            onClick={on_convert_to_pdf}
            disabled={is_converting}
          >
            {is_converting ? (
              <>
                <FaSpinner className="mr-2 animate-spin" size={14} />
                Converting...
              </>
            ) : (
              <>
                <FaFilePdf className="mr-2" size={14} />
                Convert to PDF
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Download prompt for non-viewable files with optional PDF conversion
 */
function DownloadViewer({
  file,
  enable_conversion,
  on_convert_to_pdf,
  is_converting,
}: {
  file: FileItem;
  enable_conversion?: boolean;
  on_convert_to_pdf?: () => void;
  is_converting?: boolean;
}) {
  const handle_download = () => {
    window.open(file.url, "_blank");
  };

  return (
    <div className="cls_file_viewer_download flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
        <FaDownload size={24} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{file.filename}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {enable_conversion
          ? "This file can be converted to PDF for viewing, or downloaded directly."
          : "This file type cannot be previewed. Click below to download or open."}
      </p>
      <div className="flex gap-2">
        {enable_conversion && on_convert_to_pdf && (
          <Button
            onClick={on_convert_to_pdf}
            disabled={is_converting}
          >
            {is_converting ? (
              <>
                <FaSpinner className="mr-2 animate-spin" size={14} />
                Converting...
              </>
            ) : (
              <>
                <FaFilePdf className="mr-2" size={14} />
                Convert to PDF
              </>
            )}
          </Button>
        )}
        <Button variant={enable_conversion ? "outline" : "default"} onClick={handle_download}>
          <FaDownload className="mr-2" size={14} />
          Download File
        </Button>
      </div>
    </div>
  );
}

/**
 * Get MIME type string for file type detection
 */
function get_mime_type_for_file(file: FileItem): string | null {
  // Check URL extension for common types
  const url = file.url.toLowerCase();
  const extension = url.split(".").pop()?.split("?")[0];

  switch (extension) {
    // Images
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "bmp":
      return "image/bmp";
    case "tiff":
    case "tif":
      return "image/tiff";
    // Text files
    case "txt":
      return "text/plain";
    case "md":
      return "text/markdown";
    case "csv":
      return "text/csv";
    case "html":
    case "htm":
      return "text/html";
    case "json":
      return "application/json";
    // Excel files
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "xls":
      return "application/vnd.ms-excel";
    default:
      return null;
  }
}

/**
 * FileViewer Component
 * Displays preview for the selected file (PDF, image, or download prompt)
 */
export function FileViewer({
  file,
  config,
  pdf_viewer_component,
  on_pdf_save,
  deletable,
  on_delete,
  enable_file_conversion = false,
  on_convert_to_pdf,
  logger,
}: FileViewerProps) {
  // Dynamic PDF viewer loading
  const [DynamicPdfViewer, set_dynamic_pdf_viewer] =
    React.useState<React.ComponentType<PdfViewerProps> | null>(null);
  const [hazo_pdf_error, set_hazo_pdf_error] = React.useState<string | null>(null);
  const [file_error, set_file_error] = React.useState<string | null>(null);

  // Conversion state
  const [is_converting, set_is_converting] = React.useState(false);
  const [conversion_error, set_conversion_error] = React.useState<string | null>(null);

  const PdfViewerComponent = pdf_viewer_component || DynamicPdfViewer;

  // Check if current file is convertible
  const file_mime_type = file ? get_mime_type_for_file(file) : null;
  const is_file_convertible = Boolean(
    enable_file_conversion &&
    on_convert_to_pdf &&
    file_mime_type &&
    is_potentially_convertible(file_mime_type)
  );

  // Load PDF viewer dynamically
  React.useEffect(() => {
    if (file?.type === "pdf" && !pdf_viewer_component && !DynamicPdfViewer) {
      const load_pdf_viewer = async () => {
        try {
          const module = await import(/* webpackChunkName: "hazo_pdf" */ "hazo_pdf");
          // @ts-ignore - CSS import has no type declarations
          await import(/* webpackChunkName: "hazo_pdf_styles" */ "hazo_pdf/styles.css");
          // Cast to ComponentType since PdfViewer is a ForwardRefExoticComponent
          set_dynamic_pdf_viewer(() => module.PdfViewer as React.ComponentType<PdfViewerProps>);
          set_hazo_pdf_error(null);
        } catch (err) {
          console.error("Failed to load hazo_pdf:", err);
          set_hazo_pdf_error(
            "hazo_pdf is not installed. Please install it to view PDFs."
          );
        }
      };
      load_pdf_viewer();
    }
  }, [file, pdf_viewer_component, DynamicPdfViewer]);

  // Reset errors when file changes
  React.useEffect(() => {
    set_file_error(null);
    set_conversion_error(null);
  }, [file?.url]);

  // Handle conversion to PDF
  const handle_convert_to_pdf = React.useCallback(async () => {
    if (!file || !on_convert_to_pdf || !file_mime_type) return;

    set_is_converting(true);
    set_conversion_error(null);

    try {
      // Fetch the file content
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const blob = await response.blob();

      // Create a File object with proper MIME type
      const file_obj = new File([blob], file.filename, { type: file_mime_type });

      // Get conversion utilities
      const utils = await get_hazo_pdf_conversion_utils();

      // Check if conversion is supported (pass MIME type string)
      if (!utils.can_convert_to_pdf(file_mime_type)) {
        throw new Error(`File type "${file_mime_type}" cannot be converted to PDF`);
      }

      // Convert to PDF (pass file and filename)
      const result = await utils.convert_to_pdf(file_obj, file.filename);

      // Check conversion result
      if (!result.success || !result.pdf_bytes) {
        throw new Error(result.error || "Conversion failed");
      }

      // Call the callback with the converted PDF bytes
      on_convert_to_pdf(result.pdf_bytes, file.filename);
    } catch (error) {
      console.error("Conversion failed:", error);
      set_conversion_error(
        error instanceof Error ? error.message : "Conversion failed"
      );
    } finally {
      set_is_converting(false);
    }
  }, [file, on_convert_to_pdf, file_mime_type]);

  // Empty state
  if (!file) {
    return <EmptyState upload_enabled />;
  }

  // PDF file
  if (file.type === "pdf") {
    // hazo_pdf library error
    if (hazo_pdf_error) {
      return (
        <div className="flex items-center justify-center h-full p-4 text-center text-muted-foreground">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-muted-foreground"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" x2="15" y1="15" y2="15" />
            </svg>
            <p className="text-sm">{hazo_pdf_error}</p>
            <p className="text-xs mt-2 text-muted-foreground/80">Run: npm install hazo_pdf</p>
          </div>
        </div>
      );
    }

    // File-specific error (e.g., 404)
    if (file_error) {
      return (
        <ErrorState
          message={file_error}
          filename={file.filename}
          deletable={deletable}
          on_delete={on_delete}
        />
      );
    }

    // Loading PDF viewer
    if (!PdfViewerComponent) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
        </div>
      );
    }

    // Render PDF viewer
    // Build props, conditionally adding logger if provided
    const viewer_props: PdfViewerProps & { logger?: unknown } = {
      url: file.url,
      className: "h-full w-full",
      default_scale: "page-width",
      on_error: (error: Error) => {
        console.error("PDF load error for", file.url, ":", error);
        set_file_error(error.message);
      },
      on_save: on_pdf_save
        ? (pdf_bytes: Uint8Array, filename: string) => {
            on_pdf_save(pdf_bytes, filename, file.url);
          }
        : undefined,
    };

    // Add logger if provided (hazo_pdf supports logger prop)
    if (logger) {
      viewer_props.logger = logger;
    }

    return (
      <div className="h-full w-full">
        <PdfViewerComponent key={file.url} {...viewer_props} />
      </div>
    );
  }

  // Show conversion error if any
  const conversion_error_display = conversion_error && (
    <div className="absolute bottom-4 left-4 right-4 bg-destructive/10 text-destructive p-2 rounded text-sm">
      {conversion_error}
    </div>
  );

  // Image file
  if (file.type === "image") {
    return (
      <div className="relative h-full">
        <ImageViewer
          file={file}
          enable_conversion={is_file_convertible}
          on_convert_to_pdf={handle_convert_to_pdf}
          is_converting={is_converting}
        />
        {conversion_error_display}
      </div>
    );
  }

  // Other file types - download prompt (with conversion for supported types)
  return (
    <div className="relative h-full">
      <DownloadViewer
        file={file}
        enable_conversion={is_file_convertible}
        on_convert_to_pdf={handle_convert_to_pdf}
        is_converting={is_converting}
      />
      {conversion_error_display}
    </div>
  );
}
