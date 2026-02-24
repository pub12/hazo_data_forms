"use client";

/**
 * ReferenceValue
 * Displays an optional reference annotation below a field input.
 * Used for prior-year values, benchmarks, or expected values.
 */
export function ReferenceValue({ value }: { value: string }) {
  return (
    <div
      className="cls_reference_value mt-1 text-xs italic px-2 py-0.5 rounded"
      style={{ backgroundColor: "var(--muted, #f1f5f9)", color: "#6b7280" }}
    >
      Ref: {value}
    </div>
  );
}
