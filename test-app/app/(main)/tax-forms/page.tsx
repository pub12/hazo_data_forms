"use client";

import { useState, useMemo } from "react";
import {
  HazoDataForm,
  type FormSchema,
  type FormValues,
  type FormMode,
  type FileUploadRequest,
  type FileUploadResult,
  type UploadedFile,
  type FileManagerPopoutContext,
} from "hazo_data_forms";
import { PdfViewer } from "hazo_pdf";
import "hazo_pdf/styles.css";

// Import all tax form schemas
import page_01 from "../../../schemas/tax_form_page_01.json";
import page_02 from "../../../schemas/tax_form_page_02.json";
import page_03 from "../../../schemas/tax_form_page_03.json";
import page_04 from "../../../schemas/tax_form_page_04.json";
import page_05 from "../../../schemas/tax_form_page_05.json";
import page_06 from "../../../schemas/tax_form_page_06.json";
import page_07 from "../../../schemas/tax_form_page_07.json";
import page_08 from "../../../schemas/tax_form_page_08.json";
import page_09 from "../../../schemas/tax_form_page_09.json";
import page_10 from "../../../schemas/tax_form_page_10.json";
import page_11 from "../../../schemas/tax_form_page_11.json";
import page_12 from "../../../schemas/tax_form_page_12.json";
import page_13 from "../../../schemas/tax_form_page_13.json";
import page_14 from "../../../schemas/tax_form_page_14.json";
import page_15 from "../../../schemas/tax_form_page_15.json";

const TAX_FORM_PAGES = [
  { num: 1, label: "Your Details", schema: page_01 },
  { num: 2, label: "Residency & Spouse", schema: page_02 },
  { num: 3, label: "Income", schema: page_03 },
  { num: 4, label: "Deductions", schema: page_04 },
  { num: 5, label: "Losses", schema: page_05 },
  { num: 6, label: "Income Tests", schema: page_06 },
  { num: 7, label: "Tax Offsets", schema: page_07 },
  { num: 8, label: "Medicare Levy", schema: page_08 },
  { num: 9, label: "Adjustments", schema: page_09 },
  { num: 10, label: "Spouse Details", schema: page_10 },
  { num: 11, label: "Supplementary", schema: page_11 },
  { num: 12, label: "Capital Gains Tax Schedule", schema: page_12 },
  { num: 13, label: "Rental Schedule", schema: page_13 },
  { num: 14, label: "Capital Gains Tax Worksheet", schema: page_14 },
  { num: 15, label: "Managed Fund Worksheet", schema: page_15 },
];

