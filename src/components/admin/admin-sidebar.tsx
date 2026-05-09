"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Presentation,
  Star,
  UserCheck,
  UserSquare2,
  Users,
  X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { adminLogoutAction } from "@/lib/admin/login-actions";
import { cn } from "@/lib/utils";

const SIDEBAR_BG = "#4A0E1C";
const GOLD = "#D4AF37";

const navGroups = [
  {
    title: "Utama (Overview)",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        description: "Ringkasan statistik kelas dan siswa.",
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: "Manajemen Operasional",
    items: [
      {
        href: "/admin/classes",
        label: "Daftar Kelas",
        description: "Kelola kelas, tambah kelas, dan kode akses.",
        icon: Presentation
      },
      {
        href: "/admin/students",
        label: "Database Siswa",
        description: "Seluruh siswa dari semua kelas.",
        icon: Users
      },
      {
        href: "/admin/trainers-database",
        label: "Database Trainer",
        description: "Seluruh trainer dari semua kelas.",
        icon: UserSquare2
      },
      {
        href: "/admin/trainers",
        label: "Penugasan Trainer",
        description: "Ringkasan penugasan per kelas.",
        icon: UserCheck
      }
    ]
  },
  {
    title: "Monitoring Tugas & Hasil",
    items: [
      {
        href: "/admin/gallery",
        label: "Galeri Tugas",
        description: "Foto Before & After siswa.",
        icon: ImageIcon
      },
      {
        href: "/admin/feedback",
        label: "Penilaian & Feedback",
        description: "Rating trainer dan testimoni.",
        icon: Star
      }
    ]
  }
] as const;

function pathIsActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ adminUsername }: { adminUsername: string }) {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("jba-admin-sidebar-collapsed");
      if (stored === "1") {
        setCollapsed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem("jba-admin-sidebar-collapsed", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex shrink-0 flex-col lg:h-screen lg:shrink-0">
      <header
        className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 lg:hidden"
        style={{
          backgroundColor: SIDEBAR_BG,
          borderColor: "rgba(212, 175, 55, 0.25)"
        }}
      >
        <button
          type="button"
          aria-label="Buka menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <p
          className="text-sm font-semibold tracking-wide [font-family:var(--font-playfair)]"
          style={{ color: GOLD }}
        >
          JBA Admin
        </p>
        <span className="w-10" />
      </header>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex max-h-screen flex-col overflow-y-auto border-r shadow-2xl transition-all duration-300 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:max-h-screen lg:translate-x-0 lg:self-start lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "w-72",
          collapsed && "lg:w-20"
        )}
        style={{
          backgroundColor: SIDEBAR_BG,
          borderColor: "rgba(212, 175, 55, 0.2)"
        }}
      >
        <div className="flex items-start justify-between gap-2 px-3 pt-5 lg:pt-6">
          <Link
            href="/admin"
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-1 transition-opacity hover:opacity-95",
              collapsed && "lg:justify-center lg:px-0"
            )}
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 bg-[#350a14] shadow-inner"
              style={{ borderColor: GOLD }}
            >
              <GraduationCap className="h-7 w-7" style={{ color: GOLD }} />
            </div>
            {!collapsed ? (
              <div className="min-w-0 py-1">
                <p
                  className="text-[0.65rem] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: `${GOLD}cc` }}
                >
                  Jakarta Beauty
                </p>
                <p className="truncate text-lg font-semibold leading-tight text-white [font-family:var(--font-playfair)]">
                  Academy
                </p>
              </div>
            ) : null}
          </Link>
          <div className="flex shrink-0 flex-col gap-1 pt-1">
            <button
              type="button"
              aria-label={collapsed ? "Lebarkan sidebar" : "Ciutkan sidebar"}
              className="hidden h-9 w-9 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 lg:flex"
              style={{ color: GOLD }}
              onClick={toggleCollapsed}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              aria-label="Tutup"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed ? (
                <p
                  className="mb-2 px-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/50 [font-family:var(--font-playfair)]"
                  style={{ color: `${GOLD}99` }}
                >
                  {group.title}
                </p>
              ) : (
                <div
                  className="mx-auto mb-2 h-px w-8 rounded-full opacity-40"
                  style={{ backgroundColor: GOLD }}
                />
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathIsActive(pathname, item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                          collapsed && "lg:justify-center lg:px-2",
                          active
                            ? "text-[#1a0509] shadow-md"
                            : "text-white/85 hover:bg-white/10 hover:text-white"
                        )}
                        style={
                          active
                            ? {
                                backgroundColor: GOLD,
                                boxShadow: "0 4px 14px rgba(212, 175, 55, 0.35)"
                              }
                            : undefined
                        }
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            active ? "text-[#1a0509]" : "text-[#D4AF37]/90"
                          )}
                        />
                        {!collapsed ? (
                          <span className="min-w-0 flex-1 leading-snug">
                            {item.label}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div
          className="mt-auto border-t p-4"
          style={{ borderColor: "rgba(212, 175, 55, 0.25)" }}
        >
          {!collapsed ? (
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/45">
              Profil Admin
            </p>
          ) : null}
          <div
            className={cn(
              "mt-2 flex items-center gap-3",
              collapsed && "lg:flex-col lg:gap-2"
            )}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold text-white"
              style={{ borderColor: `${GOLD}80`, backgroundColor: "#350a14" }}
            >
              {adminUsername.slice(0, 1).toUpperCase()}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {adminUsername}
                </p>
                <p className="text-xs text-white/50">Administrator</p>
              </div>
            ) : null}
          </div>
          <form action={adminLogoutAction} className="mt-3">
            <button
              type="submit"
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10",
                collapsed && "lg:px-2"
              )}
              style={{
                borderColor: `${GOLD}66`,
                color: GOLD,
                backgroundColor: "rgba(53, 10, 20, 0.6)"
              }}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed ? <span>Keluar</span> : null}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
