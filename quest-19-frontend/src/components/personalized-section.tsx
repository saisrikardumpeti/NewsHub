import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { Plus, TrendingUp } from "lucide-react";
import { type NewsArticle, useUserPreferences } from "@/hooks/use-news";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ArticleModal } from "./article-modal";
import { ArticleCard } from "./article-card";
import { usePersonalRecommendations } from "@/hooks/use-personal-recommendation";
import { LoadingArticles } from "./loading-articles";
import { Link } from "@tanstack/react-router";

export default function PersonalizedSection() {
  const { data: userPreferences } = useUserPreferences();
  const { data: articles, status } = usePersonalRecommendations({
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

  if (
    userPreferences?.categories.length === 0 &&
    userPreferences.sources.length === 0
  ) {
    return (
      <div className="flex items-center justify-center h-96 bg-neutral-900 rounded-md p-4">
        <Link
          to="/preferences"
          className="inline-flex p-2 rounded-md bg-neutral-800"
        >
          <Plus /> Add your preferences
        </Link>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <Badge variant="secondary">Personalized</Badge>
        </div>
        <LoadingArticles />
      </section>
    );
  }

  if (status === "error") {
    return <>Error..</>;
  }
  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Recommended for You</h2>
        <Badge variant="secondary">Personalized</Badge>
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
  );
}
