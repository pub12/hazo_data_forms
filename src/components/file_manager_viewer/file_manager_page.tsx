"use client";

import * as React from "react";
import { FileManager } from "./index";
import type { FileManagerPopoutContext } from "./types";
import type { FormConfig } from "../../lib/types";
import type { PdfViewerProps } from "../hazo_data_form/types";
import type { HazoFileManagerInstance } from "../../context";

/**
 * Props for the FileManagerPage component
 */
export interface FileManagerPageProps {
  /** Storage key to read context from sessionStorage (default: "file_viewer_context") */
  storage_key?: string;

  /** Or provide context directly instead of reading from storage */
  context?: FileManagerPopoutContext;

  /** Config for styling */
  config: FormConfig;

  /** PDF viewer component */
  pdf_viewer_component?: React.ComponentType<PdfViewerProps>;

  /** File manager instance for save/load operations */
  file_manager?: HazoFileManagerInstance;

  /** Path where PDFs should be saved */
  pdf_save_path?: string;

  /** Callback when close button is clicked (default: window.close()) */
  on_close?: () => void;

  /** Render prop for error state */
  render_error?: (error: string) => React.ReactNode;

  /** Render prop for loading state */
  render_loading?: () => React.ReactNode;

  /** Optional className for the container */
  class_name?: string;
}

/**
 * FileManagerPage Component
 * Drop-in component for building file viewer popout pages.
 * Reads context from sessionStorage and renders the FileManager.
 * Consuming apps can wrap this with their own header/footer/navbar.
 */
export function FileManagerPage({
  storage_key = "file_viewer_context",
  context: provided_context,
  config,
  pdf_viewer_component,
  file_manager,
  pdf_save_path,
  on_close,
  render_error,
  render_loading,
  class_name,
}: FileManagerPageProps) {
  const [context, set_context] = React.useState<FileManagerPopoutContext | null>(
    provided_context || null
  );
  const [error, set_error] = React.useState<string | null>(null);

  // Read context from sessionStorage on mount
  React.useEffect(() => {
    if (provided_context) return; // Skip if context provided as prop

    const stored = sessionStorage.getItem(storage_key);
    if (stored) {
      try {
        set_context(JSON.parse(stored));
      } catch {
        set_error("Invalid file viewer context");
      }
    } else {
      set_error(
        "No file viewer context found. Please open this page from the file manager."
      );
    }
  }, [storage_key, provided_context]);

  // Default close handler closes the window
  const handle_close = on_close || (() => window.close());

  // Error state
  if (error) {
    if (render_error) {
      return <>{render_error(error)}</>;
    }
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
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
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Unable to load files
          </h2>
          <p className="text-foreground/80">{error}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!context) {
    if (render_loading) {
      return <>{render_loading()}</>;
    }
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  // Render FileManager with context
  return (
    <div className={class_name || "h-full"}>
      <FileManager
        files={context.files}
        is_open={true}
        on_close={handle_close}
        display_mode="sidebar"
        config={config}
        pdf_viewer_component={pdf_viewer_component}
        file_manager={file_manager}
        pdf_save_path={pdf_save_path}
        field_label={context.field_label}
        field_id={context.field_id}
      />
    </div>
  );
}
