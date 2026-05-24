/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/NavBar";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { API } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthGuard";

// External store helpers to sync localStorage safely with SSR
const subscribe = () => () => {};
const getSnapshot = () => localStorage.getItem("skaute_token");
const getServerSnapshot = () => "SERVER_RENDER";

export default function SignUpPage() {
  const router = useRouter();
  const { updateUser } = useAuth();

  // Safely tracks token status to prevent layout shifting on initial paint
  const token = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Prevent flashing during redirects
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  // Redirect authenticated users
  useEffect(() => {
    if (token && token !== "SERVER_RENDER") {
      router.replace("/profile");
    }
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role: string) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Your passwords do not match!", {
        style: {
          borderRadius: "18px",
          background: "#111111",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 800,
          padding: "16px 18px",
        },
      });

      return;
    }

    setLoading(true);

    const signupAction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const { firstName, lastName, email, password, role } = formData;

      const payload = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        role,
      };

      const response = await API.post("/v1/auth/signup", payload);

      const data = response.data;

      if (data.token) {
        localStorage.setItem("skaute_token", data.token);
      }

      const userData = data.user || data.data?.user;

      localStorage.setItem("user", JSON.stringify(userData));

      return data;
    };

    toast.promise(
      signupAction(),
      {
        loading: "Creating your skaute account...",

        success: (data) => {
          setLoading(false);

          const userData = data.user || data.data?.user;

          setIsRedirecting(true);

          updateUser(userData, false);

          router.push("/profile");

          return `Welcome to Skaute, ${formData.firstName}!`;
        },

        error: (err: any) => {
          setLoading(false);

          return err.response?.data?.message || err.message || "Signup failed";
        },
      },
      {
        loading: {
          style: {
            borderRadius: "18px",
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 800,
            padding: "16px 18px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          },

          iconTheme: {
            primary: "#3B82F6",
            secondary: "#ffffff",
          },
        },

        success: {
          style: {
            borderRadius: "18px",
            background: "#111111",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 800,
            padding: "16px 18px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          },

          iconTheme: {
            primary: "#2563eb",
            secondary: "#ffffff",
          },
        },

        error: {
          style: {
            borderRadius: "18px",
            background: "#1A0F10",
            border: "1px solid rgba(239,68,68,0.15)",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 800,
            padding: "16px 18px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          },

          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
      },
    );
  };

  // Prevent flash
  if (token === "SERVER_RENDER" || token !== null || isRedirecting) {
    return (
      <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#0052FF]" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white font-sans text-gray-900">
      <Toaster position="top-center" reverseOrder={false} />

      <Navbar />

      {/* MAIN WRAPPER */}
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* LEFT SIDE */}
        <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-[#F8FAFC] px-10 py-32 xl:px-16">
          {/* Background blur */}
          <div className="absolute right-[-10%] top-[-5%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 w-full max-w-xl"
          >
            {/* IMAGE */}
            <div className="relative aspect-[0.92] w-full overflow-hidden rounded-[42px] border-4 border-white shadow-2xl shadow-blue-600/10">
              <Image
                src="https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_1200/v1778054500/kivo_events/inhouse/park.png"
                alt="Join Skaute"
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* WELCOME CARD */}
            <div className="relative mx-auto -mt-16 w-[88%] rounded-[34px] border border-white/60 bg-white/85 px-8 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tighter text-gray-900 xl:text-5xl">
                Explore
                <br />
                <span className="text-blue-600">the vibe.</span>
              </h1>

              <p className="mt-5 text-sm font-medium leading-relaxed text-gray-500 xl:text-[15px]">
                Join thousands discovering events, lounges, nightlife, and
                hidden gems happening live around Port Harcourt.
              </p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex w-full flex-1 items-start justify-center overflow-y-auto px-5 pb-14 pt-28 sm:px-8 md:px-12 lg:w-1/2 lg:px-16 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            {/* MOBILE HERO */}
            <div className="mb-8 overflow-hidden rounded-[30px] bg-[#F8FAFC] p-4 shadow-sm lg:hidden">
              <div className="relative mb-5 aspect-[1.2] w-full overflow-hidden rounded-[24px]">
                <Image
                  src="https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_1200/v1778054500/kivo_events/inhouse/park.png"
                  alt="Join Skaute"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div className="rounded-[24px] bg-white p-5 shadow-sm">
                <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-gray-900">
                  Explore
                  <br />
                  <span className="text-blue-600">the vibe.</span>
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  Discover the best events, activies, and hotspots around you.
                </p>
              </div>
            </div>

            {/* HEADER */}
            <div className="mb-8 rounded-[28px] border border-gray-100 bg-white px-6 py-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
              <h2 className="mb-2 text-center text-3xl font-black uppercase tracking-tight text-gray-900 lg:text-left">
                Join the Scene
              </h2>

              <p className="text-center text-sm font-medium leading-relaxed text-gray-500 lg:text-left">
                Be the first to know where the move is in Port Harcourt.
              </p>
            </div>

            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={() =>
                (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/google`)
              }
              className="mb-8 flex w-full items-center justify-center gap-4 rounded-2xl border-2 border-gray-100 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-700 transition-all hover:border-blue-600 hover:bg-gray-50 active:scale-[0.98]"
            >
              <Image
                src="/images/google_icon.png"
                alt="Google"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              Join with Google
            </button>

            {/* DIVIDER */}
            <div className="relative mb-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>

              <span className="relative bg-white px-4 text-[10px] font-black uppercase tracking-widest text-gray-300">
                or use email
              </span>
            </div>

            {/* ROLE SELECTION */}
            <div className="mb-8">
              <label className="mb-3 ml-1 block text-[10px] font-black uppercase tracking-wider text-gray-400">
                I am joining as...
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("user")}
                  className={`rounded-2xl border-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.role === "user"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-100 text-gray-400 hover:border-gray-200"
                  }`}
                >
                  Normal User
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("organizer")}
                  className={`rounded-2xl border-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.role === "organizer"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-100 text-gray-400 hover:border-gray-200"
                  }`}
                >
                  Organizer/Host
                </button>
              </div>
            </div>

            {/* FORM */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-wider text-gray-400">
                    First Name
                  </label>

                  <input
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    type="text"
                    placeholder="John"
                    className="w-full rounded-2xl border-2 border-transparent bg-gray-50 px-5 py-4 text-base font-bold outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                  />
                </div>

                <div>
                  <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Last Name
                  </label>

                  <input
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Doe"
                    className="w-full rounded-2xl border-2 border-transparent bg-gray-50 px-5 py-4 text-base font-bold outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Email Address
                </label>

                <input
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border-2 border-transparent bg-gray-50 px-5 py-4 text-base font-bold outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Password
                </label>

                <div className="relative">
                  <input
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="w-full rounded-2xl border-2 border-transparent bg-gray-50 px-5 py-4 pr-12 text-base font-bold outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-blue-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full rounded-2xl border-2 border-transparent bg-gray-50 px-5 py-4 pr-12 text-base font-bold outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-blue-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
              <div className="pt-2">
                <button
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black py-5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/10 transition-all hover:bg-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>

            {/* FOOTER LINKS */}
            <p className="mt-8 text-center text-sm font-medium text-gray-400">
              Already a member?{" "}
              <Link
                href="/auth/signin"
                className="text-[10px] font-black uppercase text-blue-600 underline-offset-4 hover:underline"
              >
                Sign In
              </Link>
            </p>

            {/* COPYRIGHT */}
            <div className="mt-14 flex justify-center pb-4 lg:mt-16">
              <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                © 2026 Skaute Social. All rights reserved.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
