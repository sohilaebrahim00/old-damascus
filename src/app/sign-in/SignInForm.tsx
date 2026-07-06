"use client";

import { useState } from "react";
import { useForm as useReactHookForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast(error.message, "error");
        return;
      }

      toast("You have successfully signed in.", "success");
      
      router.push("/account");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-olive-dark"
          >
            Password
          </label>
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-brand-dark hover:text-brand-lime transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
        <div className="mt-1 relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
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
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-brand-dark py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-lime hover:text-brand-dark transition-all focus:outline-none focus:ring-2 focus:ring-brand-lime focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </button>
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-olive">Don&apos;t have an account? </span>
        <Link
          href="/sign-up"
          className="font-medium text-brand-dark hover:text-brand-lime transition-colors"
        >
          Sign up now
        </Link>
      </div>
    </form>
  );
}
