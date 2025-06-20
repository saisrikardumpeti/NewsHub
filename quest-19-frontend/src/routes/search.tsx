import { ArticleCard } from "@/components/article-card";
import { ArticleModal } from "@/components/article-modal";
import { LoadingArticles } from "@/components/loading-articles";
import type { NewsArticle } from "@/hooks/use-news";
import { useSearchNews } from "@/hooks/use-search";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BaseLayout } from "@/layouts/BaseLayout";

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
            <h2 className="text-3xl font-bold">Showing articles for : {q}</h2>
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
          <h2 className="text-3xl font-bold">Showing articles for : {q}</h2>
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
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
