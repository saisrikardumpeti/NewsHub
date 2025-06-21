import {
  createFileRoute
} from "@tanstack/react-router";
import { BaseLayout } from "@/layouts/BaseLayout";
import PersonalizedSection from "@/components/personalized-section";
import HeroSection from "@/components/hero-section";

export const Route = createFileRoute("/")({
  component: Home,
});

export function Home() {
  return (
    <BaseLayout className="space-y-4">
      <HeroSection />
      <PersonalizedSection />
    </BaseLayout>
  );
}
