"use client";

import * as React from "react";
import { FaPlus } from "react-icons/fa";
import { Button } from "../ui/button";
import { cn, extract_filename_from_url } from "../../lib/utils";
import type { DocLink, FormConfig, FileUploadResult } from "../../lib/types";
import type { PdfViewerProps } from "../hazo_data_form/types";
import { FileListItem } from "./file_list_item";
import { NonPdfContent } from "./non_pdf_content";
import { UploadZone } from "./upload_zone";

export interface DocPanelProps {
  /** Array of doc_links for the current field */
  doc_links: DocLink[];

  /** Whether panel is open */
  is_open: boolean;

  /** Callback to close panel */
  on_close: () => void;

  /** Config for styling */
  config: FormConfig;

  /** Optional PDF viewer component (from hazo_pdf or custom) */
  pdf_viewer_component?: React.ComponentType<PdfViewerProps>;

  /** Callback when PDF is saved */
  on_pdf_save?: (
    pdf_bytes: Uint8Array,
    filename: string,
    original_url: string
  ) => void;

  /** Optional className for the panel container */
  class_name?: string;

  // Upload mode props
  /** Enable upload UI mode */
  upload_mode?: boolean;

  /** Field label for display in upload mode */
  field_label?: string;

  /** Upload handler callback */
  on_upload?: (files: File[]) => Promise<FileUploadResult[]>;

  /** Delete handler callback */
  on_delete?: (file_id: string) => Promise<boolean>;
}

/**
 * Document Panel Component
 * Two-row layout: file list on top, viewer/download on bottom
 * In upload mode: adds upload zone and delete functionality
 */
