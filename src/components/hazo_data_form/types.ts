import type { ComponentType } from "react";
import type { UseFormReturn } from "react-hook-form";
import type {
  FormSchema,
  FormValues,
  FormMode,
  DocLinkClickEvent,
  FormConfig,
  FormErrors,
  PdfPanelPosition,
  PartialFormConfig,
  FileUploadRequest,
  FileUploadResult,
  UploadedFile,
} from "../../lib/types";
import type { FileManagerPopoutContext } from "../file_manager_viewer/types";
import type { HazoServices } from "../../context";

// ============================================================================
// hazo_pdf Type Aliases
// These provide type-safe access to hazo_pdf types for consumers who don't
// import hazo_pdf directly. They mirror the types from hazo_pdf v1.3.2.
// ============================================================================

/**
 * File item for multi-file PDF viewer (mirrors hazo_pdf's HazoPdfFileItem)
 */
export interface HazoPdfFileItem {
  /** Unique identifier for the file */
  id: string;
  /** Display name for the file */
  name: string;
  /** URL to the PDF file */
  url: string;
  /** File type (e.g., "pdf", "image") */
  type?: string;
  /** Optional MIME type (used for conversion detection) */
  mime_type?: string;
  /** Original file size in bytes */
  size?: number;
  /** Whether this file was converted to PDF */
  converted?: boolean;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Result from file upload handler (mirrors hazo_pdf's HazoPdfUploadResult)
 */
export interface HazoPdfUploadResult {
  /** Whether upload was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** The uploaded file item */
  file?: HazoPdfFileItem;
}

/**
 * Display mode for the file manager sidebar (mirrors hazo_pdf's HazoPdfFileManagerDisplayMode)
 */
export type HazoPdfFileManagerDisplayMode = "tabs" | "dropdown" | "hidden";

/**
 * Context passed to popout handler (mirrors hazo_pdf's HazoPdfPopoutContext)
 */
export interface HazoPdfPopoutContext {
  /** Currently selected file */
  current_file: HazoPdfFileItem | null;
  /** All files in the viewer */
  files: HazoPdfFileItem[];
  /** Current page number */
  page: number;
  /** Current scale/zoom level */
  scale: number | "page-width" | "page-fit" | "auto";
}

// ============================================================================
// PdfViewerProps
// ============================================================================

/**
 * Props expected by a PDF viewer component
 * Supports both single-file (url) and multi-file (files) modes
 */
export interface PdfViewerProps {
  // Single-file mode (legacy, still supported)
  /** URL to display (optional when using files array) */
  url?: string;

  // Common props
  /** Additional CSS class name */
  className?: string;
  /** Callback when an error occurs loading the PDF */
  on_error?: (error: Error) => void;
  /** Default scale/zoom level */
  default_scale?: "page-width" | "page-fit" | "auto" | number;
  /** Callback when PDF is saved/annotated */
  on_save?: (pdf_bytes: Uint8Array, filename: string) => void;

  // Multi-file mode (new in hazo_pdf 1.3.2)
  /** Array of files for multi-file mode */
  files?: HazoPdfFileItem[];
  /** Callback when a file is selected */
  on_file_select?: (file: HazoPdfFileItem) => void;
  /** Callback when a file is deleted */
  on_file_delete?: (file_id: string) => void;
  /** Callback when a file is uploaded */
  on_upload?: (file: File, converted_pdf?: Uint8Array) => Promise<HazoPdfUploadResult>;
  /** Callback when the files array changes */
  on_files_change?: (files: HazoPdfFileItem[]) => void;

  // File manager display options
  /** Display mode for file manager sidebar */
  file_manager_display_mode?: HazoPdfFileManagerDisplayMode;

  // Popout feature
  /** Enable popout button to open in new tab */
  enable_popout?: boolean;
  /** Route for popout page (e.g., "/pdf-viewer") */
  popout_route?: string;
  /** Callback when popout button is clicked */
  on_popout?: (context: HazoPdfPopoutContext) => void;

  // UI customization
  /** Title to display in the viewer header */
  viewer_title?: string;
}

/**
 * Props for the HazoDataForm component
 */
export interface HazoDataFormProps {
  /**
   * JSON schema defining form structure
   */
  schema: FormSchema;

  /**
   * Form mode: 'edit' for editable, 'view' for read-only display
   * @default 'edit'
   */
  mode?: FormMode;

  /**
   * Initial/controlled form values
   */
  values?: FormValues;

  /**
   * Default values for uncontrolled mode
   */
  default_values?: FormValues;

  /**
   * Callback when any field value changes
   */
  on_change?: (values: FormValues) => void;

  /**
   * Callback when a specific field changes
   */
  on_field_change?: (field_id: string, value: unknown) => void;

  /**
   * Callback when form is submitted (edit mode)
   */
  on_submit?: (values: FormValues) => void;

  /**
   * Callback when a doc_link is clicked
   */
  on_doc_link_click?: (event: DocLinkClickEvent) => void;

  /**
   * Whether to show built-in PDF panel when doc_link clicked
   * Set to false to handle doc_link externally via on_doc_link_click
   * @default true
   */
  show_pdf_panel?: boolean;

  /**
   * Position of the PDF panel relative to form
   * @default 'right'
   */
  pdf_panel_position?: PdfPanelPosition;

  /**
   * Custom PDF panel width (overrides config)
   */
  pdf_panel_width?: string;

  /**
   * Whether PDF panel can be resized
   * @default true
   */
  pdf_panel_resizable?: boolean;

  /**
   * PDF viewer component to use (from hazo_pdf or custom)
   * If not provided, will attempt to dynamically load hazo_pdf
   * Example: import { PdfViewer } from 'hazo_pdf'; <HazoDataForm pdf_viewer_component={PdfViewer} />
   */
  pdf_viewer_component?: ComponentType<PdfViewerProps>;

  /**
   * Callback when PDF is saved from the PDF viewer
   * Receives the PDF bytes, suggested filename, and original URL
   * Use this to save the PDF back to the server or trigger a download
   */
  on_pdf_save?: (pdf_bytes: Uint8Array, filename: string, original_url: string) => void;

  /**
   * Path to config INI file
   * @default '/config/hazo_data_forms_config.ini'
   */
  config_path?: string;

  /**
   * Config overrides (takes precedence over INI file)
   */
  config_override?: PartialFormConfig;

  /**
   * External validation errors
   */
  errors?: FormErrors;

  /**
   * Whether to validate on blur
   * @default true
   */
  validate_on_blur?: boolean;

  /**
   * Whether to validate on change
   * @default false
   */
  validate_on_change?: boolean;

  /**
   * Custom validation function
   */
  validate?: (values: FormValues) => FormErrors;

  /**
   * CSS class name for form container
   */
  class_name?: string;

  /**
   * Whether to show section headers
   * @default true
   */
  show_section_headers?: boolean;

  /**
   * Whether to show sub-section headers
   * @default true
   */
  show_sub_section_headers?: boolean;

  /**
   * Whether sections are collapsible
   * @default false
   */
  collapsible_sections?: boolean;

  /**
   * Initially collapsed section names
   */
  collapsed_sections?: string[];

  /**
   * Callback to receive react-hook-form methods
   */
  on_form_ready?: (methods: UseFormReturn<FormValues>) => void;

  /**
   * Whether to show submit button
   * @default true (when on_submit is provided)
   */
  show_submit_button?: boolean;

  /**
   * Custom submit button text
   * @default 'Submit'
   */
  submit_button_text?: string;

  /**
   * Whether to enable file upload feature for fields
   * This works in conjunction with config.file_upload.enabled
   * @default false
   */
  enable_file_upload?: boolean;

  /**
   * Callback when a file is uploaded
   * Should handle saving the file and return the result with URL
   */
  on_file_upload?: (request: FileUploadRequest) => Promise<FileUploadResult>;

  /**
   * Callback when an uploaded file is deleted
   * Should handle removing the file from storage
   * Returns true if deletion was successful
   */
  on_file_delete?: (field_id: string, file_id: string) => Promise<boolean>;

  /**
   * Callback when an uploaded file is viewed
   * Use this to handle custom viewing behavior (e.g., open in new tab)
   * If not provided, PDFs will open in the PDF panel, others in new tab
   */
  on_file_view?: (field_id: string, uploaded_file: UploadedFile) => void;

  /**
   * Callback when the popout button is clicked in the file manager
   * Use this to open the FileManager in a new tab/window
   * Receives full context (all files, selected file, field info) to reconstruct the view
   */
  on_file_popout?: (context: FileManagerPopoutContext) => void;

  // ============================================================================
  // hazo_pdf 1.3.2 Features
  // ============================================================================

  /**
   * Enable file conversion to PDF for supported types (images, text, Excel)
   * Requires hazo_pdf v1.3.2 or later
   * @default false
   */
  enable_file_conversion?: boolean;

  /**
   * Callback when a file is converted to PDF
   * Use this to handle the converted PDF (e.g., display it, save it, etc.)
   */
  on_file_convert?: (converted_pdf: Uint8Array, original_filename: string) => void;

  /**
   * Enable the popout button in the PDF viewer
   * Allows opening the PDF viewer in a new tab/window
   * @default false
   */
  enable_pdf_popout?: boolean;

  /**
   * Route for the popout page (e.g., "/pdf-viewer")
   * Only used if enable_pdf_popout is true
   */
  pdf_popout_route?: string;

  /**
   * Callback when the PDF popout button is clicked
   * Receives context about the current viewer state
   */
  on_pdf_popout?: (context: HazoPdfPopoutContext) => void;

  // ============================================================================
  // Service Injection
  // ============================================================================

  /**
   * Services to inject (db, logger, custom)
   * Alternative to using HazoServicesProvider at app level
   *
   * Usage:
   * ```tsx
   * <HazoDataForm
   *   schema={schema}
   *   services={{ db, logger }}
   * />
   * ```
   */
  services?: HazoServices;
}
