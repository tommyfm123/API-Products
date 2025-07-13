import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UPC API Lookup",
  description: "Desarrollo de una API para buscar productos por UPC e ISBN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
