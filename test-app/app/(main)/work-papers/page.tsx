"use client";

import { useState, useMemo } from "react";
import {
  HazoDataForm,
  type FormSchema,
  type FormValues,
  type FormMode,
  type UploadedFile,
  type FileManagerPopoutContext,
} from "hazo_data_forms";
import { PdfViewer } from "hazo_pdf";
import "hazo_pdf/styles.css";
import { create_client_file_manager } from "@/lib/client_file_manager";

// Import all work paper schemas
import wp_01_personal_details from "@/schemas/wp_01_personal_details.json";
import wp_02_income from "@/schemas/wp_02_income.json";
import wp_03_deductions from "@/schemas/wp_03_deductions.json";

const WORK_PAPER_PAGES = [
  { num: 1, label: "Personal Details", schema: wp_01_personal_details },
  { num: 2, label: "Income", schema: wp_02_income },
  { num: 3, label: "Deductions", schema: wp_03_deductions },
];

export default function WorkPapersPage() {
  const [current_page, set_current_page] = useState(1);
  const [mode, set_mode] = useState<FormMode>("edit");
  const [all_values, set_all_values] = useState<FormValues>({});
  const [is_schema_open, set_is_schema_open] = useState(false);

  // Create file_manager adapter (memoized)
  const file_manager = useMemo(() => create_client_file_manager(), []);

  const current_page_data = WORK_PAPER_PAGES.find((p) => p.num === current_page);
  const schema = (current_page_data?.schema || wp_01_personal_details) as FormSchema;
  const schema_text = useMemo(() => JSON.stringify(schema, null, 2), [schema]);

  const handle_page_change = (page_num: number) => {
    set_current_page(page_num);
    set_is_schema_open(false);
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
        <h1 className="text-2xl font-bold">Work Papers</h1>
        <p className="text-muted-foreground mt-2">
          Complete work paper forms. Navigate between pages using the pagination below.
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
        <h3 className="font-semibold mb-3">Work Papers</h3>
        <div className="flex flex-wrap gap-2">
          {WORK_PAPER_PAGES.map((page) => (
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
              WP {page.num}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Current: WP {current_page} - {current_page_data?.label}
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
            Schema Viewer (WP {current_page})
          </span>
          <span className="text-sm text-muted-foreground">
            {is_schema_open ? "Click to collapse" : "Click to expand"}
          </span>
        </button>

        {is_schema_open && (
          <div className="p-4 border-t space-y-3">
            <p className="text-sm text-muted-foreground">
              View the schema JSON for the current work paper. Schema files are located in test-app/schemas/wp_*.json
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
            WP {current_page}: {current_page_data?.label}
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
              onClick={() => handle_page_change(Math.min(WORK_PAPER_PAGES.length, current_page + 1))}
              disabled={current_page === WORK_PAPER_PAGES.length}
              className="px-3 py-1 text-sm border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        <HazoDataForm
          key={`wp-${current_page}-${mode}`}
          schema={schema}
          mode={mode}
          values={all_values}
          on_change={handle_values_change}
          collapsible_sections={true}
          show_submit_button={current_page === WORK_PAPER_PAGES.length && mode === "edit"}
          submit_button_text="Submit Work Papers"
          pdf_viewer_component={PdfViewer as any}
          enable_file_upload={true}
          on_file_view={handle_file_view}
          on_file_popout={handle_file_popout}
          file_save_path="/uploads/work-papers"
          pdf_save_path="/uploads/work-papers/pdfs"
          services={{ file_manager }}
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
            console.log("Work papers submitted:", vals);
            alert("Work papers submitted! Check console for all values.");
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
