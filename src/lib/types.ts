/**
 * Core type definitions for hazo_data_forms
 */

/**
 * Supported document types for DocLink
 * - "pdf": PDF documents (opens in embedded viewer)
 * - "image": Image files (jpg, png, gif, webp - displays inline preview)
 * - "document": Office documents (docx, xlsx, etc. - download only)
 * - "other": Any other file type (download only)
 */
export type DocLinkType = "pdf" | "image" | "document" | "other";

/**
 * Document link configuration for document integration
 */
export interface DocLink {
  /** Document type - determines how it's displayed */
  type: DocLinkType;
  /** URL/path to the document */
  url: string;
  /** Starting page (PDF only) */
  page?: number;
  /** Optional display name (if not provided, extracted from URL) */
  filename?: string;
  /** File ID for uploaded files (used for deletion) */
  file_id?: string;
}

/**
 * Uploaded file metadata - stored in form values
 */
export interface UploadedFile {
  /** Unique identifier for the file */
  file_id: string;
  /** Original filename */
  filename: string;
  /** URL/path where file is stored */
  url: string;
  /** MIME type */
  mime_type: string;
  /** File size in bytes */
  size: number;
  /** Upload timestamp (ISO string) */
  uploaded_at: string;
  /** Optional page number for PDFs (for doc_link navigation) */
  page?: number;
}

/**
 * Field uploads - array of uploaded files per field
 */
export type FieldUploads = UploadedFile[];

/**
 * Upload request sent to the upload handler callback
 */
export interface FileUploadRequest {
  /** The field being uploaded to */
  field_id: string;
  /** Field label for context */
  field_label: string;
  /** The file being uploaded */
  file: File;
  /** Section name containing the field */
  section_name?: string;
  /** Sub-section ID containing the field */
  sub_section_id?: string;
}

/**
 * Upload result returned from the upload handler callback
 */
export interface FileUploadResult {
  /** Whether upload succeeded */
  success: boolean;
  /** The uploaded file metadata (on success) */
  uploaded_file?: UploadedFile;
  /** Error message (on failure) */
  error?: string;
}

/**
 * File upload configuration
 */
export interface FileUploadConfig {
  /** Enable/disable upload feature globally */
  enabled: boolean;
  /** Allowed MIME types (e.g., ["application/pdf", "image/*"]) */
  allowed_types: string[];
  /** Max file size in bytes (default: 10MB) */
  max_file_size: number;
  /** Max files per field (default: 5) */
  max_files_per_field: number;
  /** Default upload directory hint (passed to callback) */
  default_directory?: string;
  /** Upload icon color */
  upload_icon_color: string;
  /** Upload icon hover color */
  upload_hover_color: string;
}

/**
 * File manager configuration
 * Controls the unified file management button and panel
 */
export interface FileManagerConfig {
  /** Default display mode: "sidebar" or "dialog" */
  display_mode: "sidebar" | "dialog";
  /** Icon size */
  icon_size: string;
  /** Icon color when no files */
  icon_color: string;
  /** Icon color on hover */
  icon_color_hover: string;
  /** Icon color when has files */
  icon_color_with_files: string;
  /** Badge background color */
  badge_background: string;
  /** Badge text color */
  badge_text_color: string;
  /** Dialog width */
  dialog_width: string;
  /** Dialog max height */
  dialog_max_height: string;
  /** Button column width */
  button_column_width: string;
}

/**
 * Help tooltip configuration for field labels
 * Displays a question mark icon that shows help content on hover
 */
export interface HelpTooltip {
  /** Custom help message to display */
  message?: string;
  /** Whether to show the calculation formula (for computed fields) */
  show_formula?: boolean;
  /** Custom formula display text (overrides computed_formula for display) */
  formula_display?: string;
}

/**
 * Style level type (H1-H6) for hierarchical styling
 */
export type StyleLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Style variant combining type (header/total) and level (h1-h6)
 * Used to specify styling for sections, sub-sections, and field rows
 */
export type StyleVariant =
  | `header_${StyleLevel}`
  | `total_${StyleLevel}`;