export function DocPanel({
  doc_links,
  is_open,
  on_close,
  config,
  pdf_viewer_component,
  on_pdf_save,
  class_name,
  upload_mode,
  field_label,
  on_upload,
  on_delete,
}: DocPanelProps) {
  // Selected file state - defaults to first file
  const [selected_index, set_selected_index] = React.useState(0);

  // Upload mode state
  const [show_upload_zone, set_show_upload_zone] = React.useState(false);
  const [delete_in_progress, set_delete_in_progress] = React.useState<string | null>(null);

  // Dynamic PDF viewer loading (existing pattern)
  const [DynamicPdfViewer, set_dynamic_pdf_viewer] = React.useState<React.ComponentType<PdfViewerProps> | null>(null);
  const [hazo_pdf_error, set_hazo_pdf_error] = React.useState<string | null>(null);
  // Track file-specific errors by URL
  const [file_errors, set_file_errors] = React.useState<Map<string, string>>(new Map());

  const PdfViewerComponent = pdf_viewer_component || DynamicPdfViewer;

  // Reset selection when doc_links change
  React.useEffect(() => {
    // Keep selection in bounds
    if (selected_index >= doc_links.length) {
      set_selected_index(Math.max(0, doc_links.length - 1));
    }
  }, [doc_links, selected_index]);

  // Show upload zone automatically if no files in upload mode
  React.useEffect(() => {
    if (upload_mode && doc_links.length === 0) {
      set_show_upload_zone(true);
    }
  }, [upload_mode, doc_links.length]);

  // Load PDF viewer dynamically (existing pattern from PdfPanel)
  React.useEffect(() => {
    if (is_open && !pdf_viewer_component && !DynamicPdfViewer) {
      const load_pdf_viewer = async () => {
        try {
          // Dynamic import of hazo_pdf (optional peer dependency)
          const module = await import(/* webpackChunkName: "hazo_pdf" */ "hazo_pdf");
          // Load CSS (no type declarations for CSS files)
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
  }, [is_open, pdf_viewer_component, DynamicPdfViewer]);

  // Handle file deletion
  const handle_delete = async (file_id: string) => {
    if (!on_delete) return;

    set_delete_in_progress(file_id);
    try {
      await on_delete(file_id);
    } finally {
      set_delete_in_progress(null);
    }
  };

  if (!is_open) {
    return null;
  }

  // In upload mode with no files, show empty state
  const has_files = doc_links.length > 0;
  const selected_doc = has_files ? (doc_links[selected_index] || doc_links[0]) : null;
  const selected_filename = selected_doc
    ? (selected_doc.filename || extract_filename_from_url(selected_doc.url))
    : "";

  // Header title based on mode
  const header_title = upload_mode && field_label
    ? `Files for "${field_label}"`
    : `Documents (${doc_links.length})`;

  return (
    <div
      className={cn(
        "cls_doc_panel bg-background flex flex-col h-full",
        class_name
      )}
    >
      {/* TOP ROW: Header + File List */}
      <div className="cls_doc_panel_file_list border-b bg-muted shrink-0">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-2 border-b">
          <span className="text-sm font-medium text-foreground">
            {header_title}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={on_close}
            className="h-8 w-8 p-0"
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

        {/* Scrollable file list */}
        <div className="flex gap-2 p-2 overflow-x-auto items-center">
          {doc_links.map((doc, index) => (
            <FileListItem
              key={`${doc.url}-${doc.file_id || index}`}
              doc_link={doc}
              is_selected={index === selected_index}
              on_click={() => set_selected_index(index)}
              config={config}
              deletable={upload_mode && !!doc.file_id && !!on_delete}
              on_delete={doc.file_id ? () => handle_delete(doc.file_id!) : undefined}
              delete_in_progress={delete_in_progress === doc.file_id}
            />
          ))}

          {/* Add file button in upload mode */}
          {upload_mode && on_upload && (
            <button
              type="button"
              onClick={() => set_show_upload_zone(!show_upload_zone)}
              className={cn(
                "cls_add_file_btn flex items-center gap-1 px-3 py-2 rounded-md text-sm",
                "border border-dashed transition-colors whitespace-nowrap",
                show_upload_zone
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-input hover:bg-muted"
              )}
            >
              <FaPlus size={12} />
              <span>Add file</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload zone (shown when Add file is clicked) */}
      {upload_mode && show_upload_zone && on_upload && (
        <UploadZone
          config={config}
          existing_file_count={doc_links.length}
          on_upload={on_upload}
          on_upload_complete={() => set_show_upload_zone(false)}
        />
      )}

      {/* BOTTOM ROW: Viewer Area */}
      <div className="cls_doc_panel_viewer flex-1 overflow-hidden">
        {!has_files ? (
          /* Empty state */
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
              {upload_mode && (
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Click "Add file" to upload
                </p>
              )}
            </div>
          </div>
        ) : selected_doc?.type === "pdf" ? (
          /* PDF Viewer */
          <div className="h-full w-full">
            {hazo_pdf_error ? (
              /* hazo_pdf library failed to load */
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
                  <p className="text-xs mt-2 text-muted-foreground/80">
                    Run: npm install hazo_pdf
                  </p>
                </div>
              </div>
            ) : file_errors.has(selected_doc.url) ? (
              /* Specific file failed to load (e.g., 404) */
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
                    {file_errors.get(selected_doc.url)?.includes("404")
                      ? `Missing PDF "${selected_filename}".`
                      : file_errors.get(selected_doc.url)}
                  </p>
                  {file_errors.get(selected_doc.url)?.includes("404") && (
                    <p className="text-xs mt-2 text-muted-foreground/80">
                      The file may have been deleted or moved.
                    </p>
                  )}
                  {upload_mode && on_delete && selected_doc.file_id && (
                    <button
                      type="button"
                      onClick={() => handle_delete(selected_doc.file_id!)}
                      className="mt-4 px-3 py-1.5 text-sm bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors"
                    >
                      Remove this file reference
                    </button>
                  )}
                </div>
              </div>
            ) : !PdfViewerComponent ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              </div>
            ) : (
              <PdfViewerComponent
                key={selected_doc.url}
                url={selected_doc.url}
                className="h-full w-full"
                default_scale="page-width"
                on_error={(error: Error) => {
                  console.error("PDF load error for", selected_doc.url, ":", error);
                  set_file_errors((prev) => {
                    const next = new Map(prev);
                    next.set(selected_doc.url, error.message);
                    return next;
                  });
                }}
                on_save={
                  on_pdf_save
                    ? (pdf_bytes: Uint8Array, filename: string) => {
                        on_pdf_save(pdf_bytes, filename, selected_doc.url);
                      }
                    : undefined
                }
              />
            )}
          </div>
        ) : selected_doc ? (
          /* Non-PDF content (image preview or download) */
          <NonPdfContent doc_link={selected_doc} filename={selected_filename} />
        ) : null}
      </div>
    </div>
  );
}

// Re-export sub-components
export { FileListItem } from "./file_list_item";
export { NonPdfContent } from "./non_pdf_content";
export { UploadZone } from "./upload_zone";
