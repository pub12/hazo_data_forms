"use client";

import * as React from "react";
import { FaFileAlt, FaRegFileAlt } from "react-icons/fa";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";
import { resolve_style_class, to_inline_style } from "../../lib/style_resolver";
import type { FieldRendererProps } from "../../lib/field_registry";
import type { FieldTypeDefinition, ResolvedStyle } from "../../lib/types";

export interface MaskedFieldProps extends FieldRendererProps {
  /** Field type definition from form_field_types.json */
  type_definition: FieldTypeDefinition;
}

/**
 * Format a raw value according to display_format pattern
 * X or # in the format string are replaced with digits from the value
 */
export function format_masked_value(value: string, display_format: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";

  let result = "";
  let digit_index = 0;

  for (const char of display_format) {
    if (char === "X" || char === "#") {
      if (digit_index < digits.length) {
        result += digits[digit_index];
        digit_index++;
      }
    } else {
      // Add separator character only if we have more digits to show
      if (digit_index < digits.length) {
        result += char;
      }
    }
  }

  return result;
}

/**
 * Extract raw digits from a masked value
 */
export function extract_raw_value(value: string, digit_count: number): string {
  return value.replace(/\D/g, "").slice(0, digit_count);
}

/**
 * Masked Field Renderer
 * Generic renderer for pattern-based field types like TFN, ABN, phone numbers, etc.
 * Configuration is loaded from form_field_types.json
 */
export function MaskedField({
  field,
  mode,
  value,
  error,
  config,
  on_change,
  on_blur,
  on_doc_link_click,
  type_definition,
}: MaskedFieldProps) {
  const is_view = mode === "view";
  const is_required = field.field_info.required;
  const has_doc_links = !!field.doc_links?.length;
  const string_value = value !== undefined && value !== null ? String(value) : "";

  // Get formatting config from type definition
  const display_format = type_definition.display_format || "";
  const digit_count = type_definition.digit_count || 0;
  const max_length = type_definition.max_length || display_format.length || 20;
  const placeholder = type_definition.placeholder || field.field_info.placeholder || display_format;
  const input_mode = type_definition.input_mode || "text";

  // Format the value for display
  const formatted_value = display_format
    ? format_masked_value(string_value, display_format)
    : string_value;

  const handle_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw_value = extract_raw_value(e.target.value, digit_count || max_length);
    on_change(raw_value);
  };

  // Get styles from config - prefer new styles_config, fallback to legacy
  const styles_config = config.styles_config;
  const style_cache = React.useMemo(() => new Map<string, ResolvedStyle>(), []);

  // Get style class for this field type
  const field_style_class = type_definition.style_class || "field_mono";
  const field_style = styles_config
    ? resolve_style_class(field_style_class, styles_config, style_cache)
    : null;

  const badge_style = styles_config
    ? resolve_style_class("badge", styles_config, style_cache)
    : null;

  return (
    <div
      className="cls_field_container cls_masked_field w-full"
      style={{ width: field.field_info.width }}
    >
      <div
        className="cls_label_row flex items-center gap-2"
        style={{ marginBottom: config.label_field_gap }}
      >
        {field.field_info.item_code && (
          <span
            className="cls_item_code text-sm font-mono"
            style={{ color: config.label_color }}
          >
            {field.field_info.item_code}
          </span>
        )}
        <Label
          htmlFor={field.id}
          className={cn("cls_field_label", is_required && "cls_required")}
          style={{
            color: config.label_color,
            fontFamily: config.label_font_family,
            fontSize: config.label_font_size,
            fontWeight: config.label_font_weight,
          }}
        >
          {field.field_info.badge && (
            <span
              className="cls_field_badge inline-block px-2 py-0.5 mr-2 text-xs font-semibold rounded"
              style={badge_style ? to_inline_style(badge_style) : {
                backgroundColor: config.badge_background,
                color: config.badge_text_color,
              }}
            >
              {field.field_info.badge}
            </span>
          )}
          {field.label}
          {is_required && (
            <span
              className="cls_required_asterisk ml-1"
              style={{ color: config.label_color_required }}
            >
              *
            </span>
          )}
        </Label>
        {has_doc_links && on_doc_link_click && (() => {
          const icon_size = parseInt(config.doc_link_icon_size, 10) || 20;
          const IconComponent = config.doc_link_icon_style === "solid" ? FaFileAlt : FaRegFileAlt;
          return (
            <button
              type="button"
              onClick={on_doc_link_click}
              className="cls_doc_link_btn p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label="View document"
            >
              <IconComponent
                size={icon_size}
                color={config.doc_link_icon_color}
                className="transition-colors"
              />
            </button>
          );
        })()}
      </div>

      {is_view ? (
        <div
          className="cls_field_value_display py-2 px-3 rounded-md min-h-[40px] flex items-center"
          style={{
            background: config.view_mode_background,
            border: `1px solid ${config.view_mode_border}`,
            fontFamily: field_style?.font_family || "monospace",
            fontSize: config.field_font_size,
            letterSpacing: field_style?.letter_spacing || "0.05em",
          }}
        >
          {formatted_value || "-"}
        </div>
      ) : (
        <Input
          id={field.id}
          type="text"
          inputMode={input_mode}
          value={formatted_value}
          onChange={handle_change}
          onBlur={on_blur}
          placeholder={placeholder}
          disabled={field.field_info.disabled}
          maxLength={max_length}
          className={cn("cls_masked_input", error && "cls_input_error border-red-500")}
          style={{
            fontFamily: field_style?.font_family || "monospace",
            fontSize: config.field_font_size,
            letterSpacing: field_style?.letter_spacing || "0.05em",
            borderColor: error ? config.error_color : undefined,
            backgroundColor: field.field_info.disabled
              ? config.field_background_color_disabled
              : config.field_background_color,
          }}
        />
      )}

      {error && (
        <p
          className="cls_error_message mt-1 text-sm"
          style={{ color: config.error_color }}
        >
          {error || type_definition.validation_message}
        </p>
      )}
    </div>
  );
}
