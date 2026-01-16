"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { FileManager } from "./index";
import type { FileManagerDialogProps } from "./types";

/**
 * FileManagerDialog Component
 * Dialog wrapper around FileManager for modal display
 */
export function FileManagerDialog({
  files,
  is_open,
  on_close,
  config,
  pdf_viewer_component,
  on_pdf_save,
  upload_enabled,
  field_label,
  field_id,
  on_upload,
  on_delete,
  on_popout,
  class_name,
  title,
  // hazo_pdf 1.3.2 features
  enable_file_conversion,
  on_file_convert,
}: FileManagerDialogProps) {
  const fm_config = config.file_manager;

  // Dialog title
  const dialog_title = title
    ? title
    : upload_enabled && field_label
      ? `Files for "${field_label}"`
      : `Documents (${files.length})`;

  return (
    <Dialog open={is_open} onOpenChange={(open) => !open && on_close()}>
      <DialogContent
        className="cls_file_manager_dialog p-0 gap-0 overflow-hidden"
        style={{
          width: fm_config.dialog_width,
          maxWidth: "90vw",
          maxHeight: fm_config.dialog_max_height,
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{dialog_title}</DialogTitle>
        </DialogHeader>
        <FileManager
          files={files}
          is_open={true}
          on_close={on_close}
          display_mode="dialog"
          config={config}
          pdf_viewer_component={pdf_viewer_component}
          on_pdf_save={on_pdf_save}
          upload_enabled={upload_enabled}
          field_label={field_label}
          field_id={field_id}
          on_upload={on_upload}
          on_delete={on_delete}
          on_popout={on_popout}
          class_name={class_name}
          enable_file_conversion={enable_file_conversion}
          on_file_convert={on_file_convert}
        />
      </DialogContent>
    </Dialog>
  );
}
