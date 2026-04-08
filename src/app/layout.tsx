import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedStore ERP - Medical Store Management",
  description:
    "Complete medical store management system for inventory, billing, and reporting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#0f172a",
              color: "#f8fafc",
              borderRadius: "16px",
              fontSize: "13px",
              fontWeight: "500",
              padding: "12px 16px",
              boxShadow: "0 20px 60px -12px rgba(0, 0, 0, 0.25)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
