import { ArticleCard } from "@/components/article-card";
import { ArticleModal } from "@/components/article-modal";
import { LoadingArticles } from "@/components/loading-articles";
import {
  type NewsArticle,
  useArticles,
  useUserPreferences,
} from "@/hooks/use-news";
import { BaseLayout } from "@/layouts/BaseLayout";
import type { NEWS_CATEGORY_NAME } from "@/lib/constants";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

type ProductSearch = {
  q?: string;
  category: NEWS_CATEGORY_NAME;
};

export const Route = createFileRoute("/news")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    return {
      category: search.category as NEWS_CATEGORY_NAME,
      q: search.q as string,
    };
  },
});

function RouteComponent() {
  const { category, q } = Route.useSearch();
  const { data: userPreferences } = useUserPreferences();
  const { data: articles, status } = useArticles({
    categories: category,
    sources: userPreferences?.sources.length
      ? userPreferences.sources
      : undefined,
  });
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

  if (status === "pending") {
    return (
      <BaseLayout className="space-y-4" q={q}>
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">
              Showing articles for {category}
            </h2>
          </div>
          <LoadingArticles />
        </section>
      </BaseLayout>
    );
  }

  if (status === "error") {
    return <>Error..</>;
  }

  return (
    <BaseLayout className="space-y-4" q={q}>
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">
            Showing articles for {category}
          </h2>
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
            {articles?.headlines?.map((article) => (
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
