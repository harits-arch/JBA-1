import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PreTestPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-2xl bg-white">
        <CardHeader>
          <CardTitle>Pre-Test</CardTitle>
          <CardDescription>
            Gender-specific pre-test forms and before-photo upload will be built
            in Step 5.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
