import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "QuizMaster Pro — Interactive Quiz Platform",
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
              background: "#2D1B69",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
            },
          }}
        />
      </body>
    </html>
  );
}
