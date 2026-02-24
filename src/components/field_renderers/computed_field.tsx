"use client";

import * as React from "react";
import { Label } from "../ui/label";
import { FileManagerButton } from "../file_manager_viewer/file_manager_button";
import { cn, format_currency, format_percentage, normalize_doc_links } from "../../lib/utils";
import type { FieldRendererProps } from "../../lib/field_registry";
import { ReferenceValue } from "./shared/reference_value";

/**
 * Computed Field Renderer
 * Displays a read-only computed value based on a formula
 */
export function ComputedField({
  field,
  mode,
  value,
  error,
  config,
  on_doc_link_click,
  field_uploads,
  on_upload_click,
  upload_enabled,
}: FieldRendererProps) {
  const is_view = mode === "view";
  const is_required = field.field_info.required;

  // Format the computed value for display
  const format_value = (val: unknown): string => {
    if (val === undefined || val === null || val === "") return "-";

    const num = typeof val === "number" ? val : parseFloat(String(val));
    if (isNaN(num)) return String(val);

    // Check if we should format as currency or percentage
    const formula = field.field_info.computed_formula || "";
    const decimal_places = field.field_info.decimal_places ?? config.default_decimal_places;

    if (field.field_info.currency_symbol) {
      return format_currency(
        num,
        field.field_info.currency_symbol,
        decimal_places
      );
    }

    if (formula.includes("%") || field.label.toLowerCase().includes("percent")) {
      return format_percentage(num, decimal_places, config.percentage_suffix);
    }

    return num.toFixed(decimal_places);
  };

  // Render the file manager button (shows unified button with badge for total file count)
  const render_file_button = () => {
    // Calculate total file count from doc_links + uploads
    const doc_links = normalize_doc_links(field.doc_links);
    const uploads = field_uploads || [];
    const total_count = doc_links.length + uploads.length;
    const has_files = total_count > 0;

    // Determine click handler - use doc_link_click if available, otherwise upload_click
    const handle_click = on_doc_link_click || (upload_enabled ? on_upload_click : undefined);

    // In view mode, only show if there are files
    if (is_view && !has_files) {
      return null;
    }

    // Hide button if no handler and no files
    if (!handle_click && !has_files) {
      return null;
    }

    return (
      <FileManagerButton
        file_count={total_count}
        has_files={has_files}
        on_click={handle_click || (() => {})}
        config={config}
        disabled={!handle_click}
      />
    );
  };

  return (
    <div className="cls_field_container cls_computed_field w-full">
      <div
        className="cls_label_row flex items-center gap-2"
        style={{ marginBottom: config.label_field_gap }}
      >
        <Label
          className={cn("cls_field_label", is_required && "cls_required")}
          style={{
            color: config.label_color,
            fontFamily: config.label_font_family,
            fontSize: config.label_font_size,
            fontWeight: config.label_font_weight,
          }}
        >
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
        {render_file_button()}
      </div>

      <div
        className="cls_field_value_display py-2 px-3 rounded-md min-h-[40px] flex items-center font-medium"
        style={{
          background: config.view_mode_background,
          border: `1px solid ${config.view_mode_border}`,
          fontFamily: config.field_font_family,
          fontSize: config.field_font_size,
        }}
      >
        {format_value(value)}
      </div>

      {field.field_info.computed_formula && (
        <p
          className="cls_formula_hint mt-1 text-xs text-muted-foreground"
          style={{ fontFamily: config.field_font_family }}
        >
          Calculated: {field.field_info.computed_formula}
        </p>
      )}

      {error && (
        <p
          className="cls_error_message mt-1 text-sm"
          style={{ color: config.error_color }}
        >
          {error}
        </p>
      )}
      {field.reference_value && <ReferenceValue value={field.reference_value} />}
    </div>
  );
}
