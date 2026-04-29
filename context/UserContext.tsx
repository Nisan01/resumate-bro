"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
   avatarUrl: string | null;
  targetRole: string | null;
  targetIndustry: string | null;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UpdateUserData) => Promise<void>;
}

type UpdateUserData = {
  targetRole?: string;
  targetIndustry?: string;
};


const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const route = useRouter();


  useEffect(() => {
    fetch("/api/auth/user-data", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await fetch("/api/auth/sign-in", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });

      route.push("/"); 

    } catch {
      // Keep local logout resilient even if the network request fails.
    }
    setUser(null);
  };

const updateUser = async (data: UpdateUserData) => {
  const res = await fetch("/api/auth/update-profile", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user?.id, updateData: data }),
  });

  if (!res.ok) throw new Error("Update failed");

  const result = await res.json();

  setUser((prev) => (prev ? { ...prev, ...data } : prev));
};
  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}


export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}