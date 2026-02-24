"use client";

import * as React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FileManagerButton } from "../file_manager_viewer/file_manager_button";
import { cn, normalize_doc_links } from "../../lib/utils";
import type { FieldRendererProps } from "../../lib/field_registry";
import { ReferenceValue } from "./shared/reference_value";

/**
 * Email Field Renderer
 * Handles email input with built-in validation
 */
export function EmailField({
  field,
  mode,
  value,
  error,
  config,
  on_change,
  on_blur,
  on_doc_link_click,
  field_uploads,
  on_upload_click,
  upload_enabled,
}: FieldRendererProps) {
  const is_view = mode === "view";
  const is_required = field.field_info.required;
  const string_value = value !== undefined && value !== null ? String(value) : "";

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
    <div className="cls_field_container cls_email_field w-full">
      <div
        className="cls_label_row flex items-center gap-2"
        style={{ marginBottom: config.label_field_gap }}
      >
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
        {render_file_button()}
      </div>

      {is_view ? (
        <div
          className="cls_field_value_display py-2 px-3 rounded-md min-h-[40px] flex items-center"
          style={{
            background: config.view_mode_background,
            border: `1px solid ${config.view_mode_border}`,
            fontFamily: config.field_font_family,
            fontSize: config.field_font_size,
          }}
        >
          {string_value ? (
            <a
              href={`mailto:${string_value}`}
              className="text-primary hover:underline"
            >
              {string_value}
            </a>
          ) : (
            "-"
          )}
        </div>
      ) : (
        <Input
          id={field.id}
          type="email"
          value={string_value}
          onChange={(e) => on_change(e.target.value)}
          onBlur={on_blur}
          placeholder={field.field_info.placeholder || "email@example.com"}
          disabled={field.field_info.disabled}
          className={cn("cls_email_input", error && "cls_input_error border-destructive")}
          style={{
            fontFamily: config.field_font_family,
            fontSize: config.field_font_size,
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
      {field.reference_value && <ReferenceValue value={field.reference_value} />}
    </div>
  );
}
