import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { switchActiveClassAction } from "@/lib/student/actions";
import type { StudentRegistrationWithClass } from "@/lib/student/queries";

export function StudentClassSwitcher({
  registrations,
  activeClassId
}: {
  registrations: StudentRegistrationWithClass[];
  activeClassId: string | null;
}) {
  if (registrations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-primary">Kelas Saya</p>
        <Badge variant="secondary">{registrations.length} kelas</Badge>
      </div>
      <div className="space-y-2">
        {registrations.map((registration) => {
          const classData = registration.classes;
          const isActive = registration.class_id === activeClassId;

          return (
            <form key={registration.id} action={switchActiveClassAction}>
              <input type="hidden" name="classId" value={registration.class_id} />
              <Button
                type="submit"
                variant={isActive ? "default" : "secondary"}
                className="h-auto w-full justify-start px-4 py-3 text-left"
              >
                <span className="block font-semibold">
                  {classData?.client_name ?? "Kelas JBA"}
                </span>
                <span className="mt-1 block text-xs font-normal opacity-80">
                  {classData?.class_name ?? "Personal Grooming Class"} ·{" "}
                  {classData?.class_code ?? "-"}
                </span>
                {isActive ? (
                  <span className="mt-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    Aktif
                  </span>
                ) : null}
              </Button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
