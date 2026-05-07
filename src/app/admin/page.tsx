import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const adminModules = [
  "Create classes and unique class codes",
  "Assign trainers, MCs, and partner teams per class",
  "Toggle post-test access after each session",
  "Review submissions and export results"
];

export default function AdminPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              JBA Operations
            </p>
            <h1 className="mt-2 text-3xl font-bold text-primary">
              Admin Dashboard
            </h1>
          </div>
          <Button asChild>
            <Link href="/admin/classes/new">Create Class</Link>
          </Button>
        </header>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Dashboard Scaffold</CardTitle>
            <CardDescription>
              Admin CRUD, trainer assignment, and submission viewer will be
              implemented after authentication is connected.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {adminModules.map((module) => (
              <div key={module} className="rounded-2xl border bg-background p-4">
                {module}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
