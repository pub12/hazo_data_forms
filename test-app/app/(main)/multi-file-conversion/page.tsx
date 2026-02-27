"use client";

import { useState } from "react";
import {
  HazoDataForm,
  type FormSchema,
  type FormValues,
  is_potentially_convertible,
  CONVERTIBLE_MIME_TYPES,
} from "hazo_data_forms";

// Simple schema to demonstrate multi-file and conversion features
const demo_schema: FormSchema = [
  {
    section_name: "Contract Details",
    sub_sections: [
      {
        sub_section_id: "contract_info",
        sub_section_label: "Contract Information",
        field_group: {
          orientation: "vertical",
          fields: [
            {
              id: "contract_name",
              label: "Contract Name",
              field_info: {
                field_type: "text",
                required: true,
              },
              doc_links: [
                {
                  type: "pdf",
                  url: "/sample.pdf",
                  filename: "Contract Document.pdf",
                },
                {
                  type: "image",
                  url: "/images/sample-chart.png",
                  filename: "Financial Chart.png",
                },
              ],
            },
            {
              id: "contract_value",
              label: "Contract Value",
              field_info: {
                field_type: "currency",
                required: true,
              },
              doc_links: [{
                type: "pdf",
                url: "/sample.pdf",
                page: 3,
                filename: "Pricing Page.pdf",
              }],
            },
            {
              id: "contract_date",
              label: "Contract Date",
              field_info: {
                field_type: "date",
                required: true,
              },
            },
          ],
        },
      },
    ],
  },
  {
    section_name: "Supporting Documents",
    sub_sections: [
      {
        sub_section_id: "attachments",
        sub_section_label: "Attachments",
        field_group: {
          orientation: "vertical",
          fields: [
            {
              id: "spreadsheet",
              label: "Financial Data",
              field_info: {
                field_type: "text",
                placeholder: "Excel file with financial projections",
              },
              doc_links: [{
                type: "other",
                url: "/files/financials.xlsx",
                filename: "Financial Projections.xlsx",
              }],
            },
            {
              id: "notes",
              label: "Meeting Notes",
              field_info: {
                field_type: "text",
                placeholder: "Text file with notes",
              },
              doc_links: [{
                type: "other",
                url: "/files/notes.txt",
                filename: "Meeting Notes.txt",
              }],
            },
          ],
        },
      },
    ],
  },
];

export default function MultiFileConversionPage() {
  const [values, set_values] = useState<FormValues>({});
  const [conversion_log, set_conversion_log] = useState<string[]>([]);

  // Handle file conversion
  const handle_file_convert = (pdf_bytes: Uint8Array, original_filename: string) => {
    const log_entry = `Converted "${original_filename}" to PDF (${pdf_bytes.length} bytes)`;
    set_conversion_log((prev) => [...prev, log_entry]);
    console.log("File converted:", original_filename, pdf_bytes.length, "bytes");

    // In a real app, you might:
    // 1. Display the converted PDF in a viewer
    // 2. Save it to the server
    // 3. Download it to the user's computer
    const blob = new Blob([pdf_bytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Multi-File & Conversion Demo</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrates the new hazo_pdf v1.3.2 features: multi-file support and
          file conversion to PDF.
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-muted/30">
          <h3 className="font-semibold mb-2">Multi-File Support</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• View multiple files in the PDF panel</li>
            <li>• Switch between files with tabs or dropdown</li>
            <li>• Fields can have multiple doc_links</li>
          </ul>
        </div>
        <div className="border rounded-lg p-4 bg-muted/30">
          <h3 className="font-semibold mb-2">File Conversion</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Convert images to PDF for viewing</li>
            <li>• Convert text files (.txt, .md) to PDF</li>
            <li>• Convert Excel files (.xlsx) to PDF</li>
          </ul>
        </div>
      </div>

      {/* Supported Conversion Types */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Supported File Types for Conversion</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-600 mb-1">Images</h4>
            <ul className="text-muted-foreground">
              {CONVERTIBLE_MIME_TYPES.image.map((type) => (
                <li key={type}>• {type}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-600 mb-1">Text Files</h4>
            <ul className="text-muted-foreground">
              {CONVERTIBLE_MIME_TYPES.text.map((type) => (
                <li key={type}>• {type}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-600 mb-1">Spreadsheets</h4>
            <ul className="text-muted-foreground">
              {CONVERTIBLE_MIME_TYPES.excel.map((type) => (
                <li key={type}>• {type.split(".").pop()}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Form */}
      <div className="border rounded-lg p-6 min-h-[600px] relative overflow-hidden">
        <HazoDataForm
          schema={demo_schema}
          mode="edit"
          on_change={set_values}
          show_pdf_panel={true}
          pdf_panel_position="right"
          pdf_panel_resizable={true}
          enable_file_conversion={true}
          on_file_convert={handle_file_convert}
        />
      </div>

      {/* Conversion Log */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-2">Conversion Log:</h3>
        {conversion_log.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Click "Convert to PDF" on an image or supported file to see conversion events here.
          </p>
        ) : (
          <ul className="text-sm space-y-1 font-mono">
            {conversion_log.map((entry, i) => (
              <li key={i} className="text-green-600">✓ {entry}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Usage Code Example */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Usage Example</h3>
        <pre className="text-sm bg-muted/50 p-4 rounded overflow-x-auto">
{`import { HazoDataForm } from "hazo_data_forms";

<HazoDataForm
  schema={schema}
  mode="edit"
  show_pdf_panel={true}
  // Enable file conversion (new in hazo_pdf 1.3.2)
  enable_file_conversion={true}
  on_file_convert={(pdf_bytes, original_filename) => {
    // Handle the converted PDF
    console.log("Converted:", original_filename);
    // Save to server, display in viewer, or download
  }}
/>`}
        </pre>
      </div>

      {/* Form Values Debug */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-2">Form Values:</h3>
        <pre className="text-sm overflow-auto max-h-48">
          {JSON.stringify(values, null, 2)}
        </pre>
      </div>
    </div>
  );
}
