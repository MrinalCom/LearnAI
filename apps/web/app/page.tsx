import { TopNav } from "@/components/marketing/top-nav";
import { Hero } from "@/components/marketing/hero";
import { StatsBar } from "@/components/marketing/stats-bar";
import { Features } from "@/components/marketing/features";
import { CourseGrid } from "@/components/marketing/course-grid";

export default function HomePage() {
  return (
    <>
      <TopNav />
      <Hero />
      <StatsBar />
      <Features />
      <CourseGrid />
    </>
  );
}
