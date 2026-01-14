import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hazo_data_forms Test App",
  description: "Test application for hazo_data_forms components",
};

/**
 * Root Layout
 * Minimal root layout that provides html/body tags.
 * Route groups add their own nested layouts for different page types.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
