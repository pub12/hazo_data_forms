"use client";

// Main component
export { HazoDataForm } from "./components/hazo_data_form";
export type {
  HazoDataFormProps,
  PdfViewerProps,
  // hazo_pdf type aliases (for consumers who don't import hazo_pdf directly)
  HazoPdfFileItem,
  HazoPdfUploadResult,
  HazoPdfFileManagerDisplayMode,
  HazoPdfPopoutContext,
} from "./components/hazo_data_form/types";

// hazo_pdf conversion utilities (async loader)
export {
  get_hazo_pdf_conversion_utils,
  is_hazo_pdf_available,
  is_potentially_convertible,
  CONVERTIBLE_MIME_TYPES,
} from "./lib/hazo_pdf_exports";
export type { HazoPdfConversionUtils } from "./lib/hazo_pdf_exports";

// Field renderers
export {
  FieldRenderer as FieldRendererComponent,
  TextField,
  NumberField,
  DateField,
  BooleanField,
  OptionField,
  EmailField,
  TelField,
  CurrencyField,
  PercentageField,
  TextareaField,
  TableField,
  ComputedField,
  StaticTextField,
  SummaryRowField,
  MaskedField,
  register_field_renderer,
  get_field_renderer,
  resolve_field_type,
  is_masked_field_type,
  get_base_field_type,
} from "./components/field_renderers";

// Section renderers
export { SectionRenderer, SubSectionRenderer } from "./components/section_renderer";

// File Manager (new unified component)
export {
  FileManager,
  FileManagerButton,
  FileManagerDialog,
  FileList,
  FileViewer,
  UploadZone as FileManagerUploadZone,
  FileManagerPage,
} from "./components/file_manager_viewer";
export type {
  FileManagerProps,
  FileManagerButtonProps,
  FileManagerDialogProps,
  FileItem,
  FileManagerDisplayMode,
  FileManagerPopoutContext,
} from "./components/file_manager_viewer/types";
export type { FileManagerPageProps } from "./components/file_manager_viewer/file_manager_page";
export { doc_link_to_file_item } from "./components/file_manager_viewer/types";

// Document panel (deprecated - use FileManager)
/** @deprecated Use FileManager instead */
export { DocPanel, FileListItem, NonPdfContent, UploadZone } from "./components/doc_panel";
/** @deprecated Use FileManager instead */
export type { DocPanelProps } from "./components/doc_panel";

// PDF panel (deprecated - use FileManager)
/** @deprecated Use FileManager instead */
export { PdfPanel, DocLinkButton } from "./components/pdf_panel";

// File upload components (deprecated - use FileManager)
/** @deprecated Use FileManager instead */
export { FileUploadDialog } from "./components/file_upload_dialog";
/** @deprecated Use FileManagerButton instead */
export { UploadIconButton } from "./components/file_upload_dialog/upload_icon_button";

// Hooks
export { useFormConfig, useConfigValue } from "./hooks/use_form_config";

// Style resolver
export {
  resolve_tokens,
  resolve_style_class,
  to_inline_style,
  get_style_value,
  create_style_resolver,
  merge_with_overrides,
  get_legacy_style_level,
} from "./lib/style_resolver";
export type { StyleResolver } from "./lib/style_resolver";

// Types
export type {
  DocLink,
  DocLinkType,
  HelpTooltip,
  OptionItem,
  FieldType,
  BaseFieldType,
  TableColumn,
  FieldInfo,
  LabelPosition,
  StyleLevel,
  StyleVariant,
  StyleLevelConfig,
  HierarchicalStyleConfig,
  // New style system types
  StyleTokens,
  StyleClassDefinition,
  StylesConfig,
  ResolvedStyle,
  // New field type system types
  FieldTypeDefinition,
  FieldTypesConfig,
  // Form types
  FormField,
  ColumnHeader,
  FieldGroup,
  SubSection,
  FormSection,
  FormSchema,
  FormValues,
  FormMode,
  PdfPanelPosition,
  DocLinkClickEvent,
  FormErrors,
  FormConfig,
  PartialFormConfig,
  // File upload types
  UploadedFile,
  FieldUploads,
  FileUploadRequest,
  FileUploadResult,
  FileUploadConfig,
  // File manager config
  FileManagerConfig,
} from "./lib/types";

export {
  DEFAULT_FORM_CONFIG,
  DEFAULT_STYLES_CONFIG,
  DEFAULT_FIELD_TYPES_CONFIG,
} from "./lib/types";

// Field registry types
export type { FieldRendererProps, FieldRenderer } from "./lib/field_registry";

// Utilities
export {
  cn,
  format_currency,
  format_percentage,
  format_date,
  parse_boolean,
  parse_number,
  parse_string,
  evaluate_formula,
  generate_id,
  deep_merge,
  // File upload utilities
  get_uploads_key,
  get_field_uploads,
  has_field_uploads,
  generate_file_id,
  format_file_size,
  is_mime_type_allowed,
  // Document link utilities
  extract_filename_from_url,
  normalize_doc_links,
  infer_doc_link_type_from_mime,
  uploaded_file_to_doc_link,
  uploads_to_doc_links,
} from "./lib/utils";
