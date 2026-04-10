import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "QuizNeon — Interactive Quiz Platform",
  description:
    "Platform quiz interaktif dengan pengalaman gamified. Buat, kelola, dan ikuti quiz secara real-time.",
  keywords: ["quiz", "education", "interactive", "gamification", "learning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: "#231554",
              border: "none",
              color: "#ebe1ff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            },
          }}
        />
      </body>
    </html>
  );
}
