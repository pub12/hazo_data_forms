"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import type { FieldRendererProps } from "../../lib/field_registry";

/**
 * Static Text Field Renderer
 * Displays read-only static text content (instructions, notes, etc.)
 */
export function StaticTextField({
  field,
  config,
}: FieldRendererProps) {
  const content = field.field_info.static_content || field.label;
  const text_align = field.field_info.text_align || "left";
  const is_worksheet = field.field_info.is_worksheet;

  return (
    <div
      className={cn(
        "cls_field_container cls_static_text_field",
        field.field_info.display_variant === "inline" && "inline-block",
        !is_worksheet && "w-full"
      )}
      style={{
        width: is_worksheet ? `calc(100% - ${config.worksheet_indent})` : field.field_info.width,
        marginLeft: is_worksheet ? config.worksheet_indent : undefined,
      }}
    >
      {field.field_info.item_code && (
        <span
          className="cls_item_code text-sm font-mono mr-2"
          style={{ color: config.label_color }}
        >
          {field.field_info.item_code}
        </span>
      )}
      <p
        className="cls_static_text_content"
        style={{
          fontFamily: config.field_font_family,
          fontSize: config.field_font_size,
          color: config.label_color,
          textAlign: text_align,
        }}
      >
        {field.field_info.badge && (
          <span
            className="cls_field_badge inline-block px-2 py-0.5 mr-2 text-xs font-semibold rounded bg-primary/20 text-primary"
          >
            {field.field_info.badge}
          </span>
        )}
        {content}
      </p>
    </div>
  );
}
