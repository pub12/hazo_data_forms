"use client";

import * as React from "react";
import { HoverCard, HoverCardContent } from "../../ui/hover_card";
import type { HelpTooltip } from "../../../lib/types";

interface HelpTooltipIconProps {
  help_tooltip: HelpTooltip;
  computed_formula?: string;
}

/**
 * Help Tooltip Icon Component
 * Displays a question mark icon that shows help content on hover
 * Uses HoverCard for a wider, more readable tooltip UI
 */
export function HelpTooltipIcon({
  help_tooltip,
  computed_formula,
}: HelpTooltipIconProps) {
  // Don't render if no content
  const has_message = !!help_tooltip.message;
  const formula_text = help_tooltip.show_formula
    ? help_tooltip.formula_display || computed_formula
    : null;

  if (!has_message && !formula_text) return null;

  return (
    <HoverCard>
      <button
        type="button"
        className="cls_help_tooltip_btn p-0.5 rounded-full hover:bg-gray-100 transition-colors cursor-help"
        aria-label="Help"
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
          className="text-gray-400 hover:text-gray-600"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      </button>
      <HoverCardContent side="top" align="start" className="w-80">
        <div className="space-y-2">
          {has_message && (
            <p className="cls_help_message text-sm text-gray-700 leading-relaxed">
              {help_tooltip.message}
            </p>
          )}
          {formula_text && (
            <div className="cls_help_formula pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Calculation</p>
              <code className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-600 font-mono block">
                {formula_text}
              </code>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
