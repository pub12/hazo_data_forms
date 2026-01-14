"use client";

import * as React from "react";
import { FaFilePdf, FaFileImage, FaFileWord, FaFile, FaTimes, FaPlus, FaUpload } from "react-icons/fa";
import { cn } from "../../lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert_dialog";
import type { FileListProps, FileItem, UploadProgress } from "./types";
import type { DocLinkType } from "../../lib/types";

/**
 * Get icon component for file type
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
 * Individual file item in the list
 */
function FileListItem({
  file,
  is_selected,
  on_click,
  deletable,
  on_delete,
  delete_in_progress,
}: {
  file: FileItem;
  is_selected: boolean;
  on_click: () => void;
  deletable?: boolean;
  on_delete?: () => void;
  delete_in_progress?: boolean;
}) {
  const [is_hovered, set_is_hovered] = React.useState(false);
  const [show_delete_dialog, set_show_delete_dialog] = React.useState(false);
  const IconComponent = get_type_icon(file.type);

  // Truncate long filenames
  const display_name =
    file.filename.length > 25
      ? `${file.filename.substring(0, 22)}...`
      : file.filename;

  const handle_delete_click = (e: React.MouseEvent) => {
    e.stopPropagation();
    set_show_delete_dialog(true);
  };

  const handle_confirm_delete = () => {
    on_delete?.();
    set_show_delete_dialog(false);
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
        title={file.filename}
      >
        <IconComponent
          size={16}
          className={is_selected ? "text-blue-600" : "text-gray-500"}
        />
        <span>{display_name}</span>
        {file.page && (
          <span className="text-xs text-gray-400">p.{file.page}</span>
        )}
      </button>

      {/* Delete button - shows on hover when deletable */}
      {deletable && is_hovered && !delete_in_progress && (
        <button
          type="button"
          onClick={handle_delete_click}
          className="cls_file_delete_btn absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
          title="Remove file"
        >
          <FaTimes size={10} />
        </button>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={show_delete_dialog} onOpenChange={set_show_delete_dialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{file.filename}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handle_confirm_delete}>
              Remove
            </AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading indicator during deletion */}
      {delete_in_progress && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-md">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

/**
 * Compact upload progress display
 */
function UploadProgressDisplay({ progress }: { progress: UploadProgress[] }) {
  if (progress.length === 0) return null;

  return (
    <div className="cls_upload_progress_inline px-2 pb-2 space-y-1">
      {progress.map((item, index) => (
        <div
          key={`${item.filename}-${index}`}
          className={cn(
            "flex items-center gap-2 px-2 py-1 rounded text-xs",
            item.status === "uploading" && "bg-blue-50 text-blue-700",
            item.status === "success" && "bg-green-50 text-green-700",
            item.status === "error" && "bg-red-50 text-red-700"
          )}
        >
          <span className="font-medium truncate flex-1">{item.filename}</span>
          {item.status === "uploading" && (
            <span className="text-blue-500 animate-pulse">Uploading...</span>
          )}
          {item.status === "success" && <span>Uploaded</span>}
          {item.status === "error" && (
            <span className="text-red-600">{item.error || "Failed"}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * FileList Component
 * Horizontal scrollable list of files with integrated dropzone functionality
 */
export function FileList({
  files,
  selected_index,
  on_select,
  on_delete,
  upload_enabled,
  show_add_button,
  config,
  on_files_dropped,
  drag_drop_enabled,
  accept_types,
  is_uploading,
  upload_progress,
}: FileListProps) {
  const [delete_in_progress, set_delete_in_progress] = React.useState<string | null>(null);
  const [is_dragging, set_is_dragging] = React.useState(false);
  const file_input_ref = React.useRef<HTMLInputElement>(null);
  const drag_counter = React.useRef(0);

  const handle_delete = async (file: FileItem) => {
    if (!on_delete || !file.file_id) return;

    set_delete_in_progress(file.file_id);
    try {
      await on_delete(file.file_id);
    } finally {
      set_delete_in_progress(null);
    }
  };

  // Drag event handlers
  const handle_drag_enter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!drag_drop_enabled) return;

    drag_counter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      set_is_dragging(true);
    }
  };

  const handle_drag_leave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!drag_drop_enabled) return;

    drag_counter.current--;
    if (drag_counter.current === 0) {
      set_is_dragging(false);
    }
  };

  const handle_drag_over = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handle_drop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    set_is_dragging(false);
    drag_counter.current = 0;

    if (!drag_drop_enabled || !on_files_dropped) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      on_files_dropped(Array.from(e.dataTransfer.files));
    }
  };

  const handle_file_select = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!on_files_dropped) return;

    if (e.target.files && e.target.files.length > 0) {
      on_files_dropped(Array.from(e.target.files));
    }
    e.target.value = "";
  };

  const handle_add_click = () => {
    file_input_ref.current?.click();
  };

  return (
    <div
      className={cn(
        "cls_file_list transition-all duration-200",
        is_dragging && "bg-blue-50"
      )}
      onDragEnter={handle_drag_enter}
      onDragLeave={handle_drag_leave}
      onDragOver={handle_drag_over}
      onDrop={handle_drop}
    >
      {/* Hidden file input */}
      {drag_drop_enabled && (
        <input
          ref={file_input_ref}
          type="file"
          multiple
          accept={accept_types}
          onChange={handle_file_select}
          className="hidden"
        />
      )}

      {/* Dropzone overlay when dragging */}
      {is_dragging ? (
        <div className="cls_dropzone_overlay flex items-center justify-center gap-2 p-4 border-2 border-dashed border-blue-400 rounded-md m-2 bg-blue-50">
          <FaUpload className="text-blue-500" size={20} />
          <span className="text-sm text-blue-600 font-medium">
            Drop files here...
          </span>
        </div>
      ) : (
        <>
          {/* Normal file list */}
          <div className="flex gap-2 p-2 overflow-x-auto items-center">
            {files.map((file, index) => (
              <FileListItem
                key={file.id}
                file={file}
                is_selected={index === selected_index}
                on_click={() => on_select(index)}
                deletable={upload_enabled && file.source === "upload" && !!file.file_id && !!on_delete}
                on_delete={() => handle_delete(file)}
                delete_in_progress={delete_in_progress === file.file_id}
              />
            ))}

            {/* Add file button - opens file picker directly */}
            {show_add_button && drag_drop_enabled && (
              <button
                type="button"
                onClick={handle_add_click}
                disabled={is_uploading}
                className={cn(
                  "cls_add_file_btn flex items-center gap-1 px-3 py-2 rounded-md text-sm",
                  "border border-dashed transition-colors whitespace-nowrap",
                  "border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600",
                  is_uploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <FaPlus size={12} />
                <span>Add file</span>
              </button>
            )}
          </div>

          {/* Upload progress display */}
          {upload_progress && upload_progress.length > 0 && (
            <UploadProgressDisplay progress={upload_progress} />
          )}
        </>
      )}
    </div>
  );
}
