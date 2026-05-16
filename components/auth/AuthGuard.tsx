"use client";

import { API } from "@/lib/api";
import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Simple client-side helper to set cookies so the Next.js middleware can read them
const setClientCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;expires=${expires.toUTCString()};SameSite=Lax;secure=${process.env.NODE_ENV === "production"}`;
};

const deleteClientCookie = (name: string) => {
  document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1770 00:00:00 GMT;SameSite=Lax`;
};

interface AuthContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  loading: boolean;
  logout: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUser: (userData: any) => void;
}

const AuthUserContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const localUser = localStorage.getItem("user");
        if (localUser) {
          setUser(JSON.parse(localUser));
        }

        let freshUser = null;

        if (API) {
          const response = await API.get("/v1/auth/me");
          // Safely target your backend structured output footprint
          freshUser = response.data?.data?.user || response.data?.user;
        } else {
          const token = localStorage.getItem("kivo_token");
          const headers: HeadersInit = { "Content-Type": "application/json" };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
            {
              method: "GET",
              headers,
            },
          );

          if (response.ok) {
            const data = await response.json();
            freshUser = data.data?.user || data.user;
          } else {
            throw { response: { status: response.status } };
          }
        }

        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));

          // 💡 FIX 1: If a user token is found inside the Axios instance during verification,
          // extract it or mirror it directly to cookies so proxy.ts stays in sync.
          const token = localStorage.getItem("kivo_token");
          if (token) setClientCookie("kivo_token", token, 7);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        const status = err.response?.status || err.status;

        if (status !== 401) {
          console.error(
            "Session bootstrap failed due to an unexpected server issue:",
            err,
          );
        }

        if (status === 401) {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("kivo_token");
          deleteClientCookie("kivo_token");
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  // 💡 FIX 2: Breakout Redirection Hook
  // If the validation completes, a valid user exists, and they are stuck on /auth/signin,
  // instantly redirect them out to their intended callback URL or /profile
  useEffect(() => {
    if (
      !loading &&
      user &&
      (pathname === "/auth/signin" || pathname === "/auth/signup")
    ) {
      const callbackUrl = searchParams.get("callbackUrl") || "/profile";
      router.push(callbackUrl);
    }
  }, [user, loading, pathname, searchParams, router]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("kivo_token");
    deleteClientCookie("kivo_token");
    window.location.href = "/auth/signin";
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateUser = (userData: any) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthUserContext.Provider value={{ user, loading, logout, updateUser }}>
      {children}
    </AuthUserContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthUserContext);
  if (!context) {
    throw new Error(
      "useAuth must be wrapped cleanly inside an AuthProvider component wrapper.",
    );
  }
  return context;
};
