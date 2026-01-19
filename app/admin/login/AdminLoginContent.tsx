"use client";

import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/Toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof loginSchema>;

export default function AdminLoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const getFirebaseErrorMessage = (error: { code: string; message: string }) => {
    switch (error.code) {
      case "auth/invalid-credential":
        return "Invalid email or password. Please try again.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password is too weak.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  };

  const onSubmit = async () => {
    setLoading(true);

    try {
      router.push("/admin");
    } catch (err: unknown) {
      console.error(err);
      toast.error(getFirebaseErrorMessage(err as { code: string; message: string }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google!");
      router.push("/admin");
    } catch (err: unknown) {
      console.error(err);
      toast.error(getFirebaseErrorMessage(err as { code: string; message: string }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100'>
        <div className='flex justify-center mb-8'>
          <div className='p-4 bg-blue-50 rounded-2xl'>
            <AnimatePresence mode='wait'>
              {isLogin ? (
                <motion.div
                  key='login-icon'
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}>
                  <LogIn className='w-8 h-8 text-blue-600' />
                </motion.div>
              ) : (
                <motion.div
                  key='register-icon'
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}>
                  <UserPlus className='w-8 h-8 text-blue-600' />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2 tracking-tight'>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className='text-gray-500 text-sm'>
            {isLogin
              ? "Please sign in to continue to Admin"
              : "Get started with your new admin account"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1.5'>
              Email Address
            </label>
            <input
              {...register("email")}
              type='email'
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder:text-gray-400 transition-all bg-gray-50/50 focus:bg-white ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
              placeholder='name@company.com'
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1" data-testid="email-error">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1.5'>
              Password
            </label>
            <div className='relative'>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder:text-gray-400 transition-all bg-gray-50/50 focus:bg-white pr-12 ${
                  errors.password ? "border-red-500" : "border-gray-200"
                }`}
                placeholder='••••••••'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors'>
                {showPassword ? (
                  <EyeOff className='w-4 h-4' />
                ) : (
                  <Eye className='w-4 h-4' />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
            <AnimatePresence>
              {!isLogin && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className='text-xs text-gray-500 mt-2 flex items-center gap-1'>
                  <svg
                    className='w-3 h-3'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  Must be at least 6 characters long
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-all disabled:bg-blue-400 font-semibold shadow-lg shadow-blue-600/20 active:scale-[0.98]'>
            {loading
              ? isLogin
                ? "Signing in..."
                : "Creating account..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              reset();
            }}
            className='text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors'>
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <span className='text-blue-600 underline decoration-blue-600/30 hover:decoration-blue-600'>
                  Register now
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span className='text-blue-600 underline decoration-blue-600/30 hover:decoration-blue-600'>
                  Login here
                </span>
              </>
            )}
          </button>
        </div>

        <div className='mt-8 mb-6 flex items-center justify-center'>
          <div className='border-t border-gray-200 w-full'></div>
          <span className='px-4 text-gray-400 bg-white text-xs font-medium uppercase tracking-wider whitespace-nowrap'>
            Or continue with
          </span>
          <div className='border-t border-gray-200 w-full'></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className='w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:bg-gray-50 flex items-center justify-center gap-3 font-medium'>
          <svg className='w-5 h-5' viewBox='0 0 24 24'>
            <path
              fill='currentColor'
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
              fill='currentColor'
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
              fill='currentColor'
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            />
            <path
              fill='currentColor'
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            />
          </svg>
          Google Account
        </button>
      </motion.div>
    </div>
  );
}
