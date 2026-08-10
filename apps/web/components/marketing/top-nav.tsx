import Link from "next/link";
import { NavAuthLinks } from "@/components/nav-auth-links";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-fd-border bg-fd-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          LearnAI
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/docs" className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
            Courses
          </Link>
          <Link href="/playground" className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
            Playground
          </Link>
          <NavAuthLinks />
        </nav>
      </div>
    </header>
  );
}
