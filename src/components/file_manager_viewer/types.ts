"use client";

import type { DocLink, DocLinkType, FormConfig, FileUploadResult } from "../../lib/types";
import type { PdfViewerProps } from "../hazo_data_form/types";

/**
 * Display mode for the file manager
 */
export type FileManagerDisplayMode = "sidebar" | "dialog";

/**
 * Unified file item that can represent either a doc_link or an uploaded file
 */
export interface FileItem {
  /** Unique identifier */
  id: string;
  /** Display filename */
  filename: string;
  /** File URL */
  url: string;
  /** File type for icon selection */
  type: DocLinkType;
  /** Source: "doc_link" (schema) or "upload" (user uploaded) */
  source: "doc_link" | "upload";
  /** Page number for PDFs */
  page?: number;
  /** File ID for uploaded files (for deletion) */
  file_id?: string;
}

/**
 * Props for the FileManagerButton component
 */
export interface FileManagerButtonProps {
  /** Total count of files (doc_links + uploads) */
  file_count: number;
  /** Whether the field has any files */
  has_files: boolean;
  /** Click handler */
  on_click: () => void;
  /** Configuration */
  config: FormConfig;
  /** Additional class name */
  class_name?: string;
  /** Tooltip text override */
  tooltip_text?: string;
  /** Whether button is disabled (e.g., view mode without files) */
  disabled?: boolean;
}

/**
 * Props for the FileManager component
 */
export interface FileManagerProps {
  /** Array of all files (doc_links converted + uploads) */
  files: FileItem[];

  /** Whether manager is open */
  is_open: boolean;

  /** Callback to close manager */
  on_close: () => void;

  /** Display mode */
  display_mode: FileManagerDisplayMode;

  /** Config for styling */
  config: FormConfig;

  /** Optional PDF viewer component */
  pdf_viewer_component?: React.ComponentType<PdfViewerProps>;

  /** Callback when PDF is saved */
  on_pdf_save?: (
    pdf_bytes: Uint8Array,
    filename: string,
    original_url: string
  ) => void;

  // Upload functionality
  /** Enable upload UI */
  upload_enabled?: boolean;

  /** Field label for display */
  field_label?: string;

  /** Field ID for upload context */
  field_id?: string;

  /** Upload handler callback */
  on_upload?: (files: File[]) => Promise<FileUploadResult[]>;

  /** Delete handler callback (only for uploaded files) */
  on_delete?: (file_id: string) => Promise<boolean>;

  /** Callback when popout button is clicked. Receives full context to reconstruct FileManager. */
  on_popout?: (context: FileManagerPopoutContext) => void;

  /** Optional className */
  class_name?: string;

  // File conversion support (new in hazo_pdf 1.3.2)
  /** Enable file conversion to PDF for supported types */
  enable_file_conversion?: boolean;
  /** Callback when a file is converted to PDF */
  on_file_convert?: (converted_pdf: Uint8Array, original_filename: string) => void;
}

/**
 * Props for the FileManagerDialog component
 */
export interface FileManagerDialogProps extends Omit<FileManagerProps, "display_mode"> {
  /** Dialog title override */
  title?: string;
}

/**
 * Context passed to the popout callback
 * Contains all information needed to reconstruct the FileManager in a new tab
 */
export interface FileManagerPopoutContext {
  /** All files in the file manager */
  files: FileItem[];
  /** Currently selected file */
  selected_file: FileItem;
  /** Index of the selected file */
  selected_index: number;
  /** Field ID (if applicable) */
  field_id?: string;
  /** Field label (if applicable) */
  field_label?: string;
}

/**
 * Upload progress state for individual files
 */
export interface UploadProgress {
  filename: string;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

/**
 * Props for the FileList component
 */
export interface FileListProps {
  /** List of files to display */
  files: FileItem[];
  /** Index of currently selected file */
  selected_index: number;
  /** Callback when a file is selected */
  on_select: (index: number) => void;
  /** Delete handler (only for uploaded files) */
  on_delete?: (file_id: string) => Promise<boolean>;
  /** Whether upload is enabled */
  upload_enabled?: boolean;
  /** Whether to show the add button */
  show_add_button?: boolean;
  /** Configuration */
  config: FormConfig;

  // Integrated dropzone functionality
  /** Handler for dropped/selected files */
  on_files_dropped?: (files: File[]) => void;
  /** Whether drag-drop is enabled */
  drag_drop_enabled?: boolean;
  /** File input accept string for file picker */
  accept_types?: string;
  /** Whether upload is in progress */
  is_uploading?: boolean;
  /** Current upload progress */
  upload_progress?: UploadProgress[];
}

/**
 * Props for the FileViewer component
 */
export interface FileViewerProps {
  /** File to display (null for empty state) */
  file: FileItem | null;
  /** Configuration */
  config: FormConfig;
  /** Optional PDF viewer component */
  pdf_viewer_component?: React.ComponentType<PdfViewerProps>;
  /** Callback when PDF is saved */
  on_pdf_save?: (
    pdf_bytes: Uint8Array,
    filename: string,
    original_url: string
  ) => void;
  /** Whether this file can be deleted (upload mode + uploaded file) */
  deletable?: boolean;
  /** Delete handler */
  on_delete?: () => void;

  // File conversion support (new in hazo_pdf 1.3.2)
  /** Enable file conversion to PDF for supported types (images, text, Excel) */
  enable_file_conversion?: boolean;
  /**
   * Callback when a file is converted to PDF
   * The caller should handle storing/displaying the converted PDF
   */
  on_convert_to_pdf?: (converted_pdf: Uint8Array, original_filename: string) => void;
}

/**
 * Convert DocLink to FileItem
 */
export function doc_link_to_file_item(doc_link: DocLink, index: number): FileItem {
  const filename = doc_link.filename || extract_filename_from_doc_link(doc_link.url);
  return {
    id: doc_link.file_id || `doc_link_${index}`,
    filename,
    url: doc_link.url,
    type: doc_link.type,
    source: doc_link.file_id ? "upload" : "doc_link",
    page: doc_link.page,
    file_id: doc_link.file_id,
  };
}

/**
 * Extract filename from URL
 */
function extract_filename_from_doc_link(url: string): string {
  try {
    const pathname = new URL(url, "http://localhost").pathname;
    const filename = pathname.split("/").pop() || "document";
    return decodeURIComponent(filename);
  } catch {
    return "document";
  }
}
