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

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
  });

  // Handle auto-routing as a pure side-effect if a valid token is found on the client
  useEffect(() => {
    if (token && token !== "SERVER_RENDER") {
      router.replace("/profile");
    }
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role: string) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // 💡 Swapped out native fetch for your customized global API Axios instance
      const response = await API.post("/v1/auth/signup", payload);
      const data = response.data;

      // Safely parse and store token string into localStorage on successful signup
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

          // 💡 Extract user context and commit it to React state right now
          const userData = data.user || data.data?.user;
          updateUser(userData);

          // 💡 Use soft navigation router to keep your context and interceptor state active
          router.push("/profile");
          return `Welcome to Skaute, ${formData.firstName}!`;
        },
        error: (err: any) => {
          setLoading(false);
          return err.response?.data?.message || err.message || "Signup failed";
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

  // 1. If it's the server rendering, or if a token already exists, render loader fallback
  if (token === "SERVER_RENDER" || token !== null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#0052FF]" />
      </div>
    );
  }

  // 2. Render clean signup template for unauthenticated users
  return (
    <div className="flex h-screen w-full bg-white font-sans text-gray-900 overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />

      {/* LEFT SIDE: BRAND/VISUAL - FIXED ON DESKTOP */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#F8FAFC] items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-md w-full"
        >
          <div className="relative w-full aspect-square mb-10">
            <Image
              src="https://res.cloudinary.com/dzhfiblg7/image/upload/f_auto,q_auto,w_800/v1778054500/kivo_events/inhouse/park.png"
              alt="Join Skaute"
              fill
              className="drop-shadow-2xl rounded-[40px] object-cover border-4 border-white shadow-blue-600/10"
              priority
            />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-tight uppercase">
            Explore the <br /> <span className="text-blue-600">the vibe.</span>
          </h1>
        </motion.div>
      </div>

      {/* RIGHT SIDE: SIGN UP FORM - INDEPENDENT SCROLL */}
      <div className="w-full lg:w-1/2 flex flex-col items-center relative h-screen overflow-y-auto pt-32 pb-20 px-6 md:px-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">
              Join the Scene
            </h2>
            <p className="text-gray-400 text-sm font-medium">
              Be the first to know where the move is in Port Harcourt.
            </p>
          </div>

          {/* GOOGLE SIGN UP */}
          <button
            type="button"
            onClick={() =>
              (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/google`)
            }
            className="w-full py-4 px-6 border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-4 font-black text-[10px] uppercase tracking-widest text-gray-700 hover:bg-gray-50 hover:border-blue-600 transition-all active:scale-[0.98] mb-8"
          >
            <Image
              src="/images/google_icon.png"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Join with Google
          </button>

          <div className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-4 text-[10px] font-black uppercase text-gray-300 tracking-widest">
              or use email
            </span>
          </div>

          {/* ROLE SELECTION */}
          <div className="mb-8">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-3 block">
              I am joining as...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect("user")}
                className={`py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                  formData.role === "user"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-50 text-gray-400 hover:border-gray-200"
                }`}
              >
                Normal User
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("organizer")}
                className={`py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                  formData.role === "organizer"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-50 text-gray-400 hover:border-gray-200"
                }`}
              >
                Organizer/Host
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  First Name
                </label>
                <input
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  type="text"
                  placeholder="John"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-base"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  Last Name
                </label>
                <input
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  type="text"
                  placeholder="Doe"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-base"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                Email Address
              </label>
              <input
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="name@example.com"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-base"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
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
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-base pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={loading}
                className="w-full py-5 bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/10 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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

          <p className="mt-8 text-center text-sm text-gray-400 font-medium pb-10">
            Already a member?{" "}
            <Link
              href="/auth/signin"
              className="text-blue-600 font-black hover:underline underline-offset-4 uppercase text-[10px]"
            >
              Sign In
            </Link>
          </p>
        </motion.div>

        <div className="hidden sm:block absolute bottom-8 text-center">
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-tighter">
            © 2026 Skaute Social. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
