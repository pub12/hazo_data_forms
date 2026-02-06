"use client";

import { useState, useMemo } from "react";
import {
  HazoDataForm,
  type FormSchema,
  type FormValues,
  type UploadedFile,
} from "hazo_data_forms";
import default_schema from "../../schemas/file-upload.schema.json";
import { create_client_file_manager } from "../../../lib/client_file_manager";

export default function FileUploadPage() {
  const [schema, set_schema] = useState<FormSchema>(default_schema as FormSchema);
  const [values, set_values] = useState<FormValues>({});
  const [is_schema_open, set_is_schema_open] = useState(false);
  const [schema_text, set_schema_text] = useState(() => JSON.stringify(default_schema, null, 2));
  const [schema_error, set_schema_error] = useState<string | null>(null);
  const [form_key, set_form_key] = useState(0);

  // Create file_manager adapter (memoized)
  const file_manager = useMemo(() => create_client_file_manager(), []);

  const handle_schema_save = () => {
    try {
      const parsed = JSON.parse(schema_text) as FormSchema;
      set_schema(parsed);
      set_schema_error(null);
      set_form_key((prev) => prev + 1);
    } catch (e) {
      set_schema_error(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handle_schema_reset = () => {
    set_schema_text(JSON.stringify(schema, null, 2));
    set_schema_error(null);
  };

  // Handle file view
  const handle_file_view = (field_id: string, uploaded_file: UploadedFile) => {
    // For non-PDF files, open in new tab
    // PDFs will be handled by the default behavior (opens in PDF panel)
    if (uploaded_file.mime_type !== "application/pdf") {
      window.open(uploaded_file.url, "_blank");
    }
    // For PDFs, we don't need to do anything - the default handler will open it in the panel
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">File Upload Demo</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrates the file upload feature. Each field row has an upload icon
          (unless it has a doc_link). Click the upload icon to open the upload dialog.
          After uploading, the icon changes to show uploaded files.
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800">Features demonstrated:</h3>
          <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Upload icon appears on fields without doc_link</li>
            <li>Drag-and-drop or click to select files</li>
            <li>Multiple file types supported (PDF, images)</li>
            <li>Multiple files per field (up to 5)</li>
            <li>File size validation (max 10MB)</li>
            <li>Uploaded files stored in form values</li>
            <li>View/delete uploaded files</li>
            <li>Fields with doc_link skip upload icon (see last section)</li>
          </ul>
        </div>
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
            Schema Editor
          </span>
          <span className="text-sm text-muted-foreground">
            {is_schema_open ? "Click to collapse" : "Click to expand"}
          </span>
        </button>

        {is_schema_open && (
          <div className="p-4 border-t space-y-3">
            <p className="text-sm text-muted-foreground">
              Edit the schema JSON below and click Save to update the form structure.
            </p>
            <textarea
              value={schema_text}
              onChange={(e) => {
                set_schema_text(e.target.value);
                set_schema_error(null);
              }}
              className="w-full h-96 font-mono text-sm p-3 border rounded-md bg-background resize-y"
              spellCheck={false}
            />
            {schema_error && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {schema_error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handle_schema_save}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={handle_schema_reset}
                className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border rounded-lg p-6">
        <HazoDataForm
          key={form_key}
          schema={schema}
          mode="edit"
          on_change={set_values}
          on_submit={(vals) => {
            console.log("Form submitted:", vals);
            alert("Form submitted! Check console for values.");
          }}
          show_submit_button={true}
          submit_button_text="Submit Form"
          show_pdf_panel={true}
          enable_file_upload={true}
          on_file_view={handle_file_view}
          file_save_path="/uploads"
          services={{ file_manager }}
          config_override={{
            file_upload: {
              enabled: true,
              allowed_types: ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"],
              max_file_size: 10 * 1024 * 1024, // 10MB
              max_files_per_field: 5,
              default_directory: "/uploads",
              upload_icon_color: "#6b7280",
              upload_hover_color: "#3b82f6",
            },
          }}
        />
      </div>

      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-2">Current Values (including uploaded files):</h3>
        <pre className="text-sm overflow-auto max-h-64">
          {JSON.stringify(values, null, 2)}
        </pre>
      </div>
    </div>
  );
}
