import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Oxyrious — Medical Oxygen. Elevated.",
  description: "Tech-enabled medical gas supply for hospitals across Lagos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
