"use client";

import * as React from "react";
import {
  get_field_renderer,
  register_field_renderer,
  resolve_field_type,
  is_masked_field_type,
  get_base_field_type,
  type FieldRendererProps,
} from "../../lib/field_registry";

// Import all field renderers
import { TextField } from "./text_field";
import { NumberField } from "./number_field";
import { DateField } from "./date_field";
import { BooleanField } from "./boolean_field";
import { OptionField } from "./option_field";
import { EmailField } from "./email_field";
import { TelField } from "./tel_field";
import { CurrencyField } from "./currency_field";
import { PercentageField } from "./percentage_field";
import { TextareaField } from "./textarea_field";
import { TableField } from "./table_field";
import { ComputedField } from "./computed_field";
import { StaticTextField } from "./static_text_field";
import { SummaryRowField } from "./summary_row_field";
import { MaskedField } from "./masked_field";

// Legacy imports - kept for backward compatibility
// @deprecated Use form_field_types.json to define these field types instead
import { AbnField } from "./abn_field";
import { TfnField } from "./tfn_field";

// Register all built-in field renderers (base types)
register_field_renderer("text", TextField);
register_field_renderer("number", NumberField);
register_field_renderer("date", DateField);
register_field_renderer("boolean", BooleanField);
register_field_renderer("option", OptionField);
register_field_renderer("email", EmailField);
register_field_renderer("tel", TelField);
register_field_renderer("currency", CurrencyField);
register_field_renderer("percentage", PercentageField);
register_field_renderer("textarea", TextareaField);
register_field_renderer("table", TableField);
register_field_renderer("computed", ComputedField);
register_field_renderer("static_text", StaticTextField);
register_field_renderer("summary_row", SummaryRowField);

// Register legacy field renderers (deprecated - use form_field_types.json instead)
// These are kept for backward compatibility but will be removed in future versions
register_field_renderer("abn", AbnField);
register_field_renderer("tfn", TfnField);

/**
 * Field Renderer Factory Component
 * Resolves the appropriate renderer based on field_type
 *
 * Resolution order:
 * 1. Check if field_type is defined in field_types_config (from form_field_types.json)
 *    - If it has display_format, use MaskedField
 *    - Otherwise, delegate to base_type renderer with enhanced props
 * 2. Fall back to directly registered renderers (built-in or legacy)
 */
export function FieldRenderer(props: FieldRendererProps) {
  const { field, config } = props;
  const field_type = field.field_info.field_type;

  // Check if this field type is defined in the config
  const type_definition = resolve_field_type(field_type, config);

  if (type_definition) {
    // Field type is defined in form_field_types.json
    if (type_definition.display_format) {
      // Use MaskedField for pattern-based field types
      return <MaskedField {...props} type_definition={type_definition} />;
    }

    // Delegate to base_type renderer with enhanced props
    const base_type = type_definition.base_type;
    const BaseRenderer = get_field_renderer(base_type);

    if (BaseRenderer) {
      // Merge type_definition properties into field_info
      const enhanced_props: FieldRendererProps = {
        ...props,
        field: {
          ...field,
          field_info: {
            ...field.field_info,
            placeholder: type_definition.placeholder || field.field_info.placeholder,
            decimal_places: type_definition.decimal_places ?? field.field_info.decimal_places,
            min: type_definition.min ?? field.field_info.min,
            max: type_definition.max ?? field.field_info.max,
            currency_symbol: type_definition.prefix || field.field_info.currency_symbol,
          },
        },
      };
      return <BaseRenderer {...enhanced_props} />;
    }
  }

  // Fall back to directly registered renderer
  const Renderer = get_field_renderer(field_type);

  if (!Renderer) {
    console.warn(`No renderer found for field type: ${field_type}`);
    return (
      <div className="cls_unsupported_field p-2 border border-red-200 bg-red-50 rounded text-sm text-red-600">
        Unsupported field type: {field_type}
      </div>
    );
  }

  return <Renderer {...props} />;
}

// Re-export individual field renderers for custom usage
export {
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
  // Legacy exports (deprecated)
  AbnField,
  TfnField,
};

// Re-export registry functions for extending
export {
  register_field_renderer,
  get_field_renderer,
  resolve_field_type,
  is_masked_field_type,
  get_base_field_type,
} from "../../lib/field_registry";
