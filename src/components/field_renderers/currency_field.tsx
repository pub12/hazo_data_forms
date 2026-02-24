"use client";

import * as React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FileManagerButton } from "../file_manager_viewer/file_manager_button";
import { cn, format_currency, normalize_doc_links } from "../../lib/utils";
import type { FieldRendererProps } from "../../lib/field_registry";
import { ReferenceValue } from "./shared/reference_value";
import type { StyleVariant } from "../../lib/types";
import { HelpTooltipIcon } from "./shared/help_tooltip_icon";

/**
 * Currency Field Renderer
 * Handles currency input with formatting
 * Supports style_variant for hierarchical styling (total_h1, total_h2, etc.)
 */
export function CurrencyField({
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
  const has_help_tooltip = !!field.help_tooltip;

  // Detect if this currency field should behave as computed (read-only with formula)
  const is_computed = Boolean(field.field_info.computed_formula);
  // When computed, always render as read-only (similar to view mode)
  const is_readonly = is_view || is_computed;

  const currency_symbol = field.field_info.currency_symbol || config.default_currency_symbol;
  const decimal_places = field.field_info.decimal_places ?? config.default_decimal_places;

  // Get style_variant from field (e.g., "total_h1", "total_h2")
  const style_variant: StyleVariant | undefined = field.style_variant;
  const has_style_variant = !!style_variant;
  const style_config = style_variant ? config.styles[style_variant] : null;

  // Format value for display
  const get_display_value = (): string => {
    if (value === undefined || value === null || value === "") return "-";
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (isNaN(num)) return "-";
    return format_currency(num, currency_symbol, decimal_places);
  };

  // Parse input value
  const handle_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove currency symbol and commas
    const cleaned = input.replace(new RegExp(`[${currency_symbol},\\s]`, "g"), "");
    if (cleaned === "" || cleaned === "-") {
      on_change("");
      return;
    }
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      on_change(num);
    }
  };

  // Get input value (raw number without formatting)
  const get_input_value = (): string => {
    if (value === undefined || value === null || value === "") return "";
    return String(value);
  };

  const is_inline = field.label_position === "inline";

  // Get variant-specific styles
  const get_label_font_weight = () => {
    if (style_config) return style_config.font_weight;
    return config.label_font_weight;
  };

  const get_label_font_size = () => {
    if (style_config) return style_config.font_size;
    return config.label_font_size;
  };

  const get_label_font_color = () => {
    // For total rows with background, use the style's font color
    if (style_config && style_config.background_color !== "transparent") {
      return style_config.font_color;
    }
    return config.label_color;
  };

  const get_field_font_weight = () => {
    if (style_config) return style_config.font_weight;
    return "normal";
  };

  const get_field_font_size = () => {
    if (style_config) return style_config.font_size;
    return config.field_font_size;
  };

  const get_row_background = () => {
    if (style_config) return style_config.background_color;
    return "transparent";
  };

  const get_row_indent = () => {
    if (style_config) return style_config.indent;
    return "0px";
  };

  // Check if we're using column-aligned badge layout
  const use_aligned_badge = is_inline && badge_column_width;

  // Render the badge component separately for aligned layout
  const render_badge = () => {
    // Check for formula_label (plain text annotation) first
    if (field.field_info.formula_label) {
      return (
        <span
          className="cls_formula_label text-sm text-muted-foreground"
          style={{
            fontFamily: config.field_font_family,
            whiteSpace: "nowrap",
          }}
        >
          {field.field_info.formula_label}
        </span>
      );
    }
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

  // Render the label component (without badge if using aligned layout)
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
          color: get_label_font_color(),
          fontFamily: config.label_font_family,
          fontSize: get_label_font_size(),
          fontWeight: get_label_font_weight(),
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
      {has_help_tooltip && field.help_tooltip && (
        <HelpTooltipIcon
          help_tooltip={field.help_tooltip}
          computed_formula={field.field_info.computed_formula}
        />
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

  // Check if row background is not transparent (needs special styling)
  const has_row_background = style_config && style_config.background_color !== "transparent";

  // Render the input/value component
  const render_field = () => (
    <>
      {is_readonly ? (
        <div
          className={cn(
            "cls_field_value_display py-2 px-3 rounded-md min-h-[40px] flex items-center",
            is_inline && "justify-end"
          )}
          style={{
            background: has_row_background ? "transparent" : config.view_mode_background,
            border: has_row_background ? "none" : `1px solid ${config.view_mode_border}`,
            fontFamily: config.field_font_family,
            fontSize: get_field_font_size(),
            fontWeight: get_field_font_weight(),
            color: style_config ? style_config.font_color : undefined,
          }}
        >
          {get_display_value()}
        </div>
      ) : (
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            style={{
              fontFamily: config.field_font_family,
              fontWeight: get_field_font_weight(),
            }}
          >
            {currency_symbol}
          </span>
          <Input
            id={field.id}
            type="number"
            value={get_input_value()}
            onChange={handle_change}
            onBlur={on_blur}
            placeholder={field.field_info.placeholder || "0.00"}
            disabled={field.field_info.disabled}
            min={field.field_info.min}
            max={field.field_info.max}
            step={Math.pow(10, -decimal_places)}
            className={cn(
              "cls_currency_input",
              is_inline && "text-right",
              error && "cls_input_error border-destructive"
            )}
            style={{
              paddingLeft: "28px", // Space for currency symbol
              fontFamily: config.field_font_family,
              fontSize: get_field_font_size(),
              fontWeight: get_field_font_weight(),
              borderColor: error ? config.error_color : undefined,
              backgroundColor: field.field_info.disabled
                ? config.field_background_color_disabled
                : config.field_background_color,
            }}
          />
        </div>
      )}
    </>
  );

  // Check if row needs full-width background styling
  const needs_row_styling = has_style_variant && has_row_background;
  const row_indent = get_row_indent();
  const has_indent = row_indent !== "0px" && row_indent !== "0";

  // Inline layout: label and field on same row
  if (is_inline) {
    // Determine value width (use provided value_column_width or default)
    const effective_value_width = value_column_width || "150px";

    // Check if we have a paired field (for dual-column layouts)
    const has_paired_field = !!field.paired_field;
    const paired_field_info = field.paired_field?.field_info;

    // Render badge for paired field
    const render_paired_badge = () => {
      if (!paired_field_info?.badge) return null;
      return (
        <span
          className="cls_field_badge inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded"
          style={{
            backgroundColor: "#111827",
            color: "#ffffff",
            minWidth: "24px",
          }}
        >
          {paired_field_info.badge}
        </span>
      );
    };

    // Render the paired field input/value
    const render_paired_field = () => {
      const paired_currency_symbol = paired_field_info?.currency_symbol || config.default_currency_symbol;
      const paired_decimal_places = paired_field_info?.decimal_places ?? config.default_decimal_places;

      // Check if paired field should be readonly (computed or disabled)
      const paired_is_computed = Boolean(paired_field_info?.computed_formula);
      const paired_is_disabled = Boolean(paired_field_info?.disabled);
      const paired_is_readonly = is_view || paired_is_computed || paired_is_disabled;

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

      if (paired_is_readonly) {
        return (
          <div
            className={cn(
              "cls_field_value_display py-2 px-3 rounded-md min-h-[40px] flex items-center justify-end"
            )}
            style={{
              background: has_row_background ? "transparent" : config.view_mode_background,
              border: has_row_background ? "none" : `1px solid ${config.view_mode_border}`,
              fontFamily: config.field_font_family,
              fontSize: get_field_font_size(),
              fontWeight: get_field_font_weight(),
              color: style_config ? style_config.font_color : undefined,
            }}
          >
            {get_paired_display_value()}
          </div>
        );
      }

      return (
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            style={{
              fontFamily: config.field_font_family,
              fontWeight: get_field_font_weight(),
            }}
          >
            {paired_currency_symbol}
          </span>
          <Input
            id={field.paired_field?.id}
            type="number"
            value={get_paired_input_value()}
            onChange={handle_paired_change}
            onBlur={paired_on_blur}
            placeholder={paired_field_info?.placeholder || "0.00"}
            disabled={paired_field_info?.disabled}
            min={paired_field_info?.min}
            max={paired_field_info?.max}
            step={Math.pow(10, -paired_decimal_places)}
            className={cn(
              "cls_currency_input text-right",
              paired_error && "cls_input_error border-destructive"
            )}
            style={{
              paddingLeft: "28px", // Space for currency symbol
              fontFamily: config.field_font_family,
              fontSize: get_field_font_size(),
              fontWeight: get_field_font_weight(),
              borderColor: paired_error ? config.error_color : undefined,
              backgroundColor: paired_field_info?.disabled
                ? config.field_background_color_disabled
                : config.field_background_color,
            }}
          />
        </div>
      );
    };

    return (
      <div
        className={cn(
          "cls_field_container cls_currency_field cls_inline_layout",
          has_style_variant && `cls_style_${style_variant}`,
          has_paired_field && "cls_paired_field_layout"
        )}
        style={{
          backgroundColor: get_row_background(),
          padding: needs_row_styling ? "12px 16px" : undefined,
          marginLeft: needs_row_styling ? `calc(-16px + ${row_indent})` : has_indent ? row_indent : undefined,
          marginRight: needs_row_styling ? "-16px" : undefined,
          width: needs_row_styling
            ? `calc(100% + 32px - ${row_indent})`
            : has_indent
              ? `calc(100% - ${row_indent})`
              : "100%",
          boxSizing: "border-box",
        }}
      >
        <div className="flex items-center gap-4">
          {/* Label section - takes remaining space */}
          <div className="flex-grow min-w-0">{render_label()}</div>

          {/* Primary field: Badge + Value */}
          {use_aligned_badge && (field.field_info.badge || field.field_info.formula_label) && (
            <div
              className="cls_badge_column flex-shrink-0 flex items-center justify-center"
              style={{ width: badge_column_width, minWidth: field.field_info.formula_label ? "120px" : undefined }}
            >
              {render_badge()}
            </div>
          )}
          <div
            className="flex-shrink-0"
            style={{ width: effective_value_width }}
          >
            {render_field()}
          </div>

          {/* Paired field: Badge + Value (when present) */}
          {has_paired_field && (
            <>
              {use_aligned_badge && paired_field_info?.badge && (
                <div
                  className="cls_badge_column flex-shrink-0 flex items-center justify-center"
                  style={{ width: badge_column_width }}
                >
                  {render_paired_badge()}
                </div>
              )}
              <div
                className="flex-shrink-0"
                style={{ width: effective_value_width }}
              >
                {render_paired_field()}
              </div>
            </>
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
        {field.reference_value && <ReferenceValue value={field.reference_value} />}
      </div>
    );
  }

  // Stacked layout (default): label above field
  return (
    <div
      className={cn(
        "cls_field_container cls_currency_field",
        has_style_variant && `cls_style_${style_variant}`
      )}
      style={{
        backgroundColor: get_row_background(),
        padding: needs_row_styling ? "12px 16px" : undefined,
        marginLeft: needs_row_styling ? `calc(-16px + ${row_indent})` : has_indent ? row_indent : undefined,
        marginRight: needs_row_styling ? "-16px" : undefined,
        width: needs_row_styling
          ? `calc(100% + 32px - ${row_indent})`
          : has_indent
            ? `calc(100% - ${row_indent})`
            : "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: config.label_field_gap }}>
        {render_label()}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-grow min-w-0">
          {render_field()}
        </div>
        {render_file_column()}
      </div>
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
