"use client";

import * as React from "react";
import { FaFilePdf, FaFileImage, FaFileWord, FaFile, FaTimes } from "react-icons/fa";
import { cn, extract_filename_from_url } from "../../lib/utils";
import type { DocLink, DocLinkType, FormConfig } from "../../lib/types";

export interface FileListItemProps {
  doc_link: DocLink;
  is_selected: boolean;
  on_click: () => void;
  config: FormConfig;
  /** Whether this file can be deleted */
  deletable?: boolean;
  /** Callback when delete button is clicked */
  on_delete?: () => void;
  /** Whether deletion is in progress */
  delete_in_progress?: boolean;
}

/**
 * Get icon component for doc link type
 */
function get_type_icon(type: DocLinkType) {
  switch (type) {
    case "pdf":
      return FaFilePdf;
    case "image":
      return FaFileImage;
    case "document":
      return FaFileWord;
    default:
      return FaFile;
  }
}

/**
 * Individual file item in the file list
 * Displays as a clickable chip/tab with icon and filename
 */
export function FileListItem({
  doc_link,
  is_selected,
  on_click,
  deletable,
  on_delete,
  delete_in_progress,
}: FileListItemProps) {
  const [is_hovered, set_is_hovered] = React.useState(false);
  const filename = doc_link.filename || extract_filename_from_url(doc_link.url);
  const IconComponent = get_type_icon(doc_link.type);

  // Truncate long filenames
  const display_name =
    filename.length > 25 ? `${filename.substring(0, 22)}...` : filename;

  const handle_delete = (e: React.MouseEvent) => {
    e.stopPropagation();
    on_delete?.();
  };

  return (
    <div
      className="cls_file_list_item_wrapper relative"
      onMouseEnter={() => set_is_hovered(true)}
      onMouseLeave={() => set_is_hovered(false)}
    >
      <button
        type="button"
        onClick={on_click}
        disabled={delete_in_progress}
        className={cn(
          "cls_file_list_item flex items-center gap-2 px-3 py-2 rounded-md text-sm",
          "border transition-colors whitespace-nowrap",
          is_selected
            ? "bg-blue-50 border-blue-300 text-blue-700"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
          delete_in_progress && "opacity-50"
        )}
        title={filename}
      >
        <IconComponent
          size={16}
          className={is_selected ? "text-blue-600" : "text-gray-500"}
        />
        <span>{display_name}</span>
        {doc_link.page && (
          <span className="text-xs text-gray-400">p.{doc_link.page}</span>
        )}
      </button>

      {/* Delete button - shows on hover when deletable */}
      {deletable && is_hovered && !delete_in_progress && (
        <button
          type="button"
          onClick={handle_delete}
          className="cls_file_delete_btn absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
          title="Remove file"
        >
          <FaTimes size={10} />
        </button>
      )}

      {/* Loading indicator during deletion */}
      {delete_in_progress && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-md">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
