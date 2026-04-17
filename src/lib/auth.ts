import { getSession, clearSession, getUsers } from "./storage";
import type { Session, User } from "@/types/klinik";
import { redirect } from "next/navigation";

export function getCurrentUser(): Session | null {
  return getSession();
}

export function requireAuth(requiredRole?: "ADMIN" | "DOKTER") {
  const session = getSession();
  if (!session) {
    redirect("/login");
  }
  if (requiredRole && session.role !== requiredRole) {
    redirect("/login");
  }
}

export function login(username: string, password: string): Session | null {
  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  if (user) {
    const session: Session = { username: user.username, role: user.role };
    return session;
  }
  return null;
}

// Keep auth exports clean, logout wrapper in storage
