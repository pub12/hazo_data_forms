"use client";

import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FieldRenderer } from "../field_renderers";
import { cn, get_field_uploads, normalize_doc_links } from "../../lib/utils";
import type { SubSection, FormMode, FormConfig, FormErrors, DocLink, StyleVariant, FormField, FormValues } from "../../lib/types";

export interface SubSectionRendererProps {
  sub_section: SubSection;
  mode: FormMode;
  config: FormConfig;
  show_header?: boolean;
  on_doc_link_click?: (field_id: string, doc_links: DocLink[], field_label?: string) => void;
  errors?: FormErrors;
  upload_enabled?: boolean;
  form_values?: FormValues;
  on_upload_click?: (field_id: string, field_label: string) => void;
}

/**
 * Sub-section Renderer
 * Renders a sub-section with its label and field group
 */
export function SubSectionRenderer({
  sub_section,
  mode,
  config,
  show_header = true,
  on_doc_link_click,
  errors,
  upload_enabled,
  form_values,
  on_upload_click,
}: SubSectionRendererProps) {
  const form = useFormContext();
  const { orientation, fields, badge_column_width, value_column_width, column_headers } = sub_section.field_group;
  const is_horizontal = orientation === "horizontal";

  // Get style variant for sub-section header (default to header_h2)
  const style_variant: StyleVariant = sub_section.style_variant || "header_h2";
  const style_config = config.styles[style_variant];

  // Check if we have paired fields that need column headers
  const has_column_headers = column_headers && column_headers.length > 0;

  // Build validation rules for a field based on field_info
  const get_validation_rules = (field: FormField) => {
    const rules: Record<string, unknown> = {};

    if (field.field_info.required) {
      rules.required = `${field.label || "This field"} is required`;
    }

    if (field.field_info.min !== undefined) {
      rules.min = {
        value: field.field_info.min,
        message: `Minimum value is ${field.field_info.min}`,
      };
    }

    if (field.field_info.max !== undefined) {
      rules.max = {
        value: field.field_info.max,
        message: `Maximum value is ${field.field_info.max}`,
      };
    }

    if (field.field_info.min_length !== undefined) {
      rules.minLength = {
        value: field.field_info.min_length,
        message: `Minimum length is ${field.field_info.min_length} characters`,
      };
    }

    if (field.field_info.max_length !== undefined) {
      rules.maxLength = {
        value: field.field_info.max_length,
        message: `Maximum length is ${field.field_info.max_length} characters`,
      };
    }

    return rules;
  };

  // Render a single field with form integration
  const render_field_with_form = (field: FormField, paired_value?: unknown, paired_on_change?: (value: unknown) => void, paired_on_blur?: () => void) => {
    const field_error = errors?.[field.id];
    const paired_error = field.paired_field ? errors?.[field.paired_field.id] : undefined;
    const field_uploads = form_values ? get_field_uploads(form_values, field.id) : [];

    if (form) {
      const validation_rules = get_validation_rules(field);

      return (
        <Controller
          name={field.id}
          control={form.control}
          defaultValue={field.value ?? ""}
          rules={validation_rules}
          render={({ field: form_field, fieldState }) => (
            <FieldRenderer
              field={field}
              mode={mode}
              value={form_field.value}
              error={field_error || fieldState.error?.message}
              config={config}
              on_change={form_field.onChange}
              on_blur={form_field.onBlur}
              on_doc_link_click={
                field.doc_links?.length && on_doc_link_click
                  ? () => {
                      const normalized = normalize_doc_links(field.doc_links);
                      if (normalized.length > 0) {
                        on_doc_link_click(field.id, normalized, field.label);
                      }
                    }
                  : undefined
              }
              on_row_doc_link_click={on_doc_link_click}
              badge_column_width={badge_column_width}
              value_column_width={value_column_width}
              paired_value={paired_value}
              paired_on_change={paired_on_change}
              paired_on_blur={paired_on_blur}
              paired_error={paired_error}
              upload_enabled={upload_enabled}
              field_uploads={field_uploads}
              on_upload_click={
                on_upload_click
                  ? () => on_upload_click(field.id, field.label)
                  : undefined
              }
            />
          )}
        />
      );
    }

    // Fallback: render without form context (view mode)
    return (
      <FieldRenderer
        field={field}
        mode={mode}
        value={field.value}
        error={field_error}
        config={config}
        on_change={() => {}}
        on_doc_link_click={
          field.doc_links?.length && on_doc_link_click
            ? () => {
                const normalized = normalize_doc_links(field.doc_links);
                if (normalized.length > 0) {
                  on_doc_link_click(field.id, normalized, field.label);
                }
              }
            : undefined
        }
        on_row_doc_link_click={on_doc_link_click}
        badge_column_width={badge_column_width}
        value_column_width={value_column_width}
        paired_value={field.paired_field?.value}
        paired_error={paired_error}
        upload_enabled={upload_enabled}
        field_uploads={field_uploads}
        on_upload_click={
          on_upload_click
            ? () => on_upload_click(field.id, field.label)
            : undefined
        }
      />
    );
  };

  return (
    <div
      className="cls_sub_section"
      style={{ marginBottom: config.sub_section_spacing }}
    >
      {show_header && sub_section.sub_section_label && (
        <div
          className="cls_sub_section_header border-b pb-2 mb-4"
          style={{
            backgroundColor: style_config.background_color,
            marginLeft: style_config.indent,
            padding: style_config.background_color !== "transparent" ? "8px 12px" : undefined,
            borderRadius: style_config.background_color !== "transparent" ? "4px" : undefined,
          }}
        >
          <div className="flex items-center justify-between">
            <h3
              style={{
                color: style_config.font_color,
                fontFamily: config.label_font_family,
                fontSize: style_config.font_size,
                fontWeight: style_config.font_weight,
              }}
            >
              {sub_section.item_code && (
                <span
                  className="cls_item_code_box inline-flex items-center justify-center mr-2 px-1.5 py-0.5 border text-xs font-mono"
                  style={{
                    borderColor: config.item_code_border_color,
                    backgroundColor: config.item_code_background,
                    fontSize: config.item_code_font_size,
                  }}
                >
                  {sub_section.item_code}
                </span>
              )}
              {sub_section.sub_section_label}
              {sub_section.badge && (
                <span
                  className="cls_sub_section_badge inline-flex items-center justify-center ml-2 px-2 py-0.5 text-xs font-bold rounded"
                  style={{
                    backgroundColor: "#111827",
                    color: "#ffffff",
                    minWidth: "24px",
                  }}
                >
                  {sub_section.badge}
                </span>
              )}
            </h3>
            {/* Column headers in the header row */}
            {has_column_headers && (
              <div className="cls_column_headers flex items-center gap-2">
                {column_headers.map((header, idx) => (
                  <div
                    key={idx}
                    className="cls_column_header text-sm font-medium text-center"
                    style={{
                      width: header.width || value_column_width || "120px",
                      color: style_config.font_color,
                    }}
                  >
                    {header.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          "cls_field_group",
          is_horizontal
            ? "flex flex-wrap items-start"
            : "flex flex-col"
        )}
        style={{
          gap: is_horizontal ? config.field_gap_horizontal : config.field_gap_vertical,
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        {fields.map((field) => {
          // Handle paired fields - need to register both with form
          if (field.paired_field && form) {
            // Build validation rules for paired field
            const paired_rules: Record<string, unknown> = {};
            if (field.paired_field.field_info?.required) {
              paired_rules.required = `${field.label || "This field"} (paired) is required`;
            }
            if (field.paired_field.field_info?.min !== undefined) {
              paired_rules.min = {
                value: field.paired_field.field_info.min,
                message: `Minimum value is ${field.paired_field.field_info.min}`,
              };
            }
            if (field.paired_field.field_info?.max !== undefined) {
              paired_rules.max = {
                value: field.paired_field.field_info.max,
                message: `Maximum value is ${field.paired_field.field_info.max}`,
              };
            }

            // Apply highlight row styling if specified
            const is_highlight = field.row_variant === "highlight";

            return (
              <div
                key={field.id}
                className={cn(
                  "cls_field_wrapper",
                  is_horizontal && "flex-1 min-w-[200px]",
                  is_highlight && "cls_highlight_row"
                )}
                style={{
                  backgroundColor: is_highlight ? config.highlight_row_background : undefined,
                  padding: is_highlight ? "8px 12px" : undefined,
                  marginLeft: is_highlight ? "-12px" : undefined,
                  marginRight: is_highlight ? "-12px" : undefined,
                  width: is_highlight ? "calc(100% + 24px)" : "100%",
                  borderRadius: is_highlight ? "4px" : undefined,
                  boxSizing: "border-box",
                }}
              >
                <Controller
                  name={field.paired_field.id}
                  control={form.control}
                  defaultValue={field.paired_field.value ?? ""}
                  rules={paired_rules}
                  render={({ field: paired_form_field, fieldState: paired_field_state }) => (
                    <>
                      {render_field_with_form(
                        field,
                        paired_form_field.value,
                        paired_form_field.onChange,
                        paired_form_field.onBlur
                      )}
                    </>
                  )}
                />
              </div>
            );
          }

          // Regular field (no pairing)
          // Apply highlight row styling if specified
          const is_highlight = field.row_variant === "highlight";

          return (
            <div
              key={field.id}
              className={cn(
                "cls_field_wrapper",
                is_horizontal && "flex-1 min-w-[200px]",
                is_highlight && "cls_highlight_row"
              )}
              style={{
                backgroundColor: is_highlight ? config.highlight_row_background : undefined,
                padding: is_highlight ? "8px 12px" : undefined,
                marginLeft: is_highlight ? "-12px" : undefined,
                marginRight: is_highlight ? "-12px" : undefined,
                width: is_highlight ? "calc(100% + 24px)" : "100%",
                borderRadius: is_highlight ? "4px" : undefined,
                boxSizing: "border-box",
              }}
            >
              {render_field_with_form(field)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
