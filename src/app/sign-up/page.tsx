import { SignUpForm } from "./SignUpForm";

export const metadata = {
  title: "Create Account - Old Damascus",
  description: "Create an account to manage your Old Damascus orders and profile.",
};

export default function SignUpPage() {
  return (
    <div className="flex-1 flex flex-col justify-center py-16 sm:px-6 lg:px-8 bg-cream">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-heading font-bold text-olive-dark tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-olive">
          Join us to easily reorder your favorite meals and track your history.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-brand-sand">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
