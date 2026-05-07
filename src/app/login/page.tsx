import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { PhoneOtpForm } from "@/components/auth/phone-otp-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle>Student Login</CardTitle>
          <CardDescription>
            Login or register with your active phone number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhoneOtpForm />
        </CardContent>
      </Card>
    </main>
  );
}
