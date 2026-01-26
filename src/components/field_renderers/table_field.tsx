"use client";

import * as React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn, normalize_doc_links } from "../../lib/utils";
import { FileManagerButton } from "../file_manager_viewer";
import type { FieldRendererProps } from "../../lib/field_registry";
import type { TableColumn, DocLink } from "../../lib/types";

/**
 * Table row data can optionally include doc_links
 */
interface TableRowData extends Record<string, unknown> {
  doc_links?: DocLink[];
}

/**
 * Table Field Renderer
 * Handles array/table data with dynamic rows
 */
export function TableField({
  field,
  mode,
  value,
  error,
  config,
  on_change,
  on_doc_link_click,
  on_row_doc_link_click,
}: FieldRendererProps) {
  const is_view = mode === "view";
  const is_required = field.field_info.required;
  const has_doc_links = !!field.doc_links?.length;

  const columns = field.field_info.table_columns || [];
  const min_rows = field.field_info.table_min_rows ?? 0;
  const max_rows = field.field_info.table_max_rows ?? Infinity;

  // Ensure value is an array
  const rows: TableRowData[] = Array.isArray(value)
    ? value
    : value
    ? [value as TableRowData]
    : [];

  // Check if any row has doc_links
  const has_row_doc_links = rows.some((row) => row.doc_links?.length);

  // Check if any columns have subtotal enabled
  const has_subtotals = columns.some((col) => col.subtotal);

  // Calculate subtotals for columns that have subtotal: true
  const subtotals = React.useMemo(() => {
    const result: Record<string, number> = {};
    columns.forEach((col) => {
      if (col.subtotal) {
        result[col.id] = rows.reduce((sum, row) => {
          const val = row[col.id];
          const num = typeof val === "number" ? val : parseFloat(String(val));
          return sum + (isNaN(num) ? 0 : num);
        }, 0);
      }
    });
    return result;
  }, [columns, rows]);

  // Add a new row with default values from column definitions
  const handle_add_row = () => {
    if (rows.length >= max_rows) return;
    const new_row: Record<string, unknown> = {};
    columns.forEach((col) => {
      // Priority: column.default_value > column.field_info.default_value > ""
      const default_val =
        col.default_value !== undefined ? col.default_value :
        col.field_info.default_value !== undefined ? col.field_info.default_value :
        "";
      new_row[col.id] = default_val;
    });
    on_change([...rows, new_row]);
  };

  // Remove a row
  const handle_remove_row = (index: number) => {
    if (rows.length <= min_rows) return;
    const new_rows = rows.filter((_, i) => i !== index);
    on_change(new_rows);
  };

  // Update a cell value
  const handle_cell_change = (
    row_index: number,
    column_id: string,
    cell_value: unknown
  ) => {
    const new_rows = rows.map((row, i) => {
      if (i === row_index) {
        return { ...row, [column_id]: cell_value };
      }
      return row;
    });
    on_change(new_rows);
  };

  // Render cell value based on column type
  const render_cell = (
    row: Record<string, unknown>,
    row_index: number,
    column: TableColumn
  ) => {
    const cell_value = row[column.id];
    const string_value =
      cell_value !== undefined && cell_value !== null ? String(cell_value) : "";

    if (is_view) {
      return (
        <span
          className="flex items-center gap-1"
          style={{
            fontFamily: config.field_font_family,
            fontSize: config.field_font_size,
          }}
        >
          {string_value || "-"}
          {column.field_info.badge && (
            <span
              className="cls_cell_badge inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold rounded"
              style={{
                backgroundColor: config.badge_background,
                color: config.badge_text_color,
                minWidth: "20px",
              }}
            >
              {column.field_info.badge}
            </span>
          )}
        </span>
      );
    }

    const field_type = column.field_info.field_type;

    if (field_type === "option") {
      const options = column.field_info.options || [];
      return (
        <select
          value={string_value}
          onChange={(e) => handle_cell_change(row_index, column.id, e.target.value)}
          disabled={column.field_info.disabled}
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          style={{
            fontFamily: config.field_font_family,
            fontSize: config.field_font_size,
          }}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (field_type === "number" || field_type === "currency") {
      return (
        <Input
          type="number"
          value={string_value}
          onChange={(e) => {
            const val = e.target.value;
            const num = parseFloat(val);
            handle_cell_change(row_index, column.id, isNaN(num) ? val : num);
          }}
          disabled={column.field_info.disabled}
          placeholder={column.field_info.placeholder}
          className="h-9 text-right"
          style={{
            fontFamily: config.field_font_family,
            fontSize: config.field_font_size,
          }}
        />
      );
    }

    // Default to text input
    return (
      <Input
        type="text"
        value={string_value}
        onChange={(e) => handle_cell_change(row_index, column.id, e.target.value)}
        disabled={column.field_info.disabled}
        placeholder={column.field_info.placeholder}
        className="h-9"
        style={{
          fontFamily: config.field_font_family,
          fontSize: config.field_font_size,
        }}
      />
    );
  };

  const is_worksheet = field.field_info.is_worksheet;
  const table_title = field.field_info.table_title;

  return (
    <div
      className={cn("cls_field_container cls_table_field", !is_worksheet && "w-full")}
      style={{
        marginLeft: is_worksheet ? config.worksheet_indent : undefined,
        width: is_worksheet ? `calc(100% - ${config.worksheet_indent})` : undefined,
        maxWidth: is_worksheet ? `calc(100% - ${config.worksheet_indent})` : undefined,
        boxSizing: "border-box",
      }}
    >
      {table_title && (
        <p
          className="cls_table_title font-semibold mb-2"
          style={{
            color: config.label_color,
            fontFamily: config.label_font_family,
            fontSize: config.label_font_size,
          }}
        >
          {table_title}
        </p>
      )}
      {field.label && (
        <div
          className="cls_label_row flex items-center gap-2"
          style={{ marginBottom: config.label_field_gap }}
        >
          <Label
            className={cn("cls_field_label", is_required && "cls_required")}
            style={{
              color: config.label_color,
              fontFamily: config.label_font_family,
              fontSize: config.label_font_size,
              fontWeight: config.label_font_weight,
            }}
          >
            {field.label}
            {is_required && (
              <span
                className="cls_required_asterisk ml-1"
                style={{ color: config.label_color_required }}
              >
                *
              </span>
            )}
          </Label>
          {has_doc_links && on_doc_link_click && (
            <FileManagerButton
              file_count={field.doc_links!.length}
              has_files={true}
              on_click={on_doc_link_click}
              config={config}
            />
          )}
        </div>
      )}

      <div className="cls_table_wrapper border rounded-md overflow-hidden w-full">
        <table className="w-full" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr
              className="border-b"
              style={{ background: config.section_header_background }}
            >
              {columns.map((col) => {
                const is_numeric = col.field_info.field_type === "number" || col.field_info.field_type === "currency";
                return (
                  <th
                    key={col.id}
                    className={cn("px-3 py-2 font-medium", is_numeric ? "text-right" : "text-left")}
                    style={{
                      width: col.width,
                      fontFamily: config.label_font_family,
                      fontSize: config.label_font_size,
                      color: config.section_header_color,
                    }}
                  >
                    {col.label}
                    {col.field_info.required && (
                      <span
                        className="ml-1"
                        style={{ color: config.label_color_required }}
                      >
                        *
                      </span>
                    )}
                  </th>
                );
              })}
              {has_row_doc_links && <th className="w-10"></th>}
              {!is_view && <th className="w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (has_row_doc_links ? 1 : 0) + (is_view ? 0 : 1)}
                  className="px-3 py-4 text-center text-gray-500"
                >
                  No data
                </td>
              </tr>
            ) : (
              rows.map((row, row_index) => (
                <tr key={row_index} className="border-b last:border-b-0">
                  {columns.map((col) => (
                    <td key={col.id} className="px-3 py-2">
                      {render_cell(row, row_index, col)}
                    </td>
                  ))}
                  {has_row_doc_links && (
                    <td className="px-2 py-2">
                      {row.doc_links?.length && on_row_doc_link_click && (
                        <FileManagerButton
                          file_count={row.doc_links.length}
                          has_files={true}
                          on_click={() => on_row_doc_link_click(`${field.id}_row_${row_index}`, row.doc_links!)}
                          config={config}
                          tooltip_text={row.doc_links.length === 1 && row.doc_links[0].page ? `View document page ${row.doc_links[0].page}` : "View documents"}
                        />
                      )}
                    </td>
                  )}
                  {!is_view && (
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => handle_remove_row(row_index)}
                        disabled={rows.length <= min_rows}
                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Remove row"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {has_subtotals && rows.length > 0 && (
            <tfoot>
              <tr
                className="border-t-2"
                style={{ background: "#e5e7eb" }}
              >
                {columns.map((col, col_index) => {
                  const is_numeric = col.field_info.field_type === "number" || col.field_info.field_type === "currency";
                  return (
                    <td
                      key={col.id}
                      className={cn("py-2 font-semibold", is_numeric || col.subtotal ? "text-right" : "text-left")}
                      style={{
                        fontFamily: config.field_font_family,
                        fontSize: config.field_font_size,
                        color: "#111827",
                        paddingLeft: "0.75rem",
                        // Extra right padding for numeric columns to align with input field content
                        paddingRight: is_numeric || col.subtotal ? "1.5rem" : "0.75rem",
                      }}
                    >
                      {col.subtotal ? (
                        subtotals[col.id]?.toLocaleString(undefined, {
                          minimumFractionDigits: col.field_info.decimal_places ?? 2,
                          maximumFractionDigits: col.field_info.decimal_places ?? 2,
                        })
                      ) : col_index === 0 ? (
                        "Total"
                      ) : (
                        ""
                      )}
                    </td>
                  );
                })}
                {has_row_doc_links && <td className="w-10"></td>}
                {!is_view && <td className="w-10"></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {!is_view && (
        <button
          type="button"
          onClick={handle_add_row}
          disabled={rows.length >= max_rows}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Add Row
        </button>
      )}

      {error && (
        <p
          className="cls_error_message mt-1 text-sm"
          style={{ color: config.error_color }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
