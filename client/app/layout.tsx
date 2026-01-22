import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyGenie",
  description: "AI Powered Study Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}