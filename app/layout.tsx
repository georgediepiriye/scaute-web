// app/layout.tsx
import "./globals.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ReactNode } from "react";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/auth/AuthGuard";

// Declare font variable names
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Defines a CSS variable
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta", // Defines a CSS variable
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* Inject variables into the body tag class string */}
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