/**
 * Individual style level configuration (legacy format)
 * Defines visual properties for each header/total level
 * @deprecated Use StyleClassDefinition instead
 */
export interface StyleLevelConfig {
  font_size: string;
  font_weight: string;
  font_color: string;
  background_color: string;
  indent: string;
}

/**
 * Full hierarchical style configuration (legacy format)
 * Contains styling for all header and total levels (h1-h6)
 * @deprecated Use StylesConfig instead
 */
export interface HierarchicalStyleConfig {
  header_h1: StyleLevelConfig;
  header_h2: StyleLevelConfig;
  header_h3: StyleLevelConfig;
  header_h4: StyleLevelConfig;
  header_h5: StyleLevelConfig;
  header_h6: StyleLevelConfig;
  total_h1: StyleLevelConfig;
  total_h2: StyleLevelConfig;
  total_h3: StyleLevelConfig;
  total_h4: StyleLevelConfig;
  total_h5: StyleLevelConfig;
  total_h6: StyleLevelConfig;
}

// =============================================================================
// NEW STYLE SYSTEM TYPES
// =============================================================================

/**
 * Design tokens for reusable style values
 */
export interface StyleTokens {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
}

/**
 * Style class definition - CSS-class-like styling
 * Supports inheritance via 'extends' property
 * Token references use {category.key} syntax (e.g., "{colors.primary}")
 */
export interface StyleClassDefinition {
  /** Inherit from another style class */
  extends?: string;

  // Color properties
  color?: string;
  background_color?: string;
  border_color?: string;

  // Border properties
  border_width?: string;
  border_radius?: string;

  // Font properties
  font_family?: string;
  font_size?: string;
  font_weight?: string;
  line_height?: string;
  letter_spacing?: string;

  // Spacing properties
  padding?: string;
  padding_x?: string;
  padding_y?: string;
  margin?: string;
  margin_left?: string;
  margin_top?: string;

  // Layout properties
  text_align?: string;
  min_width?: string;
  min_height?: string;

  // Other properties
  opacity?: number;
  indent?: string;
}

/**
 * Complete styles configuration loaded from form_styles.json
 */
export interface StylesConfig {
  meta?: {
    version?: string;
    name?: string;
    description?: string;
  };
  tokens: StyleTokens;
  styles: Record<string, StyleClassDefinition>;
}

/**
 * Resolved style after inheritance resolution and token substitution
 */
export interface ResolvedStyle {
  color?: string;
  background_color?: string;
  border_color?: string;
  border_width?: string;
  border_radius?: string;
  font_family?: string;
  font_size?: string;
  font_weight?: string;
  line_height?: string;
  letter_spacing?: string;
  padding?: string;
  padding_x?: string;
  padding_y?: string;
  margin?: string;
  margin_left?: string;
  margin_top?: string;
  text_align?: string;
  min_width?: string;
  min_height?: string;
  opacity?: number;
  indent?: string;
}

// =============================================================================
// NEW FIELD TYPE SYSTEM TYPES
// =============================================================================

/**
 * Base field types - built-in renderers available in the library
 */
export type BaseFieldType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "option"
  | "email"
  | "tel"
  | "currency"
  | "percentage"
  | "textarea"
  | "table"
  | "computed"
  | "static_text"
  | "summary_row";

/**
 * Field type - includes base types and any custom types defined in config
 * Custom types (like "tfn", "abn") are resolved to base types at runtime
 */
export type FieldType = BaseFieldType | string;

/**
 * Field type definition for configurable field types
 * Loaded from form_field_types.json
 */
export interface FieldTypeDefinition {
  /** Which built-in renderer to use */
  base_type: BaseFieldType;

  /** Inherit from another field type definition */
  extends?: string;

  /** Human-readable label for this field type */
  label?: string;

  // Validation
  /** Regex pattern for validation (validates raw/unmasked value) */
  pattern?: string;
  /** Error message when validation fails */
  validation_message?: string;

