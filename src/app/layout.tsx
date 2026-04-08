import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MedStore ERP — Pharmacy Management Software",
    template: "%s | MedStore ERP",
  },
  description:
    "All-in-one medical store management system. Manage inventory, billing, GST reports, expiry tracking, prescriptions, and more.",
  keywords: [
    "medical store",
    "pharmacy ERP",
    "inventory management",
    "billing software",
    "GST reports",
    "medicine tracking",
  ],
  authors: [{ name: "MedStore ERP" }],
  openGraph: {
    title: "MedStore ERP — Pharmacy Management Software",
    description:
      "All-in-one medical store management system for inventory, billing, GST reports, and more.",
    type: "website",
    locale: "en_IN",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0d9488",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#0f172a",
              color: "#f8fafc",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "500",
              padding: "12px 16px",
              boxShadow: "0 20px 60px -12px rgba(0, 0, 0, 0.25)",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
