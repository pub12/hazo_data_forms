"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { SectionRenderer } from "../section_renderer";
import { DocPanel } from "../doc_panel";
import { FileManager, FileManagerDialog, doc_link_to_file_item } from "../file_manager_viewer";
import type { FileItem } from "../file_manager_viewer/types";
import { Button } from "../ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../ui/resizable";
import { useFormConfig } from "../../hooks/use_form_config";
import { cn, evaluate_formula, get_uploads_key, get_field_uploads, uploads_to_doc_links } from "../../lib/utils";
import type { DocLink, FormValues, FormField, FileUploadResult } from "../../lib/types";
import type { HazoDataFormProps } from "./types";

// Import field renderers to register them - use named import to prevent tree-shaking
import { FieldRenderer as _FieldRenderer } from "../field_renderers";
// Ensure the import isn't removed by referencing it
const _ensure_field_renderers_loaded = _FieldRenderer;

/**
 * Convert width string (like "50vw", "400px", "50%") to a percentage number
 */
function parse_width_to_percent(width_str: string): number {
  if (width_str.endsWith("vw") || width_str.endsWith("%")) {
    return parseFloat(width_str);
  }
  // For pixel values, assume viewport width of ~1400px as reference
  // This is just a reasonable default for initial size
  const px_value = parseFloat(width_str);
  return Math.min(80, Math.max(20, (px_value / 1400) * 100));
}

/**
 * HazoDataForm Component
 * Main form component that renders dynamic forms from JSON schema
 */
