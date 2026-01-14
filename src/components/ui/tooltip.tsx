"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface TooltipContextValue {
  open: boolean;
  set_open: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, set_open] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ open, set_open }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const context = React.useContext(TooltipContext);

  if (!context) {
    throw new Error("TooltipTrigger must be used within a Tooltip");
  }

  const { set_open } = context;

  const handle_mouse_enter = () => set_open(true);
  const handle_mouse_leave = () => set_open(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: handle_mouse_enter,
      onMouseLeave: handle_mouse_leave,
    });
  }

  return (
    <span onMouseEnter={handle_mouse_enter} onMouseLeave={handle_mouse_leave}>
      {children}
    </span>
  );
}

export function TooltipContent({
  children,
  className,
  side = "top",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const context = React.useContext(TooltipContext);

  if (!context) {
    throw new Error("TooltipContent must be used within a Tooltip");
  }

  const { open } = context;

  if (!open) {
    return null;
  }

  const position_classes = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={cn(
        "absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        position_classes[side],
        className
      )}
    >
      {children}
    </div>
  );
}
