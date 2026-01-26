"use client";

import * as React from "react";
import { FaFileAlt, FaRegFileAlt } from "react-icons/fa";
import { Label } from "../ui/label";
import { cn, format_currency } from "../../lib/utils";
import type { FieldRendererProps } from "../../lib/field_registry";
import type { StyleVariant } from "../../lib/types";

/**
 * Summary Row Field Renderer
 * Displays a read-only summary/total row with special styling
 * Supports style_variant for hierarchical styling (total_h1, total_h2, etc.)
 */
export function SummaryRowField({
  field,
  value,
  config,
  on_doc_link_click,
  badge_column_width,
  value_column_width,
}: FieldRendererProps) {
  const has_doc_links = !!field.doc_links?.length;
  const text_align = field.field_info.text_align || "right";

  // Get style_variant from field (e.g., "total_h1", "total_h2")
  // Default to "total_h1" for consistent styling when no variant is specified
  const style_variant: StyleVariant = field.style_variant || "total_h1";
  const style_config = config.styles[style_variant];

  // Check if row background is not transparent (needs special styling)
  const has_row_background = style_config && style_config.background_color !== "transparent";

  const format_value = (val: unknown): string => {
    if (val === undefined || val === null || val === "") return "$0.00";

    const num = typeof val === "number" ? val : parseFloat(String(val));
    if (isNaN(num)) return String(val);

    const decimal_places = field.field_info.decimal_places ?? config.default_decimal_places;
    const currency_symbol = field.field_info.currency_symbol ?? config.default_currency_symbol;

    return format_currency(num, currency_symbol, decimal_places);
  };

  const row_indent = style_config?.indent || "0px";

  // Calculate doc link column width for alignment
  const doc_link_col_width = config.doc_link_column_width || "32px";

  // Render the doc link column (always reserves space for alignment)
  const render_doc_link_column = () => {
    const icon_size = parseInt(config.doc_link_icon_size, 10) || 20;
    const IconComponent = config.doc_link_icon_style === "solid" ? FaFileAlt : FaRegFileAlt;

    return (
      <div
        className="cls_doc_link_column flex-shrink-0 flex items-center justify-center"
        style={{ width: doc_link_col_width }}
      >
        {has_doc_links && on_doc_link_click && (
          <button
            type="button"
            onClick={on_doc_link_click}
            className="cls_doc_link_btn p-1 rounded hover:bg-muted transition-colors"
            aria-label="View document"
          >
            <IconComponent
              size={icon_size}
              color={config.doc_link_icon_color}
              className="transition-colors"
            />
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "cls_field_container cls_summary_row_field",
        `cls_style_${style_variant}`
      )}
      style={{
        width: `calc(100% + 32px - ${row_indent})`,
        backgroundColor: style_config?.background_color,
        padding: "12px 16px",
        marginLeft: `calc(-16px + ${row_indent})`,
        marginRight: "-16px",
        marginTop: "8px",
        boxSizing: "border-box",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="cls_label_row flex items-center gap-2 flex-grow">
          {field.field_info.item_code && (
            <span
              className="cls_item_code text-sm font-mono"
              style={{ color: style_config?.font_color || config.label_color }}
            >
              {field.field_info.item_code}
            </span>
          )}
          <Label
            className="cls_field_label"
            style={{
              color: style_config?.font_color,
              fontFamily: config.label_font_family,
              fontSize: style_config?.font_size,
              fontWeight: style_config?.font_weight,
            }}
          >
            {field.field_info.badge && (
              <span
                className="cls_field_badge inline-block px-2 py-0.5 mr-2 text-xs font-semibold rounded bg-primary/20 text-primary"
              >
                {field.field_info.badge}
              </span>
            )}
            {field.label}
          </Label>
        </div>

        {field.field_info.summary_note && (
          <span
            className="cls_summary_note text-sm"
            style={{
              color: style_config?.font_color || config.label_color,
              fontFamily: config.field_font_family,
              opacity: 0.8,
            }}
          >
            {field.field_info.summary_note}
          </span>
        )}

        {/* Badge column spacer - reserves space for alignment with other fields */}
        {badge_column_width && (
          <div
            className="cls_badge_column_spacer flex-shrink-0"
            style={{ width: badge_column_width }}
          />
        )}

        {/* Value column - uses value_column_width for alignment */}
        <div
          className={cn(
            "cls_summary_value py-2 px-4 rounded-md flex-shrink-0",
            has_row_background ? "" : "bg-muted border border-border"
          )}
          style={{
            fontFamily: config.field_font_family,
            fontSize: style_config?.font_size,
            fontWeight: style_config?.font_weight,
            color: style_config?.font_color,
            textAlign: text_align,
            width: value_column_width || "150px",
            minWidth: "150px",
            background: has_row_background ? "transparent" : undefined,
            border: has_row_background ? "none" : undefined,
          }}
        >
          {format_value(value)}
        </div>

        {/* Doc link column - always reserves space for alignment */}
        {render_doc_link_column()}
      </div>

      {field.field_info.summary_fields && field.field_info.summary_fields.length > 0 && (
        <p
          className="cls_summary_hint mt-1 text-xs text-muted-foreground"
          style={{ fontFamily: config.field_font_family }}
        >
          Sum of: {field.field_info.summary_fields.join(" + ")}
        </p>
      )}
    </div>
  );
}
