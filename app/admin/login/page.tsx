import AuthLoginPage from "@/app/components/auth/AuthLoginPage";

export default function AdminLoginPage() {
  return (
    <AuthLoginPage
      checkingMessage="Checking admin session..."
      description="Sign in to review appointment requests and manage the clinic diary."
      destination="/admin"
      emailPlaceholder="pearldentalclinic.india@gmail.com"
      title="Admin Login"
    />
  );
}
