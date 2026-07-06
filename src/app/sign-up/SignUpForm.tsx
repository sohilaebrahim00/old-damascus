"use client";

import { useState } from "react";
import { useForm as useReactHookForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";

const signUpSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpValues) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (error) {
        toast(error.message, "error");
        return;
      }

      setIsSuccess(true);
      toast("Please check your email to verify your account.", "success");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <h3 className="text-xl font-bold text-brand-dark mb-4">Check your email</h3>
        <p className="text-olive mb-6">
          We&apos;ve sent a verification link to your email address. Please click the link to activate your account.
        </p>
        <Link
          href="/sign-in"
          className="font-medium text-brand-lime hover:text-brand-dark transition-colors"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-olive-dark">
            First name
          </label>
          <div className="mt-1">
            <input
              id="firstName"
              type="text"
              {...register("firstName")}
              className="block w-full rounded-xl border-brand-sand bg-white py-2.5 px-4 text-olive-dark shadow-sm focus:border-brand-lime focus:ring-brand-lime sm:text-sm"
            />
            {errors.firstName && (
              <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-olive-dark">
            Last name
          </label>
          <div className="mt-1">
            <input
              id="lastName"
              type="text"
              {...register("lastName")}
              className="block w-full rounded-xl border-brand-sand bg-white py-2.5 px-4 text-olive-dark shadow-sm focus:border-brand-lime focus:ring-brand-lime sm:text-sm"
            />
            {errors.lastName && (
              <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-olive-dark">
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
        <label htmlFor="password" className="block text-sm font-medium text-olive-dark">
          Password
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("password")}
            className="block w-full rounded-xl border-brand-sand bg-white py-2.5 px-4 pr-10 text-olive-dark shadow-sm focus:border-brand-lime focus:ring-brand-lime sm:text-sm"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center text-olive-light hover:text-olive transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-olive-dark">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("confirmPassword")}
            className="block w-full rounded-xl border-brand-sand bg-white py-2.5 px-4 text-olive-dark shadow-sm focus:border-brand-lime focus:ring-brand-lime sm:text-sm"
          />
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="acceptTerms"
          type="checkbox"
          {...register("acceptTerms")}
          className="h-4 w-4 rounded border-gray-300 text-brand-lime focus:ring-brand-lime"
        />
        <label htmlFor="acceptTerms" className="ml-2 block text-sm text-olive">
          I accept the{" "}
          <Link href="/terms" className="text-brand-dark hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-brand-dark hover:underline">
            Privacy Policy
          </Link>
        </label>
      </div>
      {errors.acceptTerms && (
        <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-brand-dark py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-lime hover:text-brand-dark transition-all focus:outline-none focus:ring-2 focus:ring-brand-lime focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </button>
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-olive">Already have an account? </span>
        <Link
          href="/sign-in"
          className="font-medium text-brand-dark hover:text-brand-lime transition-colors"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
