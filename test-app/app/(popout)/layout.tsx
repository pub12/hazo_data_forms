import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Viewer - hazo_data_forms",
  description: "File viewer popout window",
};

/**
 * Popout Layout
 * Minimal layout for popout windows without sidebar navigation.
 * Used for file viewer and other standalone windows.
 */
export default function PopoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  );
}
