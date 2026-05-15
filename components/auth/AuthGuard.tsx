"use client";

import { useEffect, useState, createContext, useContext } from "react";

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

  // Synchronous initial loading helper to prevent state flashing
  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        // 1. Instant local optimization: Read from disk so route guards pass immediately
        const localUser = localStorage.getItem("user");
        if (localUser) {
          setUser(JSON.parse(localUser));
        }

        // 2. Background verification check: Fetch fresh profile data from Express API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (response.ok) {
          const data = await response.json();
          const freshUser = data.data?.user || data.user;

          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        } else {
          // If backend says session is dead, clear local caching layers entirely
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("Session bootstrap failed:", err);
      } finally {
        // Validation process finished completely
        setLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
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
