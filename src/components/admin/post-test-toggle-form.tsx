import { Button } from "@/components/ui/button";
import { togglePostTestAction } from "@/lib/admin/actions";

export function PostTestToggleForm({
  classId,
  postTestOpen
}: {
  classId: string;
  postTestOpen: boolean;
}) {
  return (
    <form action={togglePostTestAction}>
      <input type="hidden" name="classId" value={classId} />
      <input
        type="hidden"
        name="postTestOpen"
        value={postTestOpen ? "false" : "true"}
      />
      <Button variant={postTestOpen ? "secondary" : "default"}>
        {postTestOpen ? "Close Post-Test Access" : "Open Post-Test Access"}
      </Button>
    </form>
  );
}
