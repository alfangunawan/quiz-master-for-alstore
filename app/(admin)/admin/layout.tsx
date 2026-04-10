"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/quiz", icon: "📝", label: "Kelola Quiz" },
  { href: "/admin/quiz/create", icon: "➕", label: "Buat Quiz" },
  { href: "/admin/participants", icon: "👥", label: "Peserta" },
  { href: "/admin/analytics", icon: "📈", label: "Analitik" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen gradient-dark flex">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen border-r border-white/5 p-6 flex flex-col">
        <Link href="/admin/dashboard" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-answer gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">Q</span>
          </div>
          <div>
            <span className="text-white font-bold text-lg block">
              QuizMaster
            </span>
            <span className="text-white/30 text-xs">Admin Panel</span>
          </div>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href) &&
                item.href !== "/admin/quiz/create");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive ? "sidebar-link-active" : "sidebar-link"
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-2">
          <Link href="/dashboard" className="sidebar-link text-sm">
            <span>🔙</span>
            <span>User Dashboard</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="sidebar-link text-sm w-full text-left text-red-400"
          >
            <span>🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