  // Masking/formatting
  /** Display format with X placeholders for digits */
  display_format?: string;
  /** Input mask with # for digit placeholders */
  input_mask?: string;
  /** Default placeholder text */
  placeholder?: string;
  /** Maximum input length (including formatting chars) */
  max_length?: number;
  /** Number of digits (without formatting) */
  digit_count?: number;

  // Input behavior
  /** HTML inputmode attribute for mobile keyboards */
  input_mode?: "text" | "numeric" | "tel" | "email" | "url" | "decimal";

  // Display
  /** Prefix to display before value */
  prefix?: string;
  /** Suffix to display after value */
  suffix?: string;
  /** Style class to apply from form_styles.json */
  style_class?: string;

  // Numeric constraints
  /** Default decimal places for numeric types */
  decimal_places?: number;
  /** Minimum value for numeric types */
  min?: number;
  /** Maximum value for numeric types */
  max?: number;
}

/**
 * Field types configuration loaded from form_field_types.json
 */
export interface FieldTypesConfig {
  meta?: {
    version?: string;
    description?: string;
  };
  field_types: Record<string, FieldTypeDefinition>;
}

// =============================================================================
// EXISTING FIELD AND FORM TYPES
// =============================================================================

/**
 * Option item for select/option fields
 */
export interface OptionItem {
  label: string;
  value: string;
}

/**
 * Table column definition for table/array fields
 */
export interface TableColumn {
  id: string;
  label: string;
  field_info: Omit<FieldInfo, "table_columns" | "table_min_rows" | "table_max_rows">;
  width?: string;
  /** If true, display a subtotal for this column at the bottom of the table */
  subtotal?: boolean;
  /** Default value for this column when adding new rows */
  default_value?: unknown;
}

/**
 * Field information configuration
 */
export interface FieldInfo {
  field_type: FieldType;
  required?: boolean;
  options?: OptionItem[];
  min?: number;
  max?: number;
  decimal_places?: number;
  currency_symbol?: string;
  min_length?: number;
  max_length?: number;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  computed_formula?: string;
  computed_dependencies?: string[];
  table_columns?: TableColumn[];
  table_min_rows?: number;
  table_max_rows?: number;
  table_title?: string;  // Title displayed above the table (e.g., "WORKSHEET")
  /** Default value for this field when no value is provided */
  default_value?: unknown;

  // Tax form specific properties
  badge?: string;
  item_code?: string;
  display_variant?: "label_only" | "value_only" | "inline";
  width?: string;
  text_align?: "left" | "center" | "right";
  static_content?: string;
  summary_fields?: string[];
  summary_note?: string;  // Note displayed next to summary row label (e.g., "Items D11 to D15")
  is_worksheet?: boolean;  // Indented worksheet table styling
  formula_label?: string;  // Plain text formula annotation displayed in badge column (e.g., "P less (Q + F + U)")
}

/**
 * Label position for field layout
 * - "stacked": Label above the input field (default)
 * - "inline": Label on the same line as the input field
 */
export type LabelPosition = "stacked" | "inline";

/**
 * Individual field definition
 */
export interface FormField {
  id: string;
  label: string;
  field_info: FieldInfo;
  value?: unknown;
  /** Default value used when no value is provided (used for initial form state) */
  default_value?: unknown;
  /** Array of document links for this field */
  doc_links?: DocLink[];
  label_position?: LabelPosition;
  style_variant?: StyleVariant;
  help_tooltip?: HelpTooltip;
  /** Field-level override for value column width (e.g., "150px") */
  value_width?: string;
  /** Row variant for special row styling (e.g., highlight row) */
  row_variant?: "highlight" | "normal";
  /** Optional reference value displayed below the field (e.g., prior-year value, benchmark) */
  reference_value?: string;
  /**
   * Paired field for dual-column layouts (e.g., Capital gains / Capital losses)
   * When present, renders both fields on the same row with their own badge+value
   */
  paired_field?: Omit<FormField, "label" | "paired_field" | "label_position">;
}

/**
 * Column header definition for multi-column layouts
 */
export interface ColumnHeader {
  label: string;
  width?: string;
}

/**
 * Field group with orientation
 */
