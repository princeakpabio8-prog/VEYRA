import { TopNav } from "@/components/TopNav";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedAgentCard } from "@/components/FeaturedAgentCard";
import { PopularAgents } from "@/components/PopularAgents";
import { BottomNav } from "@/components/BottomNav";
import { getActiveAgents } from "@/lib/supabase/queries";

export default async function HomePage() {
  const agents = await getActiveAgents();

  return (
    <div
      className="relative min-h-dvh"
      style={{ backgroundColor: "#f5f0e8" }}
    >
      {/* Scrollable content — padded so it never hides behind bottom nav */}
      <main className="mx-auto max-w-lg overflow-x-hidden">
        <TopNav />
        <HeroSection />
        <FeaturedAgentCard />
        <PopularAgents agents={agents} />
      </main>

      {/* Fixed bottom navigation */}
      <BottomNav />
    </div>
  );
}
