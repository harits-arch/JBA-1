import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClassesPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Classes</h1>
            <p className="mt-2 text-muted-foreground">
              Class listing and post-test toggle controls will be built in Step 4.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/classes/new">Create Class</Link>
          </Button>
        </header>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>No Classes Loaded</CardTitle>
            <CardDescription>
              Supabase-backed class management is next after auth onboarding.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}
