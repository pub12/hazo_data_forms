"use client";

import { useState } from "react";
import { HazoDataForm, type FormSchema, type FormMode } from "hazo_data_forms";
import default_schema from "../../../schemas/edit-vs-view.schema.json";

export default function EditVsViewPage() {
  const [schema, set_schema] = useState<FormSchema>(default_schema as FormSchema);
  const [mode, set_mode] = useState<FormMode>("view");
  const [is_schema_open, set_is_schema_open] = useState(false);
  const [schema_text, set_schema_text] = useState(() => JSON.stringify(default_schema, null, 2));
  const [schema_error, set_schema_error] = useState<string | null>(null);
  const [form_key, set_form_key] = useState(0);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit vs View Mode</h1>
        <p className="text-muted-foreground mt-2">
          Toggle between edit mode (editable form fields) and view mode
          (read-only display like a printed document).
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">
            Current Mode: {mode === "edit" ? "Edit" : "View"}
          </h3>
          <div className="border rounded-lg p-6">
            <HazoDataForm
              key={`${form_key}-${mode}`}
              schema={schema}
              mode={mode}
              show_submit_button={mode === "edit"}
              on_submit={(values) => {
                console.log("Submitted:", values);
                alert("Form submitted!");
              }}
            />
          </div>
        </div>

        <div className="hidden lg:block">
          <h3 className="font-semibold mb-3">
            Comparison: {mode === "edit" ? "View" : "Edit"} Mode
          </h3>
          <div className="border rounded-lg p-6 opacity-60">
            <HazoDataForm
              key={`${form_key}-${mode === "edit" ? "view" : "edit"}`}
              schema={schema}
              mode={mode === "edit" ? "view" : "edit"}
              show_submit_button={mode !== "edit"}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-2">Mode Differences:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Edit Mode:</h4>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>Input fields are editable</li>
              <li>Validation is active</li>
              <li>Submit button is shown</li>
              <li>Form borders and focus states</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">View Mode:</h4>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>Values displayed as text</li>
              <li>Read-only presentation</li>
              <li>No submit button</li>
              <li>Clean document-like appearance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
