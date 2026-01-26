"use client";

import * as React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FileManagerButton } from "../file_manager_viewer/file_manager_button";
import { cn, format_date, format_currency, normalize_doc_links } from "../../lib/utils";
import type { FieldRendererProps } from "../../lib/field_registry";

/**
 * Date Field Renderer
 * Handles date input with configurable display format
 * Supports paired fields for dual-column layouts
 */
export function DateField({
  field,
  mode,
  value,
  error,
  config,
  on_change,
  on_blur,
  on_doc_link_click,
  badge_column_width,
  value_column_width,
  paired_value,
  paired_on_change,
  paired_on_blur,
  paired_error,
  field_uploads,
  on_upload_click,
  upload_enabled,
}: FieldRendererProps) {
  const is_view = mode === "view";
  const is_required = field.field_info.required;
  const has_doc_links = !!field.doc_links?.length;
  const is_inline = field.label_position === "inline";

  // Check if we're using column-aligned badge layout
  const use_aligned_badge = is_inline && badge_column_width;

  // Check if we have a paired field
  const has_paired_field = !!field.paired_field;
  const paired_field_info = field.paired_field?.field_info;

  // Convert value to YYYY-MM-DD format for input
  const get_input_value = (): string => {
    if (!value) return "";
    if (typeof value === "string") {
      // If already in YYYY-MM-DD format, use as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
      // Try to parse and convert
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }
    if (value instanceof Date) {
      return value.toISOString().split("T")[0];
    }
    return "";
  };

  // Format value for display
  const get_display_value = (): string => {
    if (!value) return "-";
    try {
      return format_date(value as string | Date, config.date_format);
    } catch {
      return String(value);
    }
  };

  // Render the badge component separately for aligned layout
  const render_badge = () => {
    if (!field.field_info.badge) return null;
    return (
      <span
        className="cls_field_badge inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded"
        style={{
          backgroundColor: "#111827",
          color: "#ffffff",
          minWidth: "24px",
        }}
      >
        {field.field_info.badge}
      </span>
    );
  };

  // Render the label component
  const render_label = () => (
    <div className="cls_label_row flex items-center gap-2">
      {field.field_info.item_code && (
        <span
          className="cls_item_code_box inline-flex items-center justify-center px-1.5 py-0.5 border text-xs font-mono"
          style={{
            borderColor: config.item_code_border_color,
            backgroundColor: config.item_code_background,
            fontSize: config.item_code_font_size,
          }}
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
      {/* Only render badge inline with label if NOT using aligned layout */}
      {!use_aligned_badge && field.field_info.badge && (
        <span
          className="cls_field_badge inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded"
          style={{
            backgroundColor: "#111827",
            color: "#ffffff",
            minWidth: "24px",
          }}
        >
          {field.field_info.badge}
        </span>
      )}
    </div>
  );

  // Render the file manager column (shows unified button with badge for total file count)
  const render_file_column = () => {
    // Calculate total file count from doc_links + uploads
    const doc_links = normalize_doc_links(field.doc_links);
    const uploads = field_uploads || [];
    const total_count = doc_links.length + uploads.length;
    const has_files = total_count > 0;

    // Determine click handler - use doc_link_click if available, otherwise upload_click
    const handle_click = on_doc_link_click || (upload_enabled ? on_upload_click : undefined);

    // In view mode, only show if there are files
    if (is_view && !has_files) {
      return (
        <div
          className="cls_file_column flex-shrink-0"
          style={{ width: config.file_manager.button_column_width }}
        />
      );
    }

    // Hide button if no handler and no files
    if (!handle_click && !has_files) {
      return (
        <div
          className="cls_file_column flex-shrink-0"
          style={{ width: config.file_manager.button_column_width }}
        />
      );
    }

    return (
      <div
        className="cls_file_column flex-shrink-0 flex items-center justify-center"
        style={{ width: config.file_manager.button_column_width }}
      >
        <FileManagerButton
          file_count={total_count}
          has_files={has_files}
          on_click={handle_click || (() => {})}
          config={config}
          disabled={!handle_click}
        />
      </div>
    );
  };

  // Render the input/value component
  const render_field = () => (
    <>
      {is_view ? (
        <div
          className={cn(
            "cls_field_value_display py-2 px-3 rounded-md min-h-[40px] flex items-center",
            is_inline && "justify-end"
          )}
          style={{
            background: config.view_mode_background,
            border: `1px solid ${config.view_mode_border}`,
            fontFamily: config.field_font_family,
            fontSize: config.field_font_size,
          }}
        >
          {get_display_value()}
        </div>
      ) : (
        <input
          id={field.id}
          type="date"
          data-hazo-date-field="true"
          value={get_input_value()}
          onChange={(e) => on_change(e.target.value)}
          onBlur={on_blur}
          disabled={field.field_info.disabled}
          className={cn(
            "cls_date_input flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "cls_input_error border-red-500"
          )}
          style={{
            fontFamily: config.field_font_family,
            fontSize: config.field_font_size,
            borderColor: error ? config.error_color : undefined,
            backgroundColor: field.field_info.disabled
              ? config.field_background_color_disabled
              : config.field_background_color,
          } as React.CSSProperties}
        />
      )}
    </>
  );

  // Render paired field (typically currency for Date+Amount layouts)
  const render_paired_field = () => {
    if (!paired_field_info) return null;

    const paired_currency_symbol = paired_field_info.currency_symbol || config.default_currency_symbol;
    const paired_decimal_places = paired_field_info.decimal_places ?? config.default_decimal_places;

    // Format paired value for display
    const get_paired_display_value = (): string => {
      if (paired_value === undefined || paired_value === null || paired_value === "") return "-";
      const num = typeof paired_value === "number" ? paired_value : parseFloat(String(paired_value));
      if (isNaN(num)) return "-";
      return format_currency(num, paired_currency_symbol, paired_decimal_places);
    };

    // Handle paired input change
    const handle_paired_change = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!paired_on_change) return;
      const input = e.target.value;
      const cleaned = input.replace(new RegExp(`[${paired_currency_symbol},\\s]`, "g"), "");
      if (cleaned === "" || cleaned === "-") {
        paired_on_change("");
        return;
      }
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        paired_on_change(num);
      }
    };

    // Get paired input value
    const get_paired_input_value = (): string => {
      if (paired_value === undefined || paired_value === null || paired_value === "") return "";
      return String(paired_value);
    };

    if (is_view) {
      return (
        <div
          className={cn(
            "cls_field_value_display py-2 px-3 rounded-md min-h-[40px] flex items-center justify-end"
          )}
          style={{
            background: config.view_mode_background,
            border: `1px solid ${config.view_mode_border}`,
            fontFamily: config.field_font_family,
            fontSize: config.field_font_size,
          }}
        >
          {get_paired_display_value()}
        </div>
      );
    }

    // Render based on paired field type
    if (paired_field_info.field_type === "currency") {
      return (
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            style={{ fontFamily: config.field_font_family }}
          >
            {paired_currency_symbol}
          </span>
          <Input
            id={field.paired_field?.id}
            type="number"
            value={get_paired_input_value()}
            onChange={handle_paired_change}
            onBlur={paired_on_blur}
            placeholder={paired_field_info.placeholder || "0.00"}
            disabled={paired_field_info.disabled}
            min={paired_field_info.min}
            max={paired_field_info.max}
            step={Math.pow(10, -paired_decimal_places)}
            className={cn(
              "cls_currency_input pl-7 text-right",
              paired_error && "cls_input_error border-red-500"
            )}
            style={{
              fontFamily: config.field_font_family,
              fontSize: config.field_font_size,
              borderColor: paired_error ? config.error_color : undefined,
              backgroundColor: paired_field_info.disabled
                ? config.field_background_color_disabled
                : config.field_background_color,
            }}
          />
        </div>
      );
    }

    // Default: render as text input
    return (
      <Input
        id={field.paired_field?.id}
        type="text"
        value={paired_value as string || ""}
        onChange={(e) => paired_on_change?.(e.target.value)}
        onBlur={paired_on_blur}
        disabled={paired_field_info.disabled}
        className={cn(paired_error && "cls_input_error border-red-500")}
        style={{
          fontFamily: config.field_font_family,
          fontSize: config.field_font_size,
          borderColor: paired_error ? config.error_color : undefined,
          backgroundColor: paired_field_info.disabled
            ? config.field_background_color_disabled
            : config.field_background_color,
        }}
      />
    );
  };

  // Inline layout: label and field on same row
  if (is_inline) {
    // Determine value width (use field-level value_width, or provided value_column_width, or default)
    const effective_value_width = field.value_width || value_column_width || "150px";

    return (
      <div className={cn(
        "cls_field_container cls_date_field cls_inline_layout w-full",
        has_paired_field && "cls_paired_field_layout"
      )}>
        <div className="flex items-center gap-4">
          {/* Label section - takes remaining space */}
          <div className="flex-grow min-w-0">{render_label()}</div>
          {/* Badge column - fixed width when aligned */}
          {use_aligned_badge && (
            <div
              className="cls_badge_column flex-shrink-0 flex items-center justify-center"
              style={{ width: badge_column_width }}
            >
              {render_badge()}
            </div>
          )}
          {/* Value column - fixed width */}
          <div
            className="flex-shrink-0"
            style={{ width: effective_value_width }}
          >
            {render_field()}
          </div>

          {/* Paired field: Value (when present) */}
          {has_paired_field && (
            <div
              className="flex-shrink-0"
              style={{ width: effective_value_width }}
            >
              {render_paired_field()}
            </div>
          )}

          {/* Doc link column - always reserves space for alignment */}
          {render_file_column()}
        </div>
        {(error || paired_error) && (
          <div className="flex justify-end gap-4 mt-1">
            {error && (
              <p
                className="cls_error_message text-sm"
                style={{ color: config.error_color, width: effective_value_width }}
              >
                {error}
              </p>
            )}
            {paired_error && (
              <p
                className="cls_error_message text-sm"
                style={{ color: config.error_color, width: effective_value_width }}
              >
                {paired_error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Stacked layout (default): label above field
  return (
    <div className="cls_field_container cls_date_field w-full">
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: config.label_field_gap }}
      >
        {render_label()}
        {render_file_column()}
      </div>
      {render_field()}
      {error && (
        <p
          className="cls_error_message mt-1 text-sm"
          style={{ color: config.error_color }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
