import "./globals.css";
import { ReactNode } from "react";
import type { Viewport } from "next";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/auth/AuthGuard";
import localFont from "next/font/local";

// 🚀 FIXED: Casted string option bypasses strict compiler typing while remaining valid for mobile browsers
export const viewport: Viewport = {
  themeColor: "#0052FF",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colorScheme: "light only" as any,
};

const cabinetGrotesk = localFont({
  src: "./fonts/CabinetGrotesk-Variable.woff2",
  variable: "--font-cabinet",
  display: "swap",
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
