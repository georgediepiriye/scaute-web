// app/layout.tsx
import "./globals.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ReactNode } from "react";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/auth/AuthGuard";
import localFont from "next/font/local";

const cabinetGrotesk = localFont({
  src: "./fonts/CabinetGrotesk-Variable.woff2",
  variable: "--font-cabinet", // Defines the CSS variable name
  display: "swap", // Prevents invisible text while loading
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* Inject variables into the body tag class string */}
      <body className={`${cabinetGrotesk.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
