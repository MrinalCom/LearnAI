import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "./global.css";

export const metadata: Metadata = {
  title: "LearnAI",
  description: "Learn AI, ML, and agentic systems end-to-end.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <AuthProvider>{children}</AuthProvider>
        </RootProvider>
      </body>
    </html>
  );
}
