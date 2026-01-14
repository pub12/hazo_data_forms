import { Sidebar } from "@/components/sidebar";

/**
 * Main Layout
 * Layout for pages that include the sidebar navigation.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
