import Link from "next/link";

import { CreateClassForm } from "@/components/admin/create-class-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin/guards";

export const dynamic = "force-dynamic";

export default async function NewClassPage() {
  await requireAdminUser();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin/classes">Back to Classes</Link>
        </Button>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Create Class</CardTitle>
            <CardDescription>
              Create a B2B event, generate a code, then assign trainers from the
              class detail page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateClassForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
