"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import type { FormSchema, FormValues, FormConfig, PartialFormConfig } from "../../lib/types";

export interface FormPreviewDialogProps {
  /** Form schema to preview */
  schema: FormSchema;
  /** Form values to display */
  values?: FormValues;
  /** Partial config overrides */
  config_override?: PartialFormConfig;
  /** Dialog trigger element */
  trigger?: React.ReactNode;
  /** Dialog open state (controlled) */
  open?: boolean;
  /** Callback when dialog open state changes */
  on_open_change?: (open: boolean) => void;
  /** Custom title for the dialog */
  title?: string;
  /** CSS class name for the dialog content */
  className?: string;
  /** Render function for the form content */
  render_form?: (props: {
    schema: FormSchema;
    values: FormValues;
    config_override?: PartialFormConfig;
    active_section?: string;
  }) => React.ReactNode;
}

/**
 * FormPreviewDialog - A dialog component that displays a form preview
 * with a sidebar for navigating between sections.
 *
 * The sidebar lists all form sections and highlights the active one.
 * Clicking a section scrolls the form to that section.
 */
export function FormPreviewDialog({
  schema,
  values = {},
  config_override,
  trigger,
  open,
  on_open_change,
  title = "Form Preview",
  className,
  render_form,
}: FormPreviewDialogProps) {
  const [active_section, set_active_section] = React.useState<string | null>(
    schema.length > 0 ? schema[0].section_name : null
  );
  const section_refs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const content_ref = React.useRef<HTMLDivElement>(null);

  // Extract section names from schema
  const sections = React.useMemo(
    () => schema.map((section) => section.section_name),
    [schema]
  );

  // Handle section click - scroll to section
  const handle_section_click = React.useCallback((section_name: string) => {
    set_active_section(section_name);
    const section_el = section_refs.current.get(section_name);
    if (section_el && content_ref.current) {
      section_el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Track scroll position to highlight active section
  React.useEffect(() => {
    const content = content_ref.current;
    if (!content) return;

    const handle_scroll = () => {
      const scroll_top = content.scrollTop;
      let current_section: string | null = null;

      // Find the section that is currently in view
      section_refs.current.forEach((el, name) => {
        if (el.offsetTop <= scroll_top + 100) {
          current_section = name;
        }
      });

      if (current_section && current_section !== active_section) {
        set_active_section(current_section);
      }
    };

    content.addEventListener("scroll", handle_scroll);
    return () => content.removeEventListener("scroll", handle_scroll);
  }, [active_section]);

  // Register section ref
  const register_section_ref = React.useCallback(
    (section_name: string) => (el: HTMLDivElement | null) => {
      if (el) {
        section_refs.current.set(section_name, el);
      } else {
        section_refs.current.delete(section_name);
      }
    },
    []
  );

  return (
    <Dialog open={open} onOpenChange={on_open_change}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "cls_preview_dialog max-w-6xl w-[95vw] h-[90vh] p-0 flex flex-col",
          className
        )}
      >
        <DialogHeader className="cls_preview_dialog_header px-6 py-4 border-b shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="cls_preview_dialog_body flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="cls_preview_sidebar w-64 shrink-0 border-r bg-muted/30 overflow-y-auto">
            <nav className="cls_preview_nav p-4">
              <h3 className="cls_preview_nav_title text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Sections
              </h3>
              <ul className="cls_preview_nav_list space-y-1">
                {sections.map((section_name, index) => (
                  <li key={section_name}>
                    <button
                      type="button"
                      onClick={() => handle_section_click(section_name)}
                      className={cn(
                        "cls_preview_nav_item w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                        active_section === section_name
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span className="cls_section_number mr-2 opacity-60">
                        {index + 1}.
                      </span>
                      {section_name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <div
            ref={content_ref}
            className="cls_preview_content flex-1 overflow-y-auto p-6"
          >
            {render_form ? (
              render_form({
                schema,
                values,
                config_override,
                active_section: active_section || undefined,
              })
            ) : (
              /* Default rendering when no render_form is provided */
              <div className="cls_preview_sections space-y-8">
                {schema.map((section) => (
                  <div
                    key={section.section_name}
                    ref={register_section_ref(section.section_name)}
                    className="cls_preview_section"
                  >
                    <h2 className="cls_preview_section_title text-lg font-semibold mb-4 pb-2 border-b">
                      {section.section_name}
                    </h2>
                    <div className="cls_preview_subsections space-y-6">
                      {section.sub_sections.map((sub) => (
                        <div
                          key={sub.sub_section_id}
                          className="cls_preview_subsection"
                        >
                          <h3 className="cls_preview_subsection_title text-md font-medium mb-3 text-muted-foreground">
                            {sub.sub_section_label}
                          </h3>
                          <div className="cls_preview_fields space-y-2">
                            {sub.field_group.fields.map((field) => (
                              <div
                                key={field.id}
                                className="cls_preview_field flex items-baseline gap-2"
                              >
                                <span className="cls_preview_field_label text-sm text-muted-foreground min-w-[150px]">
                                  {field.label}:
                                </span>
                                <span className="cls_preview_field_value text-sm font-medium">
                                  {values[field.id] !== undefined
                                    ? String(values[field.id])
                                    : "-"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FormPreviewDialog;
