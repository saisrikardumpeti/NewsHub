import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { BaseLayout } from "@/layouts/BaseLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticles, useUserPreferences } from "@/hooks/use-news";
import { Sparkles } from "lucide-react";
import { useSearchSummarize } from "@/hooks/use-search-summarize";
import { TextLoadingSkeleton } from "@/components/ui/text-loading";
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

function AISummaryLoading({
  q,
}: {
  q: string;
}) {
  return (
    <div className="bg-neutral-800 rounded-md p-4">
      <h1 className="text-lg font-bold inline-flex items-center gap-x-2">
        <Sparkles /> Ai Summary for {q}
      </h1>
      <Skeleton className="h-42 p-4">
        <TextLoadingSkeleton lines={5} skeletonClassName="bg-purple-200" />
      </Skeleton>
    </div>
  );
}