export function HazoDataForm({
  schema,
  mode = "edit",
  values,
  default_values,
  on_change,
  on_field_change,
  on_submit,
  on_doc_link_click,
  show_pdf_panel = true,
  pdf_panel_position = "right",
  pdf_panel_width,
  pdf_panel_resizable = true,
  pdf_viewer_component,
  on_pdf_save,
  config_path,
  config_override,
  errors: external_errors,
  validate_on_blur = true,
  validate_on_change = false,
  validate,
  class_name,
  show_section_headers = true,
  show_sub_section_headers = true,
  collapsible_sections = false,
  collapsed_sections = [],
  on_form_ready,
  show_submit_button,
  submit_button_text = "Submit",
  enable_file_upload = false,
  on_file_upload,
  on_file_delete,
  on_file_view,
  on_file_popout,
  // hazo_pdf 1.3.2 features
  enable_file_conversion = false,
  on_file_convert,
  enable_pdf_popout = false,
  pdf_popout_route,
  on_pdf_popout,
}: HazoDataFormProps) {
  // Load config from INI file
  const config = useFormConfig(config_path, config_override);

  // Document panel state
  const [active_doc_links, set_active_doc_links] = React.useState<DocLink[]>([]);
  const [is_doc_panel_open, set_is_doc_panel_open] = React.useState(false);

  // Upload mode state for DocPanel
  const [doc_panel_upload_mode, set_doc_panel_upload_mode] = React.useState(false);
  const [active_field_id, set_active_field_id] = React.useState<string | null>(null);
  const [active_field_label, set_active_field_label] = React.useState<string>("");

  // Extract default values from schema (including paired_field values)
  // Priority: field.value > field.default_value > field.field_info.default_value
  const schema_defaults = React.useMemo(() => {
    const defaults: FormValues = {};
    const extract_field_values = (fields: FormField[]) => {
      fields.forEach((field) => {
        // Get field value with priority: value > default_value > field_info.default_value
        const field_value =
          field.value !== undefined ? field.value :
          field.default_value !== undefined ? field.default_value :
          field.field_info.default_value;

        if (field_value !== undefined) {
          defaults[field.id] = field_value;
        }

        // Also extract paired_field value if present
        // Priority: paired_field.value > paired_field.default_value > paired_field.field_info.default_value
        if (field.paired_field) {
          const paired_value =
            field.paired_field.value !== undefined ? field.paired_field.value :
            field.paired_field.default_value !== undefined ? field.paired_field.default_value :
            field.paired_field.field_info?.default_value;

          if (paired_value !== undefined) {
            defaults[field.paired_field.id] = paired_value;
          }
        }
      });
    };

    schema.forEach((section) => {
      section.sub_sections.forEach((sub_section) => {
        extract_field_values(sub_section.field_group.fields);
      });
    });

    return defaults;
  }, [schema]);

  // Initialize react-hook-form
  const form_methods = useForm<FormValues>({
    defaultValues: { ...schema_defaults, ...default_values },
    values: values,
    mode: validate_on_change ? "onChange" : validate_on_blur ? "onBlur" : "onSubmit",
  });

  // Provide form methods to parent if requested
  React.useEffect(() => {
    if (on_form_ready) {
      on_form_ready(form_methods);
    }
  }, [form_methods, on_form_ready]);

  // Get all computed fields from schema
  // Include both "computed" field type AND any field with computed_formula (e.g., currency fields)
  // Also include paired_fields that have computed_formula
  const computed_fields = React.useMemo(() => {
    const fields: FormField[] = [];
    schema.forEach((section) => {
      section.sub_sections.forEach((sub_section) => {
        sub_section.field_group.fields.forEach((field) => {
          // Check main field
          if (
            field.field_info.field_type === "computed" ||
            field.field_info.computed_formula
          ) {
            fields.push(field);
          }
          // Check paired_field for computed_formula
          if (field.paired_field?.field_info?.computed_formula) {
            // Create a synthetic FormField from the paired_field
            const paired_as_field: FormField = {
              id: field.paired_field.id,
              label: field.label, // Use parent label for reference
              field_info: field.paired_field.field_info,
            };
            fields.push(paired_as_field);
          }
        });
      });
    });
    return fields;
  }, [schema]);

  // Get set of computed field IDs for quick lookup
  const computed_field_ids = React.useMemo(() => {
    return new Set(computed_fields.map((f) => f.id));
  }, [computed_fields]);

  // Update computed field values
  const update_computed_fields = React.useCallback(
    (current_values: FormValues, changed_field_name?: string) => {
      // Skip if the changed field is itself a computed field (prevents infinite loop)
      if (changed_field_name && computed_field_ids.has(changed_field_name)) {
        return;
      }

      computed_fields.forEach((field) => {
        if (field.field_info.computed_formula) {
          let result = evaluate_formula(
            field.field_info.computed_formula,
            current_values
          );

          // Round to decimal places if specified
          if (result !== null && field.field_info.decimal_places !== undefined) {
            const multiplier = Math.pow(10, field.field_info.decimal_places);
            result = Math.round(result * multiplier) / multiplier;
          }

          // Only update if result is valid and different from current value
          const current_value = current_values[field.id];
          if (result !== null && result !== current_value) {
            form_methods.setValue(field.id, result, { shouldDirty: false });
          }
        }
      });
    },
    [computed_fields, computed_field_ids, form_methods]
  );

  // Watch for value changes
  React.useEffect(() => {
    const subscription = form_methods.watch((watch_values, { name }) => {
      // Merge with schema_defaults to ensure table data is always available
      const merged_values = { ...schema_defaults, ...watch_values } as FormValues;

      if (on_change) {
        on_change(merged_values);
      }
      if (on_field_change && name) {
        on_field_change(name, merged_values[name]);
      }

      // Update computed fields (pass changed field name to prevent infinite loop)
      update_computed_fields(merged_values, name);
    });
    return () => subscription.unsubscribe();
  }, [form_methods, on_change, on_field_change, update_computed_fields, schema_defaults]);

  // Calculate computed fields on initial mount
  React.useEffect(() => {
    if (computed_fields.length > 0) {
      // Merge schema_defaults with form values to ensure table data is available
      // Controllers may not have registered yet, so getValues() might be incomplete
      const current_values = form_methods.getValues();
      const merged_values = { ...schema_defaults, ...current_values };
      // Pass undefined as changed_field_name to allow initial calculation
      update_computed_fields(merged_values, undefined);
    }
    // Only run once on mount - don't include update_computed_fields in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if upload is enabled (both prop and config)
  const is_upload_enabled = enable_file_upload && config.file_upload.enabled;

  // Get display mode from config
  const file_manager_display_mode = config.file_manager.display_mode;

  // Convert active_doc_links to FileItem[] for FileManager
  const file_manager_items: FileItem[] = React.useMemo(() => {
    return active_doc_links.map((doc_link, index) => doc_link_to_file_item(doc_link, index));
  }, [active_doc_links]);


  // Handle doc_link click
  const handle_doc_link_click = React.useCallback(
    (field_id: string, doc_link: DocLink, doc_links?: DocLink[], field_label?: string) => {
      // Normalize to array
      const all_links = doc_links || [doc_link];

      if (on_doc_link_click) {
        on_doc_link_click({ field_id, doc_link, doc_links: all_links });
      }

      if (show_pdf_panel) {
        set_active_doc_links(all_links);
        set_is_doc_panel_open(true);

        // Also set field context if file upload is enabled, so user can add files
        if (is_upload_enabled) {
          set_active_field_id(field_id);
          set_active_field_label(field_label || "");
          set_doc_panel_upload_mode(true);
        }
      }
    },
    [on_doc_link_click, show_pdf_panel, is_upload_enabled]
  );

  // Handle upload icon click - opens DocPanel in upload mode for the field
  const handle_upload_click = React.useCallback(
    (field_id: string, field_label: string) => {
      // Get existing uploads for this field and convert to DocLinks
      const uploads = get_field_uploads(form_methods.getValues(), field_id);
      const doc_links = uploads_to_doc_links(uploads);

      // Set state to open DocPanel in upload mode
      set_active_field_id(field_id);
      set_active_field_label(field_label);
      set_active_doc_links(doc_links);
      set_is_doc_panel_open(true);
      set_doc_panel_upload_mode(true);
    },
    [form_methods]
  );

  // Handle file upload completion (from DocPanel)
  const handle_panel_upload = React.useCallback(
    async (files: File[]): Promise<FileUploadResult[]> => {
      if (!on_file_upload || !active_field_id) {
        return files.map(() => ({ success: false, error: "Upload not configured" }));
      }

      const results: FileUploadResult[] = [];

      for (const file of files) {
        const result = await on_file_upload({
          field_id: active_field_id,
          field_label: active_field_label,
          file,
        });

        results.push(result);

        // If upload successful, add to form values and update doc_links
        if (result.success && result.uploaded_file) {
          const uploads_key = get_uploads_key(active_field_id);
          const current_uploads = get_field_uploads(form_methods.getValues(), active_field_id);
          const new_uploads = [...current_uploads, result.uploaded_file];
          form_methods.setValue(uploads_key, new_uploads);

          // Update active_doc_links to include the new file
          const new_doc_links = uploads_to_doc_links(new_uploads);
          set_active_doc_links(new_doc_links);
        }
      }

      return results;
    },
    [on_file_upload, active_field_id, active_field_label, form_methods]
  );

  // Handle file deletion (from DocPanel)
  const handle_panel_delete = React.useCallback(
    async (file_id: string): Promise<boolean> => {
      if (!on_file_delete || !active_field_id) return false;

      const success = await on_file_delete(active_field_id, file_id);

      if (success) {
        // Remove from form values
        const uploads_key = get_uploads_key(active_field_id);
        const current_uploads = get_field_uploads(form_methods.getValues(), active_field_id);
        const new_uploads = current_uploads.filter((u) => u.file_id !== file_id);
        form_methods.setValue(uploads_key, new_uploads);

        // Update active_doc_links to reflect deletion
        const new_doc_links = uploads_to_doc_links(new_uploads);
        set_active_doc_links(new_doc_links);
      }

      return success;
    },
    [on_file_delete, active_field_id, form_methods]
  );

  // Handle DocPanel close - reset upload mode state
  const handle_doc_panel_close = React.useCallback(() => {
    set_is_doc_panel_open(false);
    set_doc_panel_upload_mode(false);
    set_active_field_id(null);
    set_active_field_label("");
  }, []);

  // Handle form submission
  const handle_submit = form_methods.handleSubmit((data) => {
    // Run custom validation if provided
    if (validate) {
      const validation_errors = validate(data);
      if (Object.keys(validation_errors).length > 0) {
        Object.entries(validation_errors).forEach(([field, message]) => {
          form_methods.setError(field, { type: "manual", message });
        });
        return;
      }
    }

    if (on_submit) {
      on_submit(data);
    }
  });

  // Determine if submit button should be shown
  const should_show_submit =
    show_submit_button !== undefined ? show_submit_button : mode === "edit" && !!on_submit;

  // Calculate panel sizes based on config
  const pdf_panel_size = parse_width_to_percent(pdf_panel_width || config.pdf_panel_width);
  const form_panel_size = 100 - pdf_panel_size;

  // Form content component (reused in both layouts)
  const form_content = (
    <FormProvider {...form_methods}>
      <form onSubmit={handle_submit} className="cls_form_container h-full overflow-auto">
        {schema.map((section) => (
          <SectionRenderer
            key={section.section_name}
            section={section}
            mode={mode}
            config={config}
            show_header={show_section_headers}
            show_sub_headers={show_sub_section_headers}
            collapsible={collapsible_sections}
            initially_collapsed={collapsed_sections.includes(section.section_name)}
            on_doc_link_click={handle_doc_link_click}
            errors={external_errors}
            upload_enabled={is_upload_enabled}
            form_values={form_methods.getValues()}
            on_upload_click={handle_upload_click}
          />
        ))}

        {should_show_submit && (
          <div className="cls_form_actions mt-6 pt-4 border-t">
            <Button
              type="submit"
              className="cls_submit_btn"
              disabled={form_methods.formState.isSubmitting}
            >
              {form_methods.formState.isSubmitting ? "Submitting..." : submit_button_text}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );

  // When file manager is open in SIDEBAR mode, use resizable layout
  if (is_doc_panel_open && show_pdf_panel && file_manager_display_mode === "sidebar") {
    // Build default layout based on panel position
    const default_layout = pdf_panel_position === "left"
      ? { "doc-panel": pdf_panel_size, "form-panel": form_panel_size }
      : { "form-panel": form_panel_size, "doc-panel": pdf_panel_size };

    return (
      <div className={cn("cls_hazo_data_form cls_hazo_data_form_with_pdf", class_name)}
        style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
      >
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-full"
          defaultLayout={default_layout}
        >
          {/* Form Panel - on left when doc panel is on right, vice versa */}
          {pdf_panel_position === "left" && (
            <>
              <ResizablePanel
                id="doc-panel"
                minSize={15}
              >
                <FileManager
                  files={file_manager_items}
                  is_open={is_doc_panel_open}
                  on_close={handle_doc_panel_close}
                  display_mode="sidebar"
                  config={config}
                  pdf_viewer_component={pdf_viewer_component}
                  on_pdf_save={on_pdf_save}
                  upload_enabled={doc_panel_upload_mode}
                  field_label={active_field_label}
                  field_id={active_field_id || undefined}
                  on_upload={is_upload_enabled ? handle_panel_upload : undefined}
                  on_delete={is_upload_enabled ? handle_panel_delete : undefined}
                  on_popout={on_file_popout}
                  enable_file_conversion={enable_file_conversion}
                  on_file_convert={on_file_convert}
                />
              </ResizablePanel>
              <ResizableHandle withHandle={pdf_panel_resizable} />
              <ResizablePanel
                id="form-panel"
                minSize={30}
              >
                {form_content}
              </ResizablePanel>
            </>
          )}

          {pdf_panel_position === "right" && (
            <>
              <ResizablePanel
                id="form-panel"
                minSize={30}
              >
                {form_content}
              </ResizablePanel>
              <ResizableHandle withHandle={pdf_panel_resizable} />
              <ResizablePanel
                id="doc-panel"
                minSize={15}
              >
                <FileManager
                  files={file_manager_items}
                  is_open={is_doc_panel_open}
                  on_close={handle_doc_panel_close}
                  display_mode="sidebar"
                  config={config}
                  pdf_viewer_component={pdf_viewer_component}
                  on_pdf_save={on_pdf_save}
                  upload_enabled={doc_panel_upload_mode}
                  field_label={active_field_label}
                  field_id={active_field_id || undefined}
                  on_upload={is_upload_enabled ? handle_panel_upload : undefined}
                  on_delete={is_upload_enabled ? handle_panel_delete : undefined}
                  on_popout={on_file_popout}
                  enable_file_conversion={enable_file_conversion}
                  on_file_convert={on_file_convert}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    );
  }

  // When file manager is in DIALOG mode, render form normally with dialog overlay
  // Or when file manager is closed, render form normally
  return (
    <div className={cn("cls_hazo_data_form", class_name)}>
      {form_content}

      {/* FileManagerDialog for dialog display mode */}
      {file_manager_display_mode === "dialog" && (
        <FileManagerDialog
          files={file_manager_items}
          is_open={is_doc_panel_open}
          on_close={handle_doc_panel_close}
          config={config}
          pdf_viewer_component={pdf_viewer_component}
          on_pdf_save={on_pdf_save}
          upload_enabled={doc_panel_upload_mode}
          field_label={active_field_label}
          field_id={active_field_id || undefined}
          on_upload={is_upload_enabled ? handle_panel_upload : undefined}
          on_delete={is_upload_enabled ? handle_panel_delete : undefined}
          on_popout={on_file_popout}
          enable_file_conversion={enable_file_conversion}
          on_file_convert={on_file_convert}
        />
      )}
    </div>
  );
}

// Re-export types
export type { HazoDataFormProps } from "./types";
