import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { type NewsArticle } from "@/hooks/use-news";
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
