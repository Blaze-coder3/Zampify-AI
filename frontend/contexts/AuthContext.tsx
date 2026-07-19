"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export type Role = "specialist" | "admin";

export interface User {
  name: string;
  email: string;
  role: Role;
  initials: string;
  avatar?: string;
}

export const USERS: Record<Role, User> = {
  specialist: {
    name: "Priya Sharma",
    email: "priya@zampify.ai",
    role: "specialist",
    initials: "PS",
    avatar: "/priya.png"
  },

  admin: {
    name: "Arjun Mehta",
    email: "admin@acmemfg.com",
    role: "admin",
    initials: "AM"
  }
};

interface AuthContextType {
  user: User;
  switchRole: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User>(USERS.specialist);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedRole = localStorage.getItem("zampify_demo_role") as Role;
    if (storedRole && USERS[storedRole]) {
      setUser(USERS[storedRole]);
    }
  }, []);

  const switchRole = (newRole: Role) => {
    setUser(USERS[newRole]);
    localStorage.setItem("zampify_demo_role", newRole);
    
    // Auto-redirect to appropriate dashboard
    if (newRole === "specialist") {
      router.push("/");
    } else if (newRole === "admin") {
      router.push("/system");
    }
  };

  const logout = () => {
    localStorage.removeItem("zampify_demo_role");
    localStorage.removeItem("zampify_user");
    router.push("/login");
  };

  // We delay rendering children until mounted to prevent hydration mismatch
  if (!isMounted) return null;

  return (
    <AuthContext.Provider value={{ user, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
