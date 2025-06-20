import { useEffect, useId, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type NewsArticle } from "@/hooks/use-news";
import { Skeleton } from "./ui/skeleton";
import { TextLoadingSkeleton } from "./ui/text-loading";
import { ArticleModal } from "./article-modal";
import { ArticleCard } from "./article-card";

interface NewsArticlesProps {
  news: NewsArticle[];
}

export function NewsArticles(props: NewsArticlesProps) {
  const {
    news,
  } = props;

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

  return (
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
      <ul className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start gap-4">
        {news.map((card) => (
          <ArticleCard handleSetActive={handleSetActive} id={id} news={card} />
        ))}
      </ul>
    </>
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
