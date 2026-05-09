import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminSession } from "@/lib/admin/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8ead0_0%,#f7f2ea_34%,#f2ece4_100%)] lg:flex">
      <AdminSidebar adminUsername={adminSession.username} />
      <div className="min-h-screen min-w-0 flex-1">{children}</div>
    </div>
  );
}
