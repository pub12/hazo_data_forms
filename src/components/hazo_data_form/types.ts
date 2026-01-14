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

/**
 * Props expected by a PDF viewer component
 */
export interface PdfViewerProps {
  url: string;
  className?: string;
  on_error?: (error: Error) => void;
  default_scale?: "page-width" | "page-fit" | "auto" | number;
  on_save?: (pdf_bytes: Uint8Array, filename: string) => void;
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
}
