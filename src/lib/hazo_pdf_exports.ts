"use client";

/**
 * hazo_pdf Re-exports Module
 *
 * This module provides async access to hazo_pdf conversion utilities.
 * Using dynamic imports ensures hazo_pdf remains optional and is only
 * loaded when conversion features are actually needed.
 */

/**
 * Supported image MIME types for conversion
 */
export type SupportedImageType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

/**
 * Supported text MIME types for conversion
 */
export type SupportedTextType = 'text/plain' | 'text/markdown' | 'text/csv';

/**
 * Supported Excel MIME types for conversion
 */
export type SupportedExcelType =
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/vnd.ms-excel'
  | 'application/vnd.google-apps.spreadsheet';

/**
 * All supported MIME types for conversion
 */
export type SupportedConversionType = SupportedImageType | SupportedTextType | SupportedExcelType;

/**
 * PDF conversion options
 */
export interface PdfConversionOptions {
  /** Page size: 'letter' (612x792), 'a4' (595x842), 'legal' (612x1008) */
  page_size?: 'letter' | 'a4' | 'legal';
  /** Image quality 0.0-1.0 for lossy compression (default: 0.85) */
  image_quality?: number;
  /** How image fits on page: 'fit' (preserve aspect), 'fill' (crop), 'stretch' */
  image_fit?: 'fit' | 'fill' | 'stretch';
  /** Margin in points (72 points = 1 inch, default: 36) */
  margin?: number;
  /** Font size for text files in points (default: 12) */
  font_size?: number;
  /** Line height multiplier for text files (default: 1.4) */
  line_height?: number;
}

/**
 * Result from PDF conversion operations
 */
export interface ConversionResult {
  /** Whether conversion succeeded */
  success: boolean;
  /** Converted PDF as Uint8Array (if success) */
  pdf_bytes?: Uint8Array;
  /** Original filename without extension */
  original_name?: string;
  /** Generated PDF filename */
  pdf_filename?: string;
  /** Original file type that was converted */
  source_type?: 'image' | 'text' | 'excel';
  /** Number of pages in the resulting PDF */
  page_count?: number;
  /** Error message (if !success) */
  error?: string;
}

/**
 * Conversion utilities from hazo_pdf
 */
export interface HazoPdfConversionUtils {
  /**
   * Convert a file to PDF (auto-detects type)
   * @param file - The file to convert
   * @param filename - Original filename (used for output naming)
   * @param options - Conversion options
   * @returns Promise<ConversionResult>
   */
  convert_to_pdf: (
    file: File | Blob,
    filename: string,
    options?: PdfConversionOptions
  ) => Promise<ConversionResult>;

  /**
   * Convert image bytes to PDF
   * @param image_bytes - Raw image data as Uint8Array
   * @param mime_type - Image MIME type
   * @param filename - Original filename
   * @param options - Conversion options
   * @returns Promise<ConversionResult>
   */
  convert_image_to_pdf: (
    image_bytes: Uint8Array,
    mime_type: SupportedImageType,
    filename: string,
    options?: PdfConversionOptions
  ) => Promise<ConversionResult>;

  /**
   * Convert text content to PDF
   * @param text_content - Text string to convert
   * @param filename - Original filename
   * @param options - Conversion options
   * @returns Promise<ConversionResult>
   */
  convert_text_to_pdf: (
    text_content: string,
    filename: string,
    options?: PdfConversionOptions
  ) => Promise<ConversionResult>;

  /**
   * Convert Excel spreadsheet to PDF
   * @param excel_bytes - Raw Excel data as Uint8Array
   * @param filename - Original filename
   * @param options - Conversion options
   * @returns Promise<ConversionResult>
   */
  convert_excel_to_pdf: (
    excel_bytes: Uint8Array,
    filename: string,
    options?: PdfConversionOptions
  ) => Promise<ConversionResult>;

  /**
   * Check if a MIME type can be converted to PDF
   * @param mime_type - The MIME type to check
   * @returns boolean - Whether conversion is supported
   */
  can_convert_to_pdf: (mime_type: string) => boolean;

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
   * @returns Array of supported MIME types
   */
  get_supported_types: () => string[];
}

/**
 * Dynamically load hazo_pdf conversion utilities
 *
 * @example
 * ```typescript
 * const utils = await get_hazo_pdf_conversion_utils();
 * if (utils.can_convert_to_pdf(file.type)) {
 *   const result = await utils.convert_to_pdf(file, file.name);
 *   if (result.success && result.pdf_bytes) {
 *     // Use result.pdf_bytes
 *   }
 * }
 * ```
 *
 * @returns Promise<HazoPdfConversionUtils> - The conversion utilities
 * @throws Error if hazo_pdf is not installed
 */
export async function get_hazo_pdf_conversion_utils(): Promise<HazoPdfConversionUtils> {
  try {
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
    await import(/* webpackChunkName: "hazo_pdf" */ "hazo_pdf");
    return true;
  } catch {
    return false;
  }
}

/**
 * Supported MIME types for conversion (static list for quick checks)
 * These match the types supported by hazo_pdf v1.4.0
 */
export const CONVERTIBLE_MIME_TYPES = {
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  text: [
    "text/plain",
    "text/markdown",
    "text/csv",
  ],
  excel: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.google-apps.spreadsheet",
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
