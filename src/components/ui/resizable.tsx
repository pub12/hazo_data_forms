"use client"

import * as React from "react"
import { Group, Panel, Separator } from "react-resizable-panels"

import { cn } from "../../lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  className,
  ...props
}: React.ComponentProps<typeof Panel>) {
  return (
    <Panel
      data-slot="resizable-panel"
      className={cn("overflow-hidden", className)}
      {...props}
    />
  )
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "cls_resizable_handle",
        "relative flex w-2 items-center justify-center bg-gray-200",
        "cursor-col-resize select-none",
        "hover:bg-blue-400 active:bg-blue-500 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-8 w-4 items-center justify-center rounded bg-gray-300 border border-gray-400 shadow-sm">
          {/* Grip icon - 6 dots in 2 columns */}
          <svg
            width="8"
            height="14"
            viewBox="0 0 8 14"
            fill="currentColor"
            className="text-gray-600"
          >
            <circle cx="2" cy="2" r="1.2" />
            <circle cx="6" cy="2" r="1.2" />
            <circle cx="2" cy="7" r="1.2" />
            <circle cx="6" cy="7" r="1.2" />
            <circle cx="2" cy="12" r="1.2" />
            <circle cx="6" cy="12" r="1.2" />
          </svg>
        </div>
      )}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
