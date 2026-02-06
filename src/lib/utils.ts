import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DocLink, DocLinkType, FieldUploads, FormValues, UploadedFile } from "./types";

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Parse a boolean value from string
 */
export function parse_boolean(
  value: string | undefined,
  default_value: boolean
): boolean {
  if (value === undefined || value === null || value === "") {
    return default_value;
  }
  const lower = value.toLowerCase().trim();
  if (lower === "true" || lower === "yes" || lower === "1") {
    return true;
  }
  if (lower === "false" || lower === "no" || lower === "0") {
    return false;
  }
  return default_value;
}

/**
 * Parse a number value from string
 */
export function parse_number(
  value: string | undefined,
  default_value: number
): number {
  if (value === undefined || value === null || value === "") {
    return default_value;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? default_value : parsed;
}

/**
 * Parse a string value with default
 */
export function parse_string(
  value: string | undefined,
  default_value: string
): string {
  if (value === undefined || value === null || value === "") {
    return default_value;
  }
  return value;
}

/**
 * Format a number as currency
 */
export function format_currency(
  value: number,
  symbol: string = "$",
  decimal_places: number = 2
): string {
  const formatted = value.toFixed(decimal_places);
  const parts = formatted.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${symbol}${parts.join(".")}`;
}

/**
 * Format a number as percentage
 */
export function format_percentage(
  value: number,
  decimal_places: number = 2,
  suffix: string = "%"
): string {
  return `${value.toFixed(decimal_places)}${suffix}`;
}

/**
 * Format a date value for display
 */
export function format_date(
  value: string | Date,
  format: string = "MMM d, yyyy"
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) {
    return "";
  }

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const full_months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  return format
    .replace("MMMM", full_months[month])
    .replace("MMM", months[month])
    .replace("MM", String(month + 1).padStart(2, "0"))
    .replace("dd", String(day).padStart(2, "0"))
    .replace("d", String(day))
    .replace("yyyy", String(year))
    .replace("yy", String(year).slice(-2));
}

/**
 * Sanitize a filename for safe storage paths
 * Removes or replaces characters that are unsafe in file paths
 */
export function sanitize_filename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_") // Replace unsafe characters
    .replace(/\.{2,}/g, ".") // Collapse multiple dots
    .replace(/^[\s.]+|[\s.]+$/g, "") // Trim leading/trailing spaces and dots
    .slice(0, 255); // Limit length
}

/**
 * Generate a unique ID
 */
export function generate_id(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Deep merge two objects
 */
export function deep_merge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const source_value = source[key];
      const target_value = target[key];

      if (
        typeof source_value === "object" &&
        source_value !== null &&
        !Array.isArray(source_value) &&
        typeof target_value === "object" &&
        target_value !== null &&
        !Array.isArray(target_value)
      ) {
        result[key] = deep_merge(
          target_value as Record<string, unknown>,
          source_value as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else if (source_value !== undefined) {
        result[key] = source_value as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Evaluate TABLE_SUM function
 * Syntax: TABLE_SUM(table_id, sum_column, filter_column, filter_value)
 * Returns the sum of sum_column values where filter_column equals filter_value
 */
function evaluate_table_sum(
  args: string[],
  values: Record<string, unknown>
): number | null {
  if (args.length !== 4) {
    console.warn("TABLE_SUM requires 4 arguments: table_id, sum_column, filter_column, filter_value");
    return null;
  }

  const [table_id, sum_column, filter_column, filter_value] = args.map(a => a.trim());
  const table_data = values[table_id];

  if (!Array.isArray(table_data)) {
    return null;
  }

  let sum = 0;
  for (const row of table_data) {
    if (typeof row === "object" && row !== null) {
      const row_obj = row as Record<string, unknown>;
      const row_filter_value = String(row_obj[filter_column]).toLowerCase();
      const target_filter_value = filter_value.toLowerCase();
      // Check if filter matches
      if (row_filter_value === target_filter_value) {
        const val = row_obj[sum_column];
        const num = typeof val === "number" ? val : parseFloat(String(val));
        if (!isNaN(num)) {
          sum += num;
        }
      }
    }
  }

  return sum;
}

/**
 * Safely evaluate a computed formula
 * Supports basic arithmetic operations and TABLE_SUM function for security
 *
 * Supported functions:
 * - TABLE_SUM(table_id, sum_column, filter_column, filter_value)
 *   Sums values from a table column where another column matches a filter value
 */
export function evaluate_formula(
  formula: string,
  values: Record<string, unknown>
): number | null {
  try {
    // Replace field references with their values
    let expression = formula;

    // First, process TABLE_SUM functions
    if (formula.includes("TABLE_SUM")) {
      const table_sum_regex = /TABLE_SUM\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi;
      expression = expression.replace(table_sum_regex, (match, table_id, sum_col, filter_col, filter_val) => {
        const result = evaluate_table_sum([table_id, sum_col, filter_col, filter_val], values);
        return result !== null ? String(result) : "0";
      });
    }

    // Find all remaining field references (alphanumeric with underscores)
    // But skip keywords that might appear in function names
    const field_refs = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];

    for (const ref of field_refs) {
      // Skip if it looks like a function name we already processed
      if (ref.toUpperCase() === "TABLE_SUM") continue;

      const value = values[ref];
      if (typeof value === "number") {
        expression = expression.replace(new RegExp(`\\b${ref}\\b`, "g"), String(value));
      } else if (typeof value === "string" && !isNaN(parseFloat(value))) {
        expression = expression.replace(new RegExp(`\\b${ref}\\b`, "g"), value);
      } else if (value === undefined || value === null || value === "") {
        // Treat undefined/null/empty as 0 for calculations
        expression = expression.replace(new RegExp(`\\b${ref}\\b`, "g"), "0");
      } else {
        // If any referenced field is not a number, return null
        return null;
      }
    }

    // Validate that expression only contains safe characters
    if (!/^[\d\s+\-*/().]+$/.test(expression)) {
      console.warn("Invalid formula expression:", expression);
      return null;
    }

    // Evaluate the expression
    // Using Function constructor is safe here because we've validated the input
    const result = new Function(`return (${expression})`)();
    return typeof result === "number" && !isNaN(result) ? result : null;
  } catch (error) {
    console.warn("Formula evaluation error:", error);
    return null;
  }
}

/**
 * Get the uploads key for a field ID
 * Uploads are stored with __uploads suffix in form values
 */
export function get_uploads_key(field_id: string): string {
  return `${field_id}__uploads`;
}

/**
 * Extract uploads from form values for a field
 */
export function get_field_uploads(
  values: FormValues,
  field_id: string
): FieldUploads {
  const key = get_uploads_key(field_id);
  return (values[key] as FieldUploads) || [];
}

/**
 * Check if field has uploads
 */
export function has_field_uploads(
  values: FormValues,
  field_id: string
): boolean {
  return get_field_uploads(values, field_id).length > 0;
}

/**
 * Generate a unique file ID for uploads
 */
export function generate_file_id(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Format file size for display
 */
export function format_file_size(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Check if a MIME type matches an allowed type pattern
 * Supports wildcards like "image/*"
 */
export function is_mime_type_allowed(
  mime_type: string,
  allowed_types: string[]
): boolean {
  return allowed_types.some((pattern) => {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -1);
      return mime_type.startsWith(prefix);
    }
    return mime_type === pattern;
  });
}

/**
 * Extract filename from URL or path
 * @param url The URL or file path
 * @returns The filename, or "Document" if extraction fails
 */
export function extract_filename_from_url(url: string): string {
  try {
    // Handle both URLs and file paths
    const path = url.includes("://")
      ? new URL(url).pathname
      : url;

    // Get the last segment after /
    const segments = path.split("/").filter(Boolean);
    const filename = segments[segments.length - 1];

    if (!filename) {
      return "Document";
    }

    // Decode URI component for special characters
    return decodeURIComponent(filename);
  } catch {
    return "Document";
  }
}

/**
 * Normalize doc_links to always return an array (handles undefined)
 */
export function normalize_doc_links(doc_links?: DocLink[]): DocLink[] {
  return doc_links ?? [];
}

/**
 * Infer DocLinkType from MIME type
 */
export function infer_doc_link_type_from_mime(mime_type: string): DocLinkType {
  if (mime_type === "application/pdf") return "pdf";
  if (mime_type.startsWith("image/")) return "image";
  if (
    mime_type.includes("word") ||
    mime_type.includes("excel") ||
    mime_type.includes("powerpoint") ||
    mime_type.includes("spreadsheet") ||
    mime_type.includes("presentation") ||
    mime_type === "text/plain" ||
    mime_type === "text/csv"
  ) {
    return "document";
  }
  return "other";
}

/**
 * Convert UploadedFile to DocLink for display in DocPanel
 */
export function uploaded_file_to_doc_link(upload: UploadedFile): DocLink {
  const type = infer_doc_link_type_from_mime(upload.mime_type);
  return {
    type,
    url: upload.url,
    filename: upload.filename,
    page: upload.page,
    file_id: upload.file_id,
  };
}

/**
 * Convert array of UploadedFiles to DocLinks
 */
export function uploads_to_doc_links(uploads: UploadedFile[]): DocLink[] {
  return uploads.map(uploaded_file_to_doc_link);
}
