import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewClassPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-2xl bg-white">
        <CardHeader>
          <CardTitle>Create Class</CardTitle>
          <CardDescription>
            This scaffold will become a server-action backed form in Step 4.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="client-name">Client Name</Label>
            <Input id="client-name" placeholder="PT Super Spring" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-code">Class Code</Label>
            <Input id="class-code" placeholder="SUPERSPRING2026" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-date">Class Date</Label>
            <Input id="class-date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Jakarta" />
          </div>
          <div className="sm:col-span-2">
            <Button className="w-full sm:w-auto">Save Class</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
