"use client";

import * as React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FileManagerButton } from "../file_manager_viewer/file_manager_button";
import { cn, normalize_doc_links } from "../../lib/utils";
import type { FieldRendererProps } from "../../lib/field_registry";

/**
 * Text Field Renderer
 * Handles text input with optional min/max length validation
 */
export function TextField({
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
  field_uploads,
  on_upload_click,
  upload_enabled,
}: FieldRendererProps) {
  const is_view = mode === "view";
  const is_required = field.field_info.required;
  const has_doc_links = !!field.doc_links?.length;
  const is_inline = field.label_position === "inline";
  const string_value = value !== undefined && value !== null ? String(value) : "";

  // Check if we're using column-aligned badge layout
  const use_aligned_badge = is_inline && badge_column_width;

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
            is_inline && field.field_info.text_align !== "left" && "justify-end"
          )}
          style={{
            background: config.view_mode_background,
            border: `1px solid ${config.view_mode_border}`,
            fontFamily: config.field_font_family,
            fontSize: config.field_font_size,
          }}
        >
          {string_value || "-"}
        </div>
      ) : (
        <Input
          id={field.id}
          type="text"
          value={string_value}
          onChange={(e) => on_change(e.target.value)}
          onBlur={on_blur}
          placeholder={field.field_info.placeholder}
          disabled={field.field_info.disabled}
          minLength={field.field_info.min_length}
          maxLength={field.field_info.max_length}
          className={cn(
            "cls_text_input",
            is_inline && field.field_info.text_align !== "left" && "text-right",
            error && "cls_input_error border-destructive"
          )}
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
    </>
  );

  // Inline layout: label and field on same row
  if (is_inline) {
    // Determine value width (use field-level value_width, or provided value_column_width, or default)
    const effective_value_width = field.value_width || value_column_width || "150px";

    return (
      <div className="cls_field_container cls_text_field cls_inline_layout w-full">
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
          {/* Doc link column - always reserves space for alignment */}
          {render_file_column()}
        </div>
        {error && (
          <p
            className="cls_error_message mt-1 text-sm text-right"
            style={{ color: config.error_color }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  // Stacked layout (default): label above field
  return (
    <div className="cls_field_container cls_text_field w-full">
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
    </div>
  );
}
