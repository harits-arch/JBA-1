import { Button } from "@/components/ui/button";
import { deleteTrainerAction } from "@/lib/admin/actions";

export function DeleteTrainerButton({
  trainerId,
  classId
}: {
  trainerId: string;
  classId: string;
}) {
  return (
    <form action={deleteTrainerAction}>
      <input type="hidden" name="trainerId" value={trainerId} />
      <input type="hidden" name="classId" value={classId} />
      <Button size="sm" variant="ghost">
        Hapus
      </Button>
    </form>
  );
}
