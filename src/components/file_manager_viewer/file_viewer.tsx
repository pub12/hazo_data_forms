"use client";

import * as React from "react";
import { FaDownload, FaExternalLinkAlt } from "react-icons/fa";
import { Button } from "../ui/button";
import type { FileViewerProps, FileItem } from "./types";
import type { PdfViewerProps } from "../hazo_data_form/types";

/**
 * Empty state when no files
 */
function EmptyState({ upload_enabled }: { upload_enabled?: boolean }) {
  return (
    <div className="flex items-center justify-center h-full p-4 text-center text-gray-500">
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
          className="mx-auto mb-4 text-gray-300"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p className="text-sm text-gray-500">No files yet</p>
        {upload_enabled && (
          <p className="text-xs text-gray-400 mt-1">
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
    <div className="flex items-center justify-center h-full p-4 text-center text-gray-500">
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
          className="mx-auto mb-4 text-gray-400"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" x2="15" y1="15" y2="15" />
        </svg>
        <p className="text-sm text-gray-600">
          {is_404 ? `Missing PDF "${filename}".` : message}
        </p>
        {is_404 && (
          <p className="text-xs mt-2 text-gray-400">
            The file may have been deleted or moved.
          </p>
        )}
        {deletable && on_delete && (
          <button
            type="button"
            onClick={on_delete}
            className="mt-4 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Remove this file reference
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Image preview component
 */
function ImageViewer({ file }: { file: FileItem }) {
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
      </div>
    </div>
  );
}

/**
 * Download prompt for non-viewable files
 */
function DownloadViewer({ file }: { file: FileItem }) {
  const handle_download = () => {
    window.open(file.url, "_blank");
  };

  return (
    <div className="cls_file_viewer_download flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <FaDownload size={24} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{file.filename}</h3>
      <p className="text-sm text-gray-500 mb-6">
        This file type cannot be previewed. Click below to download or open.
      </p>
      <Button onClick={handle_download}>
        <FaDownload className="mr-2" size={14} />
        Download File
      </Button>
    </div>
  );
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
}: FileViewerProps) {
  // Dynamic PDF viewer loading
  const [DynamicPdfViewer, set_dynamic_pdf_viewer] =
    React.useState<React.ComponentType<PdfViewerProps> | null>(null);
  const [hazo_pdf_error, set_hazo_pdf_error] = React.useState<string | null>(null);
  const [file_error, set_file_error] = React.useState<string | null>(null);

  const PdfViewerComponent = pdf_viewer_component || DynamicPdfViewer;

  // Load PDF viewer dynamically
  React.useEffect(() => {
    if (file?.type === "pdf" && !pdf_viewer_component && !DynamicPdfViewer) {
      const load_pdf_viewer = async () => {
        try {
          // @ts-expect-error - hazo_pdf is an optional peer dependency
          const module = await import(/* webpackChunkName: "hazo_pdf" */ "hazo_pdf");
          // @ts-expect-error - hazo_pdf is an optional peer dependency
          await import(/* webpackChunkName: "hazo_pdf_styles" */ "hazo_pdf/styles.css");
          set_dynamic_pdf_viewer(() => module.PdfViewer);
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

  // Reset file error when file changes
  React.useEffect(() => {
    set_file_error(null);
  }, [file?.url]);

  // Empty state
  if (!file) {
    return <EmptyState upload_enabled />;
  }

  // PDF file
  if (file.type === "pdf") {
    // hazo_pdf library error
    if (hazo_pdf_error) {
      return (
        <div className="flex items-center justify-center h-full p-4 text-center text-gray-500">
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
              className="mx-auto mb-4 text-gray-400"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" x2="15" y1="15" y2="15" />
            </svg>
            <p className="text-sm">{hazo_pdf_error}</p>
            <p className="text-xs mt-2 text-gray-400">Run: npm install hazo_pdf</p>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      );
    }

    // Render PDF viewer
    return (
      <div className="h-full w-full">
        <PdfViewerComponent
          key={file.url}
          url={file.url}
          className="h-full w-full"
          default_scale="page-width"
          on_error={(error: Error) => {
            console.error("PDF load error for", file.url, ":", error);
            set_file_error(error.message);
          }}
          on_save={
            on_pdf_save
              ? (pdf_bytes: Uint8Array, filename: string) => {
                  on_pdf_save(pdf_bytes, filename, file.url);
                }
              : undefined
          }
        />
      </div>
    );
  }

  // Image file
  if (file.type === "image") {
    return <ImageViewer file={file} />;
  }

  // Other file types - download prompt
  return <DownloadViewer file={file} />;
}
