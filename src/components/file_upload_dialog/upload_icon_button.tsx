"use client";

import * as React from "react";
import { FaFileUpload, FaFileAlt } from "react-icons/fa";
import { cn } from "../../lib/utils";
import type { FormConfig } from "../../lib/types";

export interface UploadIconButtonProps {
  /** Whether field has existing uploads */
  has_uploads: boolean;
  /** Number of uploaded files */
  upload_count: number;
  /** Click handler */
  on_click: () => void;
  /** Configuration */
  config: FormConfig;
  /** Additional class name */
  class_name?: string;
}

/**
 * Upload icon button component
 * Shows upload icon when no files, doc-link style icon with count badge when files exist
 */
export function UploadIconButton({
  has_uploads,
  upload_count,
  on_click,
  config,
  class_name,
}: UploadIconButtonProps) {
  const icon_size = parseInt(config.doc_link_icon_size, 10) || 20;
  const [is_hovered, set_is_hovered] = React.useState(false);

  const icon_color = is_hovered
    ? config.file_upload.upload_hover_color
    : has_uploads
      ? config.doc_link_icon_color
      : config.file_upload.upload_icon_color;

  return (
    <button
      type="button"
      onClick={on_click}
      onMouseEnter={() => set_is_hovered(true)}
      onMouseLeave={() => set_is_hovered(false)}
      className={cn(
        "cls_upload_icon_btn relative p-1 rounded hover:bg-gray-100 transition-colors",
        class_name
      )}
      aria-label={has_uploads ? `View ${upload_count} uploaded file(s)` : "Upload file"}
    >
      {has_uploads ? (
        <>
          <FaFileAlt
            size={icon_size}
            color={icon_color}
            className="transition-colors"
          />
          {upload_count > 0 && (
            <span
              className="cls_upload_count_badge absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[10px] font-bold text-white bg-blue-500"
            >
              {upload_count > 9 ? "9+" : upload_count}
            </span>
          )}
        </>
      ) : (
        <FaFileUpload
          size={icon_size}
          color={icon_color}
          className="transition-colors"
        />
      )}
    </button>
  );
}
