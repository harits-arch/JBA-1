import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  GraduationCap,
  PlusCircle
} from "lucide-react";

import { getAdminSession } from "@/lib/admin/auth";
import { adminLogoutAction } from "@/lib/admin/login-actions";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/classes", label: "Kelas", icon: CalendarDays },
  { href: "/admin/classes/new", label: "Buat Kelas", icon: PlusCircle }
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const adminSession = await getAdminSession();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8ead0_0%,#f7f2ea_34%,#f2ece4_100%)] lg:flex">
      <aside className="sticky top-0 z-40 border-b border-accent/20 bg-primary px-4 py-4 text-primary-foreground lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:border-accent/20 lg:px-5 lg:py-6">
        <div className="flex items-center justify-between gap-3 lg:block">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/60 bg-accent/10">
              <GraduationCap className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Jakarta Beauty
              </p>
              <p className="text-xl font-bold [font-family:var(--font-playfair)]">
                Academy Admin
              </p>
            </div>
          </Link>
        </div>

        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-primary-foreground/85 transition-colors hover:bg-accent/20 hover:text-accent lg:w-full"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 hidden rounded-3xl border border-accent/25 bg-white/10 p-4 text-sm leading-6 text-primary-foreground/75 lg:block">
          <p className="font-semibold text-accent [font-family:var(--font-playfair)]">
            Premium Beauty Academy
          </p>
          <p className="mt-2">
            Kelola kelas, progress student, foto transformasi, dan feedback dalam
            satu workspace.
          </p>
        </div>

      </aside>

      <div className="min-w-0 flex-1">
        {adminSession ? (
          <div className="flex justify-end px-4 pt-4 sm:px-6 lg:px-8">
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="rounded-full border border-accent/40 bg-white/85 px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-accent/15"
            >
              Keluar
            </button>
          </form>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
