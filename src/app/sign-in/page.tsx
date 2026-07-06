import { SignInForm } from "./SignInForm";

export const metadata = {
  title: "Sign In - Old Damascus",
  description: "Sign in to your Old Damascus account to view orders and manage your profile.",
};

export default function SignInPage() {
  return (
    <div className="flex-1 flex flex-col justify-center py-16 sm:px-6 lg:px-8 bg-cream">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-heading font-bold text-olive-dark tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-olive">
          Sign in to your account to view order history and manage your preferences.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-brand-sand">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
