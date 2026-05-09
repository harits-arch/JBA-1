import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { studentLogoutAction } from "@/lib/auth/logout-actions";

export function StudentLogoutButton({
  variant = "secondary",
  className
}: {
  variant?: "default" | "secondary" | "outline" | "ghost";
  className?: string;
}) {
  return (
    <form action={studentLogoutAction}>
      <Button type="submit" variant={variant} className={className}>
        <LogOut className="h-4 w-4" />
        Keluar
      </Button>
    </form>
  );
}
