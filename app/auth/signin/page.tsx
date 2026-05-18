/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/NavBar";
import { Loader2, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/components/auth/AuthGuard";
import { API } from "@/lib/api";

// External store helpers to sync localStorage safely with SSR
const subscribe = () => () => {};
const getSnapshot = () => localStorage.getItem("kivo_token");

// The server snapshot returns a sentinel object indicating it's rendering on the server
const getServerSnapshot = () => "SERVER_RENDER";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser } = useAuth(); // Hook into your auth context to sync user state instantly

  // Safely extract the optional redirect target path (e.g., /map), defaulting to /profile
  const redirectTo = searchParams.get("redirect") || "/profile";

  // Safely tracks token status.
  const token = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle auto-routing as a pure side-effect when a valid token is found on the client
  useEffect(() => {
    if (token && token !== "SERVER_RENDER") {
      router.replace(redirectTo);
    }
  }, [token, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loginAction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Swapped out native fetch for your customized global API Axios instance
      const response = await API.post("/v1/auth/login", formData);
      const data = response.data;

      if (data.token) {
        localStorage.setItem("kivo_token", data.token);
      }

      const userData = data.data?.user || data.user;
      localStorage.setItem("user", JSON.stringify(userData));

      return data;
    };

    toast.promise(
      loginAction(),
      {
        loading: "Authenticating...",
        success: (data) => {
          setIsLoading(false);

          // Extract user context and commit it to React state right now
          const userData = data.data?.user || data.user;
          updateUser(userData);

          // Route the user directly to their intended destination target instead of blindly hitting /profile
          router.push(redirectTo);
          return "Welcome back to Kivo!";
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (err: any) => {
          setIsLoading(false);
          // Gracefully handles both native errors and Axios error structures
          return (
            err.response?.data?.message ||
            err.message ||
            "Invalid credentials. Please try again."
          );
        },
      },
      {
        style: {
          borderRadius: "15px",
          background: "#111",
          color: "#fff",
          fontSize: "14px",
          fontWeight: "bold",
        },
        success: {
          iconTheme: { primary: "#2563eb", secondary: "#fff" },
        },
      },
    );
  };

  // 1. If it's the server rendering, or if the client has loaded and a token exists,
  // render the loader fallback. This creates a perfect match between SSR and the client's first paint.
  if (token === "SERVER_RENDER" || token !== null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#0052FF]" />
      </div>
    );
  }

  // 2. If token is explicitly null on the client, it means the user is not authenticated.
  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-gray-900 overflow-x-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      <Navbar />

      {/* LEFT SIDE: BRAND/VISUAL */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#F8FAFC] items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-3xl" />
        <div className="absolute bottom-[5%] right-[-5%] w-[300px] h-[300px] rounded-full bg-blue-400/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-md"
        >
          <Image
            src="https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778054500/kivo_events/inhouse/tower.png"
            alt="Kivo World"
            width={500}
            height={500}
            className="drop-shadow-2xl mb-10 rounded-[40px] object-contain border-4 border-white shadow-blue-600/10"
            priority
          />
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-4 uppercase">
            See the city <br />{" "}
            <span className="text-blue-600">in Real-Time.</span>
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            Join thousands of locals discovering the best events, lounges, and
            hidden gems in Port Harcourt.
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-20 relative pt-24 lg:pt-20">
        <div className="hidden lg:block lg:static lg:mb-12 self-start"></div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm mb-20 lg:mb-0"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-sm font-medium">
              Please enter your details to sign in.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const callback = encodeURIComponent(redirectTo);
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/google?callbackUrl=${callback}`;
            }}
            className="w-full py-4 px-6 border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-4 font-black text-[10px] uppercase tracking-widest text-gray-700 hover:bg-gray-50 hover:border-blue-600 transition-all active:scale-[0.98] mb-8"
          >
            <Image
              src="/images/google_icon.png"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Sign in with Google
          </button>

          <div className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-4 text-[10px] font-black uppercase text-gray-300 tracking-widest">
              or email
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="name@example.com"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-base"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 block">
                  Password
                </label>
                <Link
                  href="/auth/forgot"
                  className="text-[10px] font-black text-blue-600 uppercase hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-base pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-5 bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/10 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-400 font-medium pb-10 lg:pb-0">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-blue-600 font-black hover:underline underline-offset-4 uppercase text-[10px]"
            >
              Create an account
            </Link>
          </p>
        </motion.div>

        <div className="hidden sm:block absolute bottom-8 text-center">
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-tighter">
            © 2026 Kivo Social. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
