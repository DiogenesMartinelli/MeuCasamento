import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAccount } from "@/lib/current-account";
import { OnboardingForm } from "@/components/admin/onboarding-form";

export default async function OnboardingPage() {
  const account = await getCurrentAccount();
  if (account) redirect("/admin");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Vamos criar o site do seu casamento</CardTitle>
        <CardDescription>Você poderá alterar essas informações depois.</CardDescription>
      </CardHeader>
      <CardContent>
        <OnboardingForm />
      </CardContent>
    </Card>
  );
}
