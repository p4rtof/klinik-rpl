import type { Session } from "@/types/klinik";

const USERS = [
  { username: "ADMIN", password: "admin123", role: "ADMIN" as const },
  { username: "DOKTER", password: "dokter123", role: "DOKTER" as const },
];

export function login(username: string, password: string): Session | null {
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return null;
  return { username: user.username, role: user.role };
}
