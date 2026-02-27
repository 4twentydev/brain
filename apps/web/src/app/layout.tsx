import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brain",
  description: "Task management and project database for work and life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
