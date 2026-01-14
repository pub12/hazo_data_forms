"use client";

import * as React from "react";
import { SubSectionRenderer } from "./sub_section_renderer";
import { cn } from "../../lib/utils";
import type { FormSection, FormMode, FormConfig, FormErrors, DocLink, StyleVariant, FormValues } from "../../lib/types";

export interface SectionRendererProps {
  section: FormSection;
  mode: FormMode;
  config: FormConfig;
  show_header?: boolean;
  show_sub_headers?: boolean;
  collapsible?: boolean;
  initially_collapsed?: boolean;
  on_doc_link_click?: (field_id: string, doc_link: DocLink, doc_links?: DocLink[], field_label?: string) => void;
  errors?: FormErrors;
  upload_enabled?: boolean;
  form_values?: FormValues;
  on_upload_click?: (field_id: string, field_label: string, section_name?: string, sub_section_id?: string) => void;
}

/**
 * Section Renderer
 * Renders a top-level section with its sub-sections
 */
export function SectionRenderer({
  section,
  mode,
  config,
  show_header = true,
  show_sub_headers = true,
  collapsible = false,
  initially_collapsed = false,
  on_doc_link_click,
  errors,
  upload_enabled,
  form_values,
  on_upload_click,
}: SectionRendererProps) {
  const [is_collapsed, set_is_collapsed] = React.useState(initially_collapsed);

  const toggle_collapsed = () => {
    if (collapsible) {
      set_is_collapsed(!is_collapsed);
    }
  };

  // Get style variant for section header (default to header_h1)
  const style_variant: StyleVariant = section.style_variant || "header_h1";
  const style_config = config.styles[style_variant];

  return (
    <section
      className="cls_section"
      style={{ marginBottom: config.section_spacing }}
    >
      {show_header && section.section_name && (
        <div
          className={cn(
            "cls_section_header flex items-center justify-between py-3 px-4 rounded-md mb-4",
            collapsible && "cursor-pointer hover:opacity-80"
          )}
          style={{
            backgroundColor: style_config.background_color,
            marginLeft: style_config.indent,
          }}
          onClick={toggle_collapsed}
          role={collapsible ? "button" : undefined}
          aria-expanded={collapsible ? !is_collapsed : undefined}
        >
          <h2
            className="cls_section_title"
            style={{
              color: style_config.font_color,
              fontFamily: config.label_font_family,
              fontSize: style_config.font_size,
              fontWeight: style_config.font_weight,
            }}
          >
            {section.section_name}
          </h2>

          {collapsible && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "cls_collapse_icon transition-transform",
                is_collapsed && "rotate-180"
              )}
              style={{ color: style_config.font_color }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </div>
      )}

      {!is_collapsed && (
        <div
          className={cn(
            "cls_section_content",
            section.sub_section_layout === "horizontal" && "grid grid-cols-2 gap-6"
          )}
        >
          {section.sub_sections.map((sub_section) => (
            <SubSectionRenderer
              key={sub_section.sub_section_id}
              sub_section={sub_section}
              mode={mode}
              config={config}
              show_header={show_sub_headers}
              on_doc_link_click={on_doc_link_click}
              errors={errors}
              upload_enabled={upload_enabled}
              form_values={form_values}
              on_upload_click={
                on_upload_click
                  ? (field_id: string, field_label: string) =>
                      on_upload_click(field_id, field_label, section.section_name, sub_section.sub_section_id)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Re-export SubSectionRenderer
export { SubSectionRenderer } from "./sub_section_renderer";