export interface FieldGroup {
  orientation: "horizontal" | "vertical";
  fields: FormField[];
  /** Fixed width for badge column when badges should be aligned (e.g., "40px") */
  badge_column_width?: string;
  /** Fixed width for value column when values should be aligned (e.g., "80px") */
  value_column_width?: string;
  /**
   * Column headers for paired field layouts (e.g., ["Capital gains", "Capital losses"])
   * When present, displays column headers above the badge+value columns
   */
  column_headers?: ColumnHeader[];
}

/**
 * Sub-section within a section
 */
export interface SubSection {
  sub_section_id: string;
  sub_section_label: string;
  field_group: FieldGroup;
  item_code?: string;  // Boxed prefix like [1], [10]
  badge?: string;  // Letter badge like "J", "M" displayed in header
  style_variant?: StyleVariant;  // e.g., "header_h2"
}

/**
 * Top-level section
 */
export interface FormSection {
  section_name: string;
  sub_sections: SubSection[];
  sub_section_layout?: "vertical" | "horizontal";
  style_variant?: StyleVariant;  // e.g., "header_h1"
}

/**
 * Complete form schema (array of sections)
 */
export type FormSchema = FormSection[];

/**
 * Form values as a flat key-value map
 */
export type FormValues = Record<string, unknown>;

/**
 * Form mode
 */
export type FormMode = "edit" | "view";

/**
 * PDF panel position
 */
export type PdfPanelPosition = "right" | "left" | "bottom";

/**
 * Callback event for doc_links click
 */
export interface DocLinkClickEvent {
  field_id: string;
  /** All doc_links for this field */
  doc_links: DocLink[];
}

/**
 * Form validation errors
 */
export type FormErrors = Record<string, string>;

// =============================================================================
// FORM CONFIG
// =============================================================================

/**
 * Config options loaded from INI file and JSON configs
 */
export interface FormConfig {
  // Paths to config files
  styles_path?: string;
  field_types_path?: string;

  // Doc link settings
  doc_link_icon_size: string;
  doc_link_icon_style: "solid" | "outline";
  doc_link_column_width: string;

  // PDF Panel settings
  pdf_panel_width: string;
  pdf_panel_min_width: string;
  pdf_panel_max_width: string;

  // Formatting settings
  default_currency_symbol: string;
  date_format: string;
  default_decimal_places: number;
  percentage_suffix: string;

  // Feature flags
  enable_pdf_panel?: boolean;
  collapsible_sections?: boolean;
  validate_on_blur?: boolean;
  validate_on_change?: boolean;

  // File upload settings
  file_upload: FileUploadConfig;

  // File manager settings
  file_manager: FileManagerConfig;

  // New style system (loaded from form_styles.json)
  styles_config: StylesConfig;

  // New field type system (loaded from form_field_types.json)
  field_types_config: FieldTypesConfig;

  // Legacy: Hierarchical styles (kept for backward compatibility)
  // @deprecated Use styles_config instead
  styles: HierarchicalStyleConfig;

  // Legacy style properties (kept for backward compatibility)
  // @deprecated Use styles_config instead
  label_color: string;
  label_color_required: string;
  field_border_color: string;
  field_border_color_focus: string;
  field_background_color: string;
  field_background_color_disabled: string;
  section_header_color: string;
  section_header_background: string;
  sub_section_header_color: string;
  error_color: string;
  doc_link_icon_color: string;
  doc_link_hover_color: string;
  view_mode_background: string;
  view_mode_border: string;
  label_font_family: string;
  label_font_size: string;
  label_font_weight: string;
  field_font_family: string;
  field_font_size: string;
  section_header_font_size: string;
  sub_section_header_font_size: string;
  section_spacing: string;
  sub_section_spacing: string;
  field_spacing: string;
  field_gap_horizontal: string;
  field_gap_vertical: string;
  label_field_gap: string;
  item_code_border_color: string;
  item_code_background: string;
  item_code_font_size: string;
  worksheet_indent: string;
  worksheet_label_font_weight: string;
  highlight_row_background: string;
  badge_background: string;
  badge_text_color: string;
}

/**
 * Partial config for overrides
 */
