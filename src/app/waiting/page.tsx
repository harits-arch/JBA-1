import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WaitingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg bg-white text-center">
        <CardHeader>
          <CardTitle>Enjoy Your Class</CardTitle>
          <CardDescription>
            Your pre-test has been received. The post-test will be available
            after the JBA team opens access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary">
            <Link href="/post-test">Check Post-Test</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
