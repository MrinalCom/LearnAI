import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { NavAuthLinks } from "@/components/nav-auth-links";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "LearnAI",
    },
    links: [
      {
        type: "main",
        text: "Playground",
        url: "/playground",
      },
      {
        type: "custom",
        children: <NavAuthLinks />,
      },
    ],
  };
}
