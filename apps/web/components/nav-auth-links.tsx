"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function NavAuthLinks() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-3 px-2 text-sm">
        <Link href="/login" className="text-fd-muted-foreground hover:text-fd-foreground">
          Log in
        </Link>
        <Link href="/register" className="text-fd-muted-foreground hover:text-fd-foreground">
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-2 text-sm">
      <Link href="/dashboard" className="text-fd-muted-foreground hover:text-fd-foreground">
        My Progress
      </Link>
      <button onClick={logout} className="text-fd-muted-foreground hover:text-fd-foreground">
        Log out
      </button>
    </div>
  );
}
