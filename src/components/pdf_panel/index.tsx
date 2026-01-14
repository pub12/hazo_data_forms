"use client";

import * as React from "react";
import { DocPanel } from "../doc_panel";
import type { DocLink, FormConfig } from "../../lib/types";
import type { PdfViewerProps } from "../hazo_data_form/types";

export interface PdfPanelProps {
  /** Currently active doc_link */
  doc_link: DocLink | null;

  /** Whether panel is open */
  is_open: boolean;

  /** Callback to close panel */
  on_close: () => void;

  /** Config for styling */
  config: FormConfig;

  /** Optional PDF viewer component (from hazo_pdf or custom) */
  pdf_viewer_component?: React.ComponentType<PdfViewerProps>;

  /** Callback when PDF is saved - receives the PDF bytes, filename, and original URL */
  on_pdf_save?: (pdf_bytes: Uint8Array, filename: string, original_url: string) => void;

  /** Optional className for the panel container */
  class_name?: string;
}

/**
 * PDF Panel Component
 * @deprecated Use DocPanel instead. PdfPanel is kept for backward compatibility.
 * Wraps DocPanel to provide backward compatibility with single doc_link prop.
 */
export function PdfPanel({
  doc_link,
  is_open,
  on_close,
  config,
  pdf_viewer_component,
  on_pdf_save,
  class_name,
}: PdfPanelProps) {
  // Convert single doc_link to array for DocPanel
  const doc_links = doc_link ? [doc_link] : [];

  return (
    <DocPanel
      doc_links={doc_links}
      is_open={is_open}
      on_close={on_close}
      config={config}
      pdf_viewer_component={pdf_viewer_component}
      on_pdf_save={on_pdf_save}
      class_name={class_name}
    />
  );
}

// Re-export DocLinkButton
export { DocLinkButton } from "./doc_link_button";
