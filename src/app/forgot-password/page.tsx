"use client";

import { useState } from "react";
import { useForm as useReactHookForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        toast(error.message, "error");
        return;
      }

      setIsSuccess(true);
      toast("Password reset instructions sent to your email.", "success");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-16 sm:px-6 lg:px-8 bg-cream">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-heading font-bold text-olive-dark tracking-tight">
          Forgot your password?
        </h2>
        <p className="mt-2 text-sm text-olive">
          Enter your email address to receive password reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-brand-sand">
          {isSuccess ? (
            <div className="text-center py-6">
              <h3 className="text-xl font-bold text-brand-dark mb-4">Check your email</h3>
              <p className="text-olive mb-6">
                We&apos;ve sent password reset instructions to your email address.
              </p>
              <Link
                href="/sign-in"
                className="font-medium text-brand-lime hover:text-brand-dark transition-colors"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-olive-dark"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    className="block w-full rounded-xl border-brand-sand bg-white py-2.5 px-4 text-olive-dark shadow-sm focus:border-brand-lime focus:ring-brand-lime sm:text-sm"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-brand-dark py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-lime hover:text-brand-dark transition-all focus:outline-none focus:ring-2 focus:ring-brand-lime focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send Reset Link
                </button>
              </div>

              <div className="mt-6 text-center text-sm">
                <Link
                  href="/sign-in"
                  className="font-medium text-brand-dark hover:text-brand-lime transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
