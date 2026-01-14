"use client";

import * as React from "react";
import { FaDownload, FaExternalLinkAlt } from "react-icons/fa";
import { Button } from "../ui/button";
import type { DocLink } from "../../lib/types";

export interface NonPdfContentProps {
  doc_link: DocLink;
  filename: string;
}

/**
 * Content display for non-PDF files
 * Shows preview for images, download button for other types
 */
export function NonPdfContent({ doc_link, filename }: NonPdfContentProps) {
  const handle_download = () => {
    // Open in new tab (will trigger download for non-viewable types)
    window.open(doc_link.url, "_blank");
  };

  // For images, show a preview
  if (doc_link.type === "image") {
    return (
      <div className="cls_non_pdf_image flex flex-col items-center justify-center h-full p-4">
        <img
          src={doc_link.url}
          alt={filename}
          className="max-w-full max-h-[70%] object-contain rounded border"
        />
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={handle_download}>
            <FaExternalLinkAlt className="mr-2" size={14} />
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }

  // For documents and other files, show download prompt
  return (
    <div className="cls_non_pdf_download flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <FaDownload size={24} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{filename}</h3>
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
