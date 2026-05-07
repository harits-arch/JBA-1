import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PostTestPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-2xl bg-white">
        <CardHeader>
          <CardTitle>Post-Test</CardTitle>
          <CardDescription>
            This page will unlock only when the class admin opens post-test
            access.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
