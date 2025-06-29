import { ArticleCard } from "@/components/article-card";
import { ArticleModal } from "@/components/article-modal";
import { LoadingArticles } from "@/components/loading-articles";
import type { NewsArticle } from "@/hooks/use-news";
import { useSearchNews } from "@/hooks/use-search";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { LoaderPinwheel, Sparkles, Target } from "lucide-react";
import { BaseLayout } from "@/layouts/BaseLayout";
import { useSearchSummarize } from "@/hooks/use-search-summarize";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effects";
import { Skeleton } from "@/components/ui/skeleton";
import { TextLoadingSkeleton } from "@/components/ui/text-loading";
import { Button } from "@/components/ui/button";
import { useSearchRelevancy } from "@/hooks/use-search-relevancy";

type ProductSearch = {
  q?: string;
};

export const Route = createFileRoute("/search")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    return {
      q: search.q as string,
    };
  },
});

function RouteComponent() {
  const { q } = Route.useSearch();
  const { data: articles, status } = useSearchNews({ q });
  const { data: searchSummary, status: searchStatus, isFetching } =
    useSearchSummarize({ q });
  const { data: searchRelevancy, status: searchRelevancyStatus, refetch, isFetching: searchRelevancyFetching } = useSearchRelevancy({ q })
  const [active, setActive] = useState<NewsArticle | null>(
    null,
  );
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  function handleSetActive(news: NewsArticle | null) {
    setActive(news);
  }

  if (status === "pending" && searchStatus === "pending") {
    return (
      <BaseLayout className="space-y-4" q={q}>
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Showing articles for : {q}</h2>
            <Button><Target /> Check Search Relevancy</Button>
          </div>
          <LoadingArticles />
        </section>
      </BaseLayout>
    );
  }

  if (status === "error" && searchStatus === "error") {
    return <>Error..</>;
  }
  return (
    <BaseLayout className="space-y-4" q={q}>
      <section className="mb-12 space-y-4">
        {isFetching ? <AISummaryLoading /> : searchSummary
          ? (
            <div>
              <div className="space-y-2">
                <div className="bg-neutral-800 rounded-md p-4">
                  <h1 className="text-lg font-bold inline-flex items-center gap-x-2">
                    <Sparkles /> Ai Summary
                  </h1>
                  <TypewriterEffectSmooth
                    text={searchSummary?.summary as string}
                    showCursor={false}
                    typeSpeed={10}
                  />
                </div>
              </div>
            </div>
          )
          : null}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Showing articles for : {q}</h2>
          <Button className="cursor-pointer" onClick={() => refetch()}>
            {
              searchRelevancyStatus === 'pending' && searchRelevancyFetching ?
              <>
                <LoaderPinwheel className="animate-spin" /> Checking Relevancy 
              </> : searchRelevancyStatus === 'success' ? <>
                Your search relevancy is {Math.round(parseFloat(searchRelevancy.result) * 100) || 0}% 
              </> : <>
                <Target /> Check Search Relevancy
              </>
            }
          </Button>
        </div>
        <>
          <AnimatePresence>
            {active && typeof active === "object" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-neutral-800/75 h-full w-full z-10"
              />
            )}
          </AnimatePresence>
          <ArticleModal
            active={active}
            handleSetActive={handleSetActive}
            ref={ref}
            id={id}
          />
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles?.headlines.map((article) => (
              <ArticleCard
                handleSetActive={handleSetActive}
                id={id}
                news={article}
              />
            ))}
          </ul>
        </>
      </section>
    </BaseLayout>
  );
}

function AISummaryLoading() {
  return (
    <div className="bg-neutral-800 rounded-md p-4">
      <h1 className="text-lg font-bold inline-flex items-center gap-x-2">
        <Sparkles /> Ai Summary
      </h1>
      <Skeleton className="h-42 p-4">
        <TextLoadingSkeleton lines={5} skeletonClassName="bg-purple-200" />
      </Skeleton>
    </div>
  );
}
