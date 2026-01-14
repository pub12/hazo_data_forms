"use client";

import type {
  FormField,
  FormMode,
  FormConfig,
  DocLink,
  FieldTypeDefinition,
  BaseFieldType,
  FieldTypesConfig,
  FieldUploads,
} from "./types";

/**
 * Props passed to field renderer components
 */
export interface FieldRendererProps {
  field: FormField;
  mode: FormMode;
  value: unknown;
  error?: string;
  config: FormConfig;
  on_change: (value: unknown) => void;
  on_blur?: () => void;
  on_doc_link_click?: () => void;
  /** Callback for row-level doc_links in table fields */
  on_row_doc_link_click?: (field_id: string, doc_link: DocLink) => void;
  /** Fixed width for badge column when badges should be aligned */
  badge_column_width?: string;
  /** Fixed width for value column when values should be aligned */
  value_column_width?: string;
  /** Value for the paired field (when field has paired_field defined) */
  paired_value?: unknown;
  /** Change handler for the paired field */
  paired_on_change?: (value: unknown) => void;
  /** Blur handler for the paired field */
  paired_on_blur?: () => void;
  /** Error for the paired field */
  paired_error?: string;
  /** Uploaded files for this field */
  field_uploads?: FieldUploads;
  /** Callback when upload icon is clicked */
  on_upload_click?: () => void;
  /** Whether upload feature is enabled for this field */
  upload_enabled?: boolean;
}

/**
 * Type definition for field renderer components
 */
export type FieldRenderer = React.ComponentType<FieldRendererProps>;

/**
 * Registry for field renderers
 */
const field_renderers: Map<string, FieldRenderer> = new Map();

/**
 * Register a custom field renderer
 */
export function register_field_renderer(
  type: string,
  renderer: FieldRenderer
): void {
  field_renderers.set(type, renderer);
}

/**
 * Get field renderer by type
 */
export function get_field_renderer(type: string): FieldRenderer | undefined {
  return field_renderers.get(type);
}

/**
 * Check if a field renderer is registered
 */
export function has_field_renderer(type: string): boolean {
  return field_renderers.has(type);
}

/**
 * Get all registered field types
 */
export function get_registered_field_types(): string[] {
  return Array.from(field_renderers.keys());
}

/**
 * Unregister a field renderer
 */
export function unregister_field_renderer(type: string): boolean {
  return field_renderers.delete(type);
}

// =============================================================================
// FIELD TYPE RESOLUTION
// =============================================================================

/**
 * Resolve a field type to its definition from the config
 * Returns the FieldTypeDefinition if found in config, or null if it's a base type
 * or not found
 */
export function resolve_field_type(
  field_type: string,
  config: FormConfig
): FieldTypeDefinition | null {
  // Check if it's a configured custom field type
  const field_types_config = config.field_types_config;
  if (field_types_config?.field_types?.[field_type]) {
    return resolve_field_type_inheritance(
      field_types_config.field_types[field_type],
      field_types_config
    );
  }

  return null;
}

/**
 * Resolve inheritance chain for field type definitions
 */
function resolve_field_type_inheritance(
  type_def: FieldTypeDefinition,
  field_types_config: FieldTypesConfig
): FieldTypeDefinition {
  if (!type_def.extends) {
    return type_def;
  }

  const parent = field_types_config.field_types?.[type_def.extends];
  if (!parent) {
    return type_def;
  }

  const resolved_parent = resolve_field_type_inheritance(parent, field_types_config);

  return {
    ...resolved_parent,
    ...type_def,
    // Ensure base_type is always from the current definition or parent
    base_type: type_def.base_type || resolved_parent.base_type,
  };
}

/**
 * Check if a field type requires the MaskedField renderer
 * (i.e., it has a display_format defined)
 */
export function is_masked_field_type(
  field_type: string,
  config: FormConfig
): boolean {
  const type_def = resolve_field_type(field_type, config);
  return type_def !== null && !!type_def.display_format;
}

/**
 * Get the base renderer type for a field type
 * Custom types resolve to their base_type, built-in types return as-is
 */
export function get_base_field_type(
  field_type: string,
  config: FormConfig
): BaseFieldType | string {
  const type_def = resolve_field_type(field_type, config);
  if (type_def) {
    return type_def.base_type;
  }
  return field_type;
}

/**
 * Check if a field type is a built-in base type
 */
export function is_base_field_type(field_type: string): field_type is BaseFieldType {
  const base_types: BaseFieldType[] = [
    "text",
    "number",
    "date",
    "boolean",
    "option",
    "email",
    "tel",
    "currency",
    "percentage",
    "textarea",
    "table",
    "computed",
    "static_text",
    "summary_row",
  ];
  return base_types.includes(field_type as BaseFieldType);
}