export default function TaxFormsPage() {
  const [current_page, set_current_page] = useState(1);
  const [mode, set_mode] = useState<FormMode>("edit");
  const [all_values, set_all_values] = useState<FormValues>({});
  const [is_schema_open, set_is_schema_open] = useState(false);

  const current_page_data = TAX_FORM_PAGES.find((p) => p.num === current_page);
  const schema = (current_page_data?.schema || page_01) as FormSchema;
  const schema_text = useMemo(() => JSON.stringify(schema, null, 2), [schema]);

  const handle_pdf_save = async (pdf_bytes: Uint8Array, _filename: string, original_url: string) => {
    try {
      const form_data = new FormData();
      // Create a new Uint8Array copy to ensure it's not backed by SharedArrayBuffer
      const safe_bytes = new Uint8Array(pdf_bytes);
      const blob = new Blob([safe_bytes as BlobPart], { type: "application/pdf" });
      form_data.append("pdf", blob, "document.pdf");
      form_data.append("original_url", original_url);

      const response = await fetch("/api/save-pdf", {
        method: "POST",
        body: form_data,
      });

      const result = await response.json();
      if (!result.success) {
        console.error("Failed to save PDF:", result.error);
      }
    } catch (error) {
      console.error("Error saving PDF:", error);
    }
  };

  const handle_page_change = (page_num: number) => {
    set_current_page(page_num);
    set_is_schema_open(false);
  };

  // File upload handler
  const handle_file_upload = async (request: FileUploadRequest): Promise<FileUploadResult> => {
    try {
      const form_data = new FormData();
      form_data.append("file", request.file);
      form_data.append("field_id", request.field_id);
      form_data.append("field_label", request.field_label);
      if (request.section_name) {
        form_data.append("section_name", request.section_name);
      }
      if (request.sub_section_id) {
        form_data.append("sub_section_id", request.sub_section_id);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: form_data,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  };

  // File deletion handler
  const handle_file_delete = async (field_id: string, file_id: string): Promise<boolean> => {
    try {
      const uploads_key = `${field_id}__uploads`;
      const uploads = (all_values[uploads_key] as UploadedFile[]) || [];
      const file = uploads.find((u) => u.file_id === file_id);

      const params = new URLSearchParams({
        field_id,
        file_id,
        ...(file?.filename && { filename: file.filename }),
      });

      const response = await fetch(`/api/upload?${params}`, {
        method: "DELETE",
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  };

  // File view handler
  const handle_file_view = (field_id: string, uploaded_file: UploadedFile) => {
    if (uploaded_file.mime_type !== "application/pdf") {
      window.open(uploaded_file.url, "_blank");
    }
    // PDFs will be handled by the default behavior (opens in PDF panel)
  };

  // File popout handler - opens FileManager in new tab
  const handle_file_popout = (context: FileManagerPopoutContext) => {
    // Store context in sessionStorage for the popout page to read
    sessionStorage.setItem("file_viewer_context", JSON.stringify(context));
    // Open the popout page in a new tab
    window.open("/file-viewer", "_blank");
  };

  const handle_values_change = (new_values: FormValues) => {
    set_all_values((prev) => ({ ...prev, ...new_values }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Australian Individual Tax Return 2024</h1>
        <p className="text-muted-foreground mt-2">
          Complete tax return form. Navigate between pages using the pagination below.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-4 items-center">
        <span className="text-sm font-medium">Mode:</span>
        <div className="flex border rounded-md overflow-hidden">
          <button
            onClick={() => set_mode("edit")}
            className={`px-4 py-2 text-sm ${
              mode === "edit"
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted"
            }`}
          >
            Edit Mode
          </button>
          <button
            onClick={() => set_mode("view")}
            className={`px-4 py-2 text-sm ${
              mode === "view"
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted"
            }`}
          >
            View Mode
          </button>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-3">Pages</h3>
        <div className="flex flex-wrap gap-2">
          {TAX_FORM_PAGES.map((page) => (
            <button
              key={page.num}
              onClick={() => handle_page_change(page.num)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                current_page === page.num
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border"
              }`}
              title={page.label}
            >
              {page.num}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Current: Page {current_page} - {current_page_data?.label}
        </p>
      </div>

      {/* Collapsible Schema Editor */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => set_is_schema_open(!is_schema_open)}
          className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted/70 transition-colors text-left"
        >
          <span className="font-semibold flex items-center gap-2">
            <svg
              className={`w-4 h-4 transition-transform ${is_schema_open ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Schema Viewer (Page {current_page})
          </span>
          <span className="text-sm text-muted-foreground">
            {is_schema_open ? "Click to collapse" : "Click to expand"}
          </span>
        </button>

        {is_schema_open && (
          <div className="p-4 border-t space-y-3">
            <p className="text-sm text-muted-foreground">
              View the schema JSON for the current page. Schema files are located in test-app/schemas/tax_form_page_*.json
            </p>
            <textarea
              value={schema_text}
              readOnly
              className="w-full h-96 font-mono text-sm p-3 border rounded-md bg-muted/50 resize-y"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Form Rendering */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Page {current_page}: {current_page_data?.label}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => handle_page_change(Math.max(1, current_page - 1))}
              disabled={current_page === 1}
              className="px-3 py-1 text-sm border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handle_page_change(Math.min(TAX_FORM_PAGES.length, current_page + 1))}
              disabled={current_page === TAX_FORM_PAGES.length}
              className="px-3 py-1 text-sm border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        <HazoDataForm
          key={`page-${current_page}-${mode}`}
          schema={schema}
          mode={mode}
          values={all_values}
          on_change={handle_values_change}
          collapsible_sections={true}
          show_submit_button={current_page === TAX_FORM_PAGES.length && mode === "edit"}
          submit_button_text="Submit Tax Return"
          pdf_viewer_component={PdfViewer}
          on_pdf_save={handle_pdf_save}
          enable_file_upload={true}
          on_file_upload={handle_file_upload}
          on_file_delete={handle_file_delete}
          on_file_view={handle_file_view}
          on_file_popout={handle_file_popout}
          config_override={{
            pdf_panel_width: "50vw",
            pdf_panel_min_width: "400px",
            pdf_panel_max_width: "80vw",
            file_upload: {
              enabled: true,
              allowed_types: ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"],
              max_file_size: 10 * 1024 * 1024,
              max_files_per_field: 5,
              default_directory: "/uploads",
              upload_icon_color: "#6b7280",
              upload_hover_color: "#3b82f6",
            },
          }}
          on_submit={(vals) => {
            console.log("Tax return submitted:", vals);
            alert("Tax return submitted! Check console for all values.");
          }}
        />
      </div>

      {/* Current Values Debug */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-2">All Form Values (Debug):</h3>
        <pre className="text-sm overflow-auto max-h-64 bg-background p-3 rounded-md border">
          {JSON.stringify(all_values, null, 2)}
        </pre>
      </div>
    </div>
  );
}
