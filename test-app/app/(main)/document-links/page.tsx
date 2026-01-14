"use client";

import { useState } from "react";
import { HazoDataForm, type FormSchema, type FormValues, type DocLinkClickEvent } from "hazo_data_forms";
import default_schema from "../../schemas/document-links.schema.json";

export default function DocumentLinksPage() {
  const [schema, set_schema] = useState<FormSchema>(default_schema as FormSchema);
  const [values, set_values] = useState<FormValues>({});
  const [click_log, set_click_log] = useState<DocLinkClickEvent[]>([]);
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

  const handle_doc_link_click = (event: DocLinkClickEvent) => {
    set_click_log((prev) => [...prev, event]);
    console.log("Doc link clicked:", event);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Document Links Demo</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrates document links on fields. Click the document icon next to
          a field to open the PDF viewer panel. The panel opens within the form
          container.
        </p>
        <p className="text-sm text-amber-600 mt-2">
          Note: For this demo to work with real PDFs, place a sample.pdf file in
          the public folder. The PDF panel will show a placeholder if hazo_pdf
          is not installed.
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

      <div className="border rounded-lg p-6 min-h-[600px] relative overflow-hidden">
        <HazoDataForm
          key={form_key}
          schema={schema}
          mode="edit"
          on_change={set_values}
          on_doc_link_click={handle_doc_link_click}
          show_pdf_panel={true}
          pdf_panel_position="right"
          pdf_panel_resizable={true}
        />
      </div>

      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-2">Doc Link Click Log:</h3>
        {click_log.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Click a document icon to see events here.
          </p>
        ) : (
          <ul className="text-sm space-y-1">
            {click_log.map((event, i) => (
              <li key={i} className="font-mono">
                Field: {event.field_id}, URL: {event.doc_link?.url ?? event.doc_links[0]?.url}
                {event.doc_link?.page && `, Page: ${event.doc_link.page}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
