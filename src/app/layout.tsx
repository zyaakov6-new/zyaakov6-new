import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Publish Everywhere",
  description: "Write once, publish to Medium and WordPress.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
