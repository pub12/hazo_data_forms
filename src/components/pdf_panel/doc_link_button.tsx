"use client";

import * as React from "react";
import { FaFileAlt, FaRegFileAlt } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import type { DocLink, FormConfig } from "../../lib/types";

export interface DocLinkButtonProps {
  doc_link: DocLink;
  on_click?: () => void;
  config: FormConfig;
}

/**
 * Doc Link Button
 * Clickable icon that triggers PDF panel open
 */
export function DocLinkButton({ doc_link, on_click, config }: DocLinkButtonProps) {
  const [is_hovered, set_is_hovered] = React.useState(false);

  const is_solid = config.doc_link_icon_style === "solid";
  const icon_color = is_hovered ? config.doc_link_hover_color : config.doc_link_icon_color;
  const icon_size = parseInt(config.doc_link_icon_size, 10) || 20;

  const IconComponent = is_solid ? FaFileAlt : FaRegFileAlt;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={on_click}
            onMouseEnter={() => set_is_hovered(true)}
            onMouseLeave={() => set_is_hovered(false)}
            className="cls_doc_link_btn p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label={`View document${doc_link.page ? ` page ${doc_link.page}` : ""}`}
          >
            <IconComponent
              size={icon_size}
              color={icon_color}
              className="transition-colors"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View source document{doc_link.page ? ` (page ${doc_link.page})` : ""}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
