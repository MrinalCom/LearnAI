import Link from "next/link";
import { GitFork } from "lucide-react";

const COURSE_LINKS = [
  { title: "Foundations", href: "/docs/courses/foundations/math-foundations/linear-algebra-essentials" },
  { title: "Classical ML", href: "/docs/courses/classical-ml/instance-based-and-linear-models/knn" },
  { title: "Deep Learning", href: "/docs/courses/deep-learning/neural-network-foundations/the-perceptron-and-mlp" },
  { title: "NLP & LLM Foundations", href: "/docs/courses/nlp-and-llm-foundations/tokenization-and-embeddings/tokenization" },
  { title: "Retrieval-Augmented Generation", href: "/docs/courses/rag/rag-fundamentals/what-is-rag" },
  { title: "Agentic AI", href: "/docs/courses/agentic-ai/foundations-of-agents/what-is-an-agent" },
  { title: "Applied AI & Production", href: "/docs/courses/applied-and-production/fine-tuning/when-to-fine-tune" },
];

const PLATFORM_LINKS = [
  { title: "Courses", href: "/docs" },
  { title: "Playground", href: "/playground" },
  { title: "My Progress", href: "/dashboard" },
];

const ACCOUNT_LINKS = [
  { title: "Log in", href: "/login" },
  { title: "Sign up", href: "/register" },
];

export function Footer() {
  return (
    <footer className="border-t border-fd-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              LearnAI
            </Link>
            <p className="mt-2 max-w-[20ch] text-sm text-fd-muted-foreground">
              Learn AI end-to-end, by building it.
            </p>
          </div>

          <FooterColumn title="Platform" links={PLATFORM_LINKS} />

          <FooterColumn title="Courses" links={COURSE_LINKS} />

          <FooterColumn title="Account" links={ACCOUNT_LINKS} />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-fd-border pt-6 sm:flex-row">
          <p className="text-xs text-fd-muted-foreground">
            © {new Date().getFullYear()} LearnAI. Free and open — built for learning, not production advice.
          </p>
          <a
            href="https://github.com/MrinalCom/LearnAI"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-fd-muted-foreground hover:text-fd-foreground"
          >
            <GitFork className="size-4" /> Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { title: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">{title}</h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
