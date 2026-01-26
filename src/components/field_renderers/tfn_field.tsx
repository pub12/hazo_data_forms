"use client";

import * as React from "react";
import { FaFileAlt, FaRegFileAlt } from "react-icons/fa";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";
import type { FieldRendererProps } from "../../lib/field_registry";

/**
 * Format TFN (Tax File Number) as XXX XXX XXX
 */
function format_tfn(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/**
 * TFN Field Renderer
 * Handles Tax File Number input with XXX XXX XXX formatting
 */
export function TfnField({
  field,
  mode,
  value,
  error,
  config,
  on_change,
  on_blur,
  on_doc_link_click,
}: FieldRendererProps) {
  const is_view = mode === "view";
  const is_required = field.field_info.required;
  const has_doc_links = !!field.doc_links?.length;
  const string_value = value !== undefined && value !== null ? String(value) : "";
  const formatted_value = format_tfn(string_value);

  const handle_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw_value = e.target.value.replace(/\D/g, "").slice(0, 9);
    on_change(raw_value);
  };

  return (
    <div
      className="cls_field_container cls_tfn_field w-full"
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
              className="cls_field_badge inline-block px-2 py-0.5 mr-2 text-xs font-semibold rounded bg-primary/20 text-primary"
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
              className="cls_doc_link_btn p-1 rounded hover:bg-muted transition-colors"
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
          className="cls_field_value_display py-2 px-3 rounded-md min-h-[40px] flex items-center font-mono"
          style={{
            background: config.view_mode_background,
            border: `1px solid ${config.view_mode_border}`,
            fontFamily: "monospace",
            fontSize: config.field_font_size,
            letterSpacing: "0.05em",
          }}
        >
          {formatted_value || "-"}
        </div>
      ) : (
        <Input
          id={field.id}
          type="text"
          inputMode="numeric"
          value={formatted_value}
          onChange={handle_change}
          onBlur={on_blur}
          placeholder={field.field_info.placeholder || "XXX XXX XXX"}
          disabled={field.field_info.disabled}
          maxLength={11}
          className={cn("cls_tfn_input font-mono", error && "cls_input_error border-destructive")}
          style={{
            fontFamily: "monospace",
            fontSize: config.field_font_size,
            letterSpacing: "0.05em",
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
          {error}
        </p>
      )}
    </div>
  );
}
