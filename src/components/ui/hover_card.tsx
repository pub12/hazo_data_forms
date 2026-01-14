"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface HoverCardContextValue {
  open: boolean;
  set_open: (open: boolean) => void;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

export function HoverCard({ children }: { children: React.ReactNode }) {
  const [open, set_open] = React.useState(false);
  const timeout_ref = React.useRef<NodeJS.Timeout | null>(null);

  const handle_open = React.useCallback(() => {
    if (timeout_ref.current) {
      clearTimeout(timeout_ref.current);
    }
    set_open(true);
  }, []);

  const handle_close = React.useCallback(() => {
    // Delay closing to allow moving to the content
    timeout_ref.current = setTimeout(() => {
      set_open(false);
    }, 100);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeout_ref.current) {
        clearTimeout(timeout_ref.current);
      }
    };
  }, []);

  return (
    <HoverCardContext.Provider value={{ open, set_open }}>
      <div
        className="cls_hover_card relative inline-block"
        onMouseEnter={handle_open}
        onMouseLeave={handle_close}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
}

export function HoverCardTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  if (asChild && React.isValidElement(children)) {
    return <>{children}</>;
  }

  return <span>{children}</span>;
}

export function HoverCardContent({
  children,
  className,
  align = "center",
  side = "top",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
}) {
  const context = React.useContext(HoverCardContext);

  if (!context) {
    throw new Error("HoverCardContent must be used within a HoverCard");
  }

  const { open } = context;

  if (!open) {
    return null;
  }

  const position_classes = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  const align_classes = {
    start: side === "top" || side === "bottom" ? "left-0" : "",
    center: side === "top" || side === "bottom" ? "left-1/2 -translate-x-1/2" : "",
    end: side === "top" || side === "bottom" ? "right-0" : "",
  };

  return (
    <div
      className={cn(
        "cls_hover_card_content absolute z-50 rounded-md border p-4 shadow-lg outline-none",
        position_classes[side],
        align_classes[align],
        className
      )}
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#e5e7eb",
        color: "#374151",
      }}
    >
      {children}
    </div>
  );
}
