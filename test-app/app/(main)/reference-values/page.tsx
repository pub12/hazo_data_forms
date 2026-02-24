"use client";

import { useState } from "react";
import { HazoDataForm, type FormSchema, type FormValues } from "hazo_data_forms";
import default_schema from "@/schemas/reference-values.schema.json";

export default function ReferenceValuesPage() {
  const [values, set_values] = useState<FormValues>({});
  const [mode, set_mode] = useState<"edit" | "view">("edit");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reference Values Demo</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrates the <code className="text-sm bg-muted px-1 py-0.5 rounded">reference_value</code> property
          on form fields. Reference values display below the input as a read-only annotation
          (italic, smaller font, grey background) — useful for prior-year values, benchmarks,
          or expected values.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => set_mode("edit")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            mode === "edit"
              ? "bg-primary text-primary-foreground"
              : "border hover:bg-muted"
          }`}
        >
          Edit Mode
        </button>
        <button
          onClick={() => set_mode("view")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            mode === "view"
              ? "bg-primary text-primary-foreground"
              : "border hover:bg-muted"
          }`}
        >
          View Mode
        </button>
      </div>

      <div className="border rounded-lg p-6">
        <HazoDataForm
          schema={default_schema as FormSchema}
          mode={mode}
          values={values}
          on_change={set_values}
          on_submit={(vals) => {
            console.log("Form submitted:", vals);
            alert("Form submitted! Check console for values.");
          }}
          show_submit_button={mode === "edit"}
          submit_button_text="Submit Form"
        />
      </div>

      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-2">Current Values:</h3>
        <pre className="text-sm overflow-auto max-h-64">
          {JSON.stringify(values, null, 2)}
        </pre>
      </div>
    </div>
  );
}
