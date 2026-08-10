import { TopNav } from "@/components/marketing/top-nav";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { CourseGrid } from "@/components/marketing/course-grid";

export default function HomePage() {
  return (
    <>
      <TopNav />
      <Hero />
      <Features />
      <CourseGrid />
    </>
  );
}
