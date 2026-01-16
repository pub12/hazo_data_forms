"use client";

/**
 * hazo_pdf Re-exports Module
 *
 * This module provides async access to hazo_pdf conversion utilities.
 * Using dynamic imports ensures hazo_pdf remains optional and is only
 * loaded when conversion features are actually needed.
 */

/**
 * Conversion utilities from hazo_pdf
 */
export interface HazoPdfConversionUtils {
  /**
   * Convert a file to PDF (auto-detects type)
   * @param file - The file to convert
   * @returns Promise<Uint8Array> - The PDF bytes
   */
  convert_to_pdf: (file: File) => Promise<Uint8Array>;

  /**
   * Convert an image file to PDF
   * @param file - Image file (JPEG, PNG, GIF, WebP, etc.)
   * @returns Promise<Uint8Array> - The PDF bytes
   */
  convert_image_to_pdf: (file: File) => Promise<Uint8Array>;

  /**
   * Convert a text file to PDF
   * @param file - Text file (.txt, .md, .csv, etc.)
   * @returns Promise<Uint8Array> - The PDF bytes
   */
  convert_text_to_pdf: (file: File) => Promise<Uint8Array>;

  /**
   * Convert an Excel file to PDF
   * @param file - Excel file (.xlsx, .xls)
   * @returns Promise<Uint8Array> - The PDF bytes
   */
  convert_excel_to_pdf: (file: File) => Promise<Uint8Array>;

  /**
   * Check if a file can be converted to PDF
   * @param file - The file or MIME type to check
   * @returns boolean - Whether conversion is supported
   */
  can_convert_to_pdf: (file: File | string) => boolean;

  /**
   * Check if a MIME type is an image type
   * @param mime_type - The MIME type to check
   * @returns boolean
   */
  is_image_type: (mime_type: string) => boolean;

  /**
   * Check if a MIME type is a text type
   * @param mime_type - The MIME type to check
   * @returns boolean
   */
  is_text_type: (mime_type: string) => boolean;

  /**
   * Check if a MIME type is an Excel type
   * @param mime_type - The MIME type to check
   * @returns boolean
   */
  is_excel_type: (mime_type: string) => boolean;

  /**
   * Get all supported MIME types for conversion
   * @returns object with arrays of supported types
   */
  get_supported_types: () => {
    image: string[];
    text: string[];
    excel: string[];
    all: string[];
  };
}

/**
 * Dynamically load hazo_pdf conversion utilities
 *
 * @example
 * ```typescript
 * const utils = await get_hazo_pdf_conversion_utils();
 * if (utils.can_convert_to_pdf(file)) {
 *   const pdf_bytes = await utils.convert_to_pdf(file);
 * }
 * ```
 *
 * @returns Promise<HazoPdfConversionUtils> - The conversion utilities
 * @throws Error if hazo_pdf is not installed
 */
export async function get_hazo_pdf_conversion_utils(): Promise<HazoPdfConversionUtils> {
  try {
    // @ts-expect-error - hazo_pdf is an optional peer dependency
    const hazo_pdf = await import(/* webpackChunkName: "hazo_pdf" */ "hazo_pdf");

    return {
      convert_to_pdf: hazo_pdf.convert_to_pdf,
      convert_image_to_pdf: hazo_pdf.convert_image_to_pdf,
      convert_text_to_pdf: hazo_pdf.convert_text_to_pdf,
      convert_excel_to_pdf: hazo_pdf.convert_excel_to_pdf,
      can_convert_to_pdf: hazo_pdf.can_convert_to_pdf,
      is_image_type: hazo_pdf.is_image_type,
      is_text_type: hazo_pdf.is_text_type,
      is_excel_type: hazo_pdf.is_excel_type,
      get_supported_types: hazo_pdf.get_supported_types,
    };
  } catch (error) {
    throw new Error(
      "hazo_pdf is not installed. Please install it to use conversion features: npm install hazo_pdf"
    );
  }
}

/**
 * Check if hazo_pdf is available
 *
 * @example
 * ```typescript
 * const available = await is_hazo_pdf_available();
 * if (available) {
 *   // Safe to use conversion features
 * }
 * ```
 *
 * @returns Promise<boolean> - Whether hazo_pdf is installed and available
 */
export async function is_hazo_pdf_available(): Promise<boolean> {
  try {
    // @ts-expect-error - hazo_pdf is an optional peer dependency
    await import(/* webpackChunkName: "hazo_pdf" */ "hazo_pdf");
    return true;
  } catch {
    return false;
  }
}

/**
 * Supported MIME types for conversion (static list for quick checks)
 * These match the types supported by hazo_pdf v1.3.2
 */
export const CONVERTIBLE_MIME_TYPES = {
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
  ],
  text: [
    "text/plain",
    "text/markdown",
    "text/csv",
    "text/html",
    "application/json",
  ],
  excel: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ],
} as const;

/** Type for all convertible MIME types */
export type ConvertibleMimeType =
  | (typeof CONVERTIBLE_MIME_TYPES.image)[number]
  | (typeof CONVERTIBLE_MIME_TYPES.text)[number]
  | (typeof CONVERTIBLE_MIME_TYPES.excel)[number];

/**
 * Quick check if a MIME type can potentially be converted (without loading hazo_pdf)
 * Use this for UI decisions before actually attempting conversion.
 *
 * @param mime_type - The MIME type to check
 * @returns boolean - Whether the type is potentially convertible
 */
export function is_potentially_convertible(mime_type: string): boolean {
  const all_types: readonly string[] = [
    ...CONVERTIBLE_MIME_TYPES.image,
    ...CONVERTIBLE_MIME_TYPES.text,
    ...CONVERTIBLE_MIME_TYPES.excel,
  ];
  return all_types.includes(mime_type);
}