export type PartialFormConfig = Partial<FormConfig>;

/**
 * Default styles configuration
 */
export const DEFAULT_STYLES_CONFIG: StylesConfig = {
  meta: {
    version: "1.0.0",
    name: "Default Theme",
  },
  tokens: {
    colors: {
      primary: "#1e3a5f",
      primary_foreground: "#ffffff",
      secondary: "#3b82f6",
      secondary_hover: "#1d4ed8",
      text_primary: "#111827",
      text_secondary: "#374151",
      text_muted: "#6b7280",
      text_disabled: "#9ca3af",
      background: "#ffffff",
      background_muted: "#f9fafb",
      background_subtle: "#f3f4f6",
      border: "#d1d5db",
      border_focus: "#3b82f6",
      error: "#dc2626",
      highlight: "#e0f2fe",
      transparent: "transparent",
    },
    fonts: {
      sans: "system-ui, -apple-system, sans-serif",
      mono: "ui-monospace, SFMono-Regular, monospace",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "24px",
      "2xl": "32px",
    },
  },
  styles: {
    default: {
      font_family: "{fonts.sans}",
      font_size: "14px",
      font_weight: "400",
      color: "{colors.text_primary}",
      line_height: "1.5",
    },
    label: {
      extends: "default",
      font_weight: "500",
      color: "{colors.text_secondary}",
    },
    label_required: {
      extends: "label",
      color: "{colors.error}",
    },
    field: {
      extends: "default",
      background_color: "{colors.background}",
      border_color: "{colors.border}",
      border_width: "1px",
      border_radius: "6px",
      padding_x: "{spacing.md}",
      padding_y: "{spacing.sm}",
    },
    field_focus: {
      extends: "field",
      border_color: "{colors.border_focus}",
    },
    field_disabled: {
      extends: "field",
      background_color: "{colors.background_subtle}",
      color: "{colors.text_muted}",
    },
    field_view: {
      extends: "field",
      background_color: "{colors.background_muted}",
      border_color: "{colors.transparent}",
    },
    field_mono: {
      extends: "field",
      font_family: "{fonts.mono}",
      letter_spacing: "0.05em",
    },
    error_message: {
      font_size: "12px",
      color: "{colors.error}",
      margin_top: "{spacing.xs}",
    },
    badge: {
      font_size: "12px",
      font_weight: "700",
      color: "{colors.primary_foreground}",
      background_color: "{colors.text_primary}",
      padding_x: "{spacing.sm}",
      padding_y: "2px",
      border_radius: "4px",
      min_width: "24px",
      text_align: "center",
    },
    item_code: {
      font_family: "{fonts.mono}",
      font_size: "12px",
      color: "{colors.text_primary}",
      background_color: "{colors.background}",
      border_color: "{colors.text_primary}",
      border_width: "1px",
      padding_x: "6px",
      padding_y: "2px",
    },
    highlight_row: {
      background_color: "{colors.highlight}",
      padding_x: "{spacing.md}",
      padding_y: "{spacing.sm}",
      border_radius: "4px",
    },
    doc_link: {
      color: "{colors.secondary}",
      min_width: "32px",
    },
    worksheet: {
      margin_left: "{spacing.xl}",
      font_weight: "600",
    },
    header_h1: {
      font_size: "20px",
      font_weight: "700",
      color: "{colors.primary_foreground}",
      background_color: "{colors.primary}",
      indent: "0px",
    },
    header_h2: {
      font_size: "18px",
      font_weight: "600",
      color: "{colors.text_primary}",
      background_color: "{colors.background_subtle}",
      indent: "0px",
    },
    header_h3: {
      font_size: "16px",
      font_weight: "600",
      color: "{colors.text_secondary}",
      background_color: "{colors.transparent}",
      indent: "0px",
    },
    header_h4: {
      font_size: "14px",
      font_weight: "600",
      color: "{colors.text_secondary}",
      background_color: "{colors.transparent}",
      indent: "{spacing.sm}",
    },
    header_h5: {
      font_size: "14px",
      font_weight: "500",
      color: "{colors.text_muted}",
      background_color: "{colors.transparent}",
      indent: "{spacing.lg}",
    },
    header_h6: {
      font_size: "12px",
      font_weight: "500",
      color: "{colors.text_disabled}",
      background_color: "{colors.transparent}",
      indent: "{spacing.xl}",
    },
    total_h1: {
      font_size: "18px",
      font_weight: "700",
      color: "{colors.text_primary}",
      background_color: "{colors.highlight}",
      indent: "0px",
    },
    total_h2: {
      font_size: "16px",
      font_weight: "600",
      color: "{colors.text_primary}",
      background_color: "{colors.background_subtle}",
      indent: "0px",
    },
    total_h3: {
      font_size: "14px",
      font_weight: "600",
      color: "{colors.text_secondary}",
      background_color: "{colors.background_muted}",
      indent: "0px",
    },
    total_h4: {
      font_size: "14px",
      font_weight: "500",
      color: "{colors.text_secondary}",
      background_color: "{colors.transparent}",
      indent: "{spacing.sm}",
    },
    total_h5: {
      font_size: "14px",
      font_weight: "500",
      color: "{colors.text_muted}",
      background_color: "{colors.transparent}",
      indent: "{spacing.lg}",
    },
    total_h6: {
      font_size: "12px",
      font_weight: "500",
      color: "{colors.text_disabled}",
      background_color: "{colors.transparent}",
      indent: "{spacing.xl}",
    },
  },
};

