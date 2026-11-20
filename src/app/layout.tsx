import type { Metadata } from "next";
import "antd/dist/reset.css";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "LINE OA Web Chat",
  description: "LINE Official Account Chat Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}