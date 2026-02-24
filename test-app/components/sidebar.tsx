"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FormInput,
  Layers,
  Table2,
  FileText,
  Eye,
  Calculator,
  Upload,
  Files,
  Briefcase,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav_items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/basic-fields", label: "Basic Fields", icon: FormInput },
  { href: "/nested-sections", label: "Nested Sections", icon: Layers },
  { href: "/tables-worksheets", label: "Tables & Worksheets", icon: Table2 },
  { href: "/document-links", label: "Document Links", icon: FileText },
  { href: "/multi-file-conversion", label: "Multi-File & Conversion", icon: Files },
  { href: "/edit-vs-view", label: "Edit vs View Mode", icon: Eye },
  { href: "/tax-forms", label: "Tax Forms", icon: Calculator },
  { href: "/work-papers", label: "Work Papers", icon: Briefcase },
  { href: "/file-upload", label: "File Upload", icon: Upload },
  { href: "/reference-values", label: "Reference Values", icon: BookMarked },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/30 min-h-screen p-4 shrink-0">
      <div className="mb-8">
        <h1 className="text-lg font-semibold">Test App</h1>
        <p className="text-sm text-muted-foreground">hazo_data_forms demo</p>
      </div>
      <nav className="space-y-1">
        {nav_items.map((item) => {
          const Icon = item.icon;
          const is_active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                is_active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
