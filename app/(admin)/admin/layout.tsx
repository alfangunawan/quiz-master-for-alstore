"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity=".7"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity=".7"/>
      </svg>
    ),
  },
  {
    href: "/admin/quiz",
    label: "Kelola Quiz",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/quiz/create",
    label: "Buat Quiz",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/participants",
    label: "Peserta",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/admin/analytics",
    label: "Analitik",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M7 16l4-4 4 4 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-60 min-h-screen flex flex-col py-6 px-4 shrink-0"
        style={{ borderRight: "1px solid rgba(76,64,113,0.2)" }}>

        {/* Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 mb-10 px-2">
          <div className="w-9 h-9 rounded-[0.75rem] flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #b6a0ff, #7e51ff)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-on-surface text-sm block leading-tight">QuizNeon</span>
            <span className="text-on-surface-variant/40 text-[10px] uppercase tracking-[0.05em]">Admin Panel</span>
          </div>
        </Link>

        {/* Nav */}
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
                className={isActive ? "sidebar-link-active" : "sidebar-link"}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="space-y-1 pt-4" style={{ borderTop: "1px solid rgba(76,64,113,0.2)" }}>
          <Link href="/dashboard" className="sidebar-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm">User Dashboard</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="sidebar-link w-full text-left text-error/70 hover:text-error hover:bg-error/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
