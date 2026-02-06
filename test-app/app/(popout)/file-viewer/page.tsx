"use client";

import { useMemo } from "react";
import { FileManagerPage, DEFAULT_FORM_CONFIG } from "hazo_data_forms";
import { PdfViewer } from "hazo_pdf";
import "hazo_pdf/styles.css";
import { create_client_file_manager } from "../../../lib/client_file_manager";

/**
 * File Viewer Popout Page
 * Example usage of FileManagerPage component.
 * Demonstrates how consuming apps can create their own popout pages
 * with custom header/footer/navbar around the FileManagerPage component.
 */
export default function FileViewerPage() {
  const file_manager = useMemo(() => create_client_file_manager(), []);

  return (
    <div className="flex flex-col h-screen">
      {/* App's custom header - consuming apps can customize this */}
      <header className="shrink-0 px-4 py-2 border-b bg-white flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Document Viewer</h1>
        <span className="text-sm text-gray-500">hazo_data_forms test-app</span>
      </header>

      {/* FileManagerPage component fills the rest */}
      <div className="flex-1 overflow-hidden">
        <FileManagerPage
          config={DEFAULT_FORM_CONFIG}
          pdf_viewer_component={PdfViewer}
          file_manager={file_manager}
          pdf_save_path="/uploads/pdfs"
        />
      </div>
    </div>
  );
}
