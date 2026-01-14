"use client";

import * as React from "react";
import { FaFileAlt, FaFileUpload } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "../../lib/utils";
import type { FileManagerButtonProps } from "./types";

/**
 * FileManagerButton Component
 * Unified icon button that shows file count badge
 * Replaces both DocLinkButton and UploadIconButton
 */
export function FileManagerButton({
  file_count,
  has_files,
  on_click,
  config,
  class_name,
  tooltip_text,
  disabled = false,
}: FileManagerButtonProps) {
  const [is_hovered, set_is_hovered] = React.useState(false);

  const fm_config = config.file_manager;
  const icon_size = parseInt(fm_config.icon_size, 10) || 20;

  // Determine icon color based on state
  const icon_color = is_hovered
    ? fm_config.icon_color_hover
    : has_files
      ? fm_config.icon_color_with_files
      : fm_config.icon_color;

  // Determine which icon to show
  // FaFileUpload when no files, FaFileAlt when files are attached
  const IconComponent = has_files ? FaFileAlt : FaFileUpload;

  // Default tooltip text
  const default_tooltip = has_files
    ? `${file_count} file${file_count !== 1 ? "s" : ""} attached`
    : "No files attached";

  const button_content = (
    <button
      type="button"
      onClick={on_click}
      onMouseEnter={() => set_is_hovered(true)}
      onMouseLeave={() => set_is_hovered(false)}
      disabled={disabled}
      className={cn(
        "cls_file_manager_btn relative p-1 rounded hover:bg-gray-100 transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        class_name
      )}
      aria-label={tooltip_text || default_tooltip}
    >
      <IconComponent
        size={icon_size}
        color={icon_color}
        className="transition-colors"
      />
      {/* Badge - always show when count > 0 */}
      {file_count > 0 && (
        <span
          className="cls_file_count_badge absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            backgroundColor: fm_config.badge_background,
            color: fm_config.badge_text_color,
          }}
        >
          {file_count > 9 ? "9+" : file_count}
        </span>
      )}
    </button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button_content}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip_text || default_tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