/**
 * Default field types configuration
 */
export const DEFAULT_FIELD_TYPES_CONFIG: FieldTypesConfig = {
  meta: {
    version: "1.0.0",
  },
  field_types: {
    tfn: {
      base_type: "text",
      label: "Tax File Number",
      pattern: "^\\d{9}$",
      display_format: "XXX XXX XXX",
      input_mask: "### ### ###",
      placeholder: "XXX XXX XXX",
      max_length: 11,
      digit_count: 9,
      validation_message: "Tax File Number must be 9 digits",
      input_mode: "numeric",
      style_class: "field_mono",
    },
    abn: {
      base_type: "text",
      label: "Australian Business Number",
      pattern: "^\\d{11}$",
      display_format: "XX XXX XXX XXX",
      input_mask: "## ### ### ###",
      placeholder: "XX XXX XXX XXX",
      max_length: 14,
      digit_count: 11,
      validation_message: "Australian Business Number must be 11 digits",
      input_mode: "numeric",
      style_class: "field_mono",
    },
  },
};

/**
 * Default form configuration values
 */
export const DEFAULT_FORM_CONFIG: FormConfig = {
  // Paths
  styles_path: "/config/form_styles.json",
  field_types_path: "/config/form_field_types.json",

  // Doc link
  doc_link_icon_size: "20px",
  doc_link_icon_style: "solid",
  doc_link_column_width: "32px",

  // PDF Panel
  pdf_panel_width: "50vw",
  pdf_panel_min_width: "400px",
  pdf_panel_max_width: "80vw",

  // Formatting
  default_currency_symbol: "$",
  date_format: "MMM d, yyyy",
  default_decimal_places: 2,
  percentage_suffix: "%",

  // Feature flags
  enable_pdf_panel: true,
  collapsible_sections: false,
  validate_on_blur: true,
  validate_on_change: false,

  // File upload settings
  file_upload: {
    enabled: false, // Opt-in - must be explicitly enabled
    allowed_types: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
    max_file_size: 10 * 1024 * 1024, // 10MB
    max_files_per_field: 5,
    default_directory: "/uploads",
    upload_icon_color: "#6b7280", // Gray
    upload_hover_color: "#3b82f6", // Blue
  },

  // File manager settings
  file_manager: {
    display_mode: "sidebar",
    icon_size: "20px",
    icon_color: "#6b7280", // Gray (no files)
    icon_color_hover: "#3b82f6", // Blue
    icon_color_with_files: "#3b82f6", // Blue
    badge_background: "#3b82f6", // Blue
    badge_text_color: "#ffffff", // White
    dialog_width: "700px",
    dialog_max_height: "80vh",
    button_column_width: "32px",
  },

  // New config systems
  styles_config: DEFAULT_STYLES_CONFIG,
  field_types_config: DEFAULT_FIELD_TYPES_CONFIG,

  // Legacy: Colors (deprecated - use styles_config)
  label_color: "#374151",
  label_color_required: "#dc2626",
  field_border_color: "#d1d5db",
  field_border_color_focus: "#3b82f6",
  field_background_color: "#ffffff",
  field_background_color_disabled: "#f3f4f6",
  section_header_color: "#ffffff",
  section_header_background: "#1e3a5f",
  sub_section_header_color: "#374151",
  error_color: "#dc2626",
  doc_link_icon_color: "#3b82f6",
  doc_link_hover_color: "#1d4ed8",
  view_mode_background: "#f9fafb",
  view_mode_border: "transparent",

  // Legacy: Fonts (deprecated - use styles_config)
  label_font_family: "system-ui, -apple-system, sans-serif",
  label_font_size: "14px",
  label_font_weight: "500",
  field_font_family: "system-ui, -apple-system, sans-serif",
  field_font_size: "14px",
  section_header_font_size: "18px",
  sub_section_header_font_size: "16px",

  // Legacy: Spacing (deprecated - use styles_config)
  section_spacing: "32px",
  sub_section_spacing: "24px",
  field_spacing: "16px",
  field_gap_horizontal: "16px",
  field_gap_vertical: "12px",
  label_field_gap: "6px",

  // Legacy: Item code styling (deprecated - use styles_config)
  item_code_border_color: "#000000",
  item_code_background: "#ffffff",
  item_code_font_size: "12px",

  // Legacy: Worksheet styling (deprecated - use styles_config)
  worksheet_indent: "24px",
  worksheet_label_font_weight: "600",

  // Legacy: Highlight row styling (deprecated - use styles_config)
  highlight_row_background: "#e0f2fe",

  // Legacy: Badge styling (deprecated - use styles_config)
  badge_background: "#000000",
  badge_text_color: "#ffffff",

  // Legacy: Hierarchical styles (deprecated - use styles_config)
  styles: {
    header_h1: {
      font_size: "20px",
      font_weight: "700",
      font_color: "#ffffff",
      background_color: "#1e3a5f",
      indent: "0px",
    },
    header_h2: {
      font_size: "18px",
      font_weight: "600",
      font_color: "#111827",
      background_color: "#f3f4f6",
      indent: "0px",
    },
    header_h3: {
      font_size: "16px",
      font_weight: "600",
      font_color: "#374151",
      background_color: "transparent",
      indent: "0px",
    },
    header_h4: {
      font_size: "14px",
      font_weight: "600",
      font_color: "#374151",
      background_color: "transparent",
      indent: "8px",
    },
    header_h5: {
      font_size: "14px",
      font_weight: "500",
      font_color: "#6b7280",
      background_color: "transparent",
      indent: "16px",
    },
    header_h6: {
      font_size: "12px",
      font_weight: "500",
      font_color: "#9ca3af",
      background_color: "transparent",
      indent: "24px",
    },
    total_h1: {
      font_size: "18px",
      font_weight: "700",
      font_color: "#111827",
      background_color: "#e0f2fe",
      indent: "0px",
    },
    total_h2: {
      font_size: "16px",
      font_weight: "600",
      font_color: "#111827",
      background_color: "#f3f4f6",
      indent: "0px",
    },
    total_h3: {
      font_size: "14px",
      font_weight: "600",
      font_color: "#374151",
      background_color: "#f9fafb",
      indent: "0px",
    },
    total_h4: {
      font_size: "14px",
      font_weight: "500",
      font_color: "#374151",
      background_color: "transparent",
      indent: "8px",
    },
    total_h5: {
      font_size: "14px",
      font_weight: "500",
      font_color: "#6b7280",
      background_color: "transparent",
      indent: "16px",
    },
    total_h6: {
      font_size: "12px",
      font_weight: "500",
      font_color: "#9ca3af",
      background_color: "transparent",
      indent: "24px",
    },
  },
};
