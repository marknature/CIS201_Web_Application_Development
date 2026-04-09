import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/shared/Sidebar";

export const metadata: Metadata = {
  title: "FFIMS — Workforce Scheduling",
  description: "Fleet and Facilities Integrated Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          <Sidebar />
          <main style={{ flex: 1, overflowY: "auto", padding: "var(--page-padding)", background: "var(--bg)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
