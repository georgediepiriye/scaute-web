"use client";

import { useEffect, useState, createContext, useContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AuthUserContext = createContext<any>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session bootstrap failed", err);
      } finally {
        setLoading(false);
      }
    };
    bootstrapSession();
  }, []);

  return (
    <AuthUserContext.Provider value={{ user, loading }}>
      {children}
    </AuthUserContext.Provider>
  );
}

export const useAuth = () => useContext(AuthUserContext);
