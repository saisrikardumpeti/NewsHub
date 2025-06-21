import { type NewsArticle } from "@/hooks/use-news";
import { Clock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { ArticleModal } from "./article-modal";
import { useHeadlines } from "@/hooks/use-headlines";
import type { NEWS_CATEGORY_NAME } from "@/lib/constants";

interface HeroSectionProps {
  category?: NEWS_CATEGORY_NAME;
}

export default function HeroSection({ category }: HeroSectionProps) {
  const [active, setActive] = useState<NewsArticle | null>(
    null,
  );
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  const { data: headlines, status } = useHeadlines({
    category: category || "",
  });

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
    return <>Loading...</>;
  }
  if (status === "error") {
    return <>Error loading headlines</>;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Breaking News</h2>
      </div>
      {headlines.headlines.length > 0
        ? (
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MainHeadline
                handleSetActive={handleSetActive}
                id={id}
                news={headlines?.headlines[0]}
              />

              {/* Side Headlines */}
              <div className="space-y-4">
                {headlines?.headlines.slice(1, 5).map((article) => (
                  <SideHeadlines
                    handleSetActive={handleSetActive}
                    id={id}
                    news={article}
                  />
                ))}
              </div>
            </div>
          </>
        )
        : null}
    </section>
  );
}

interface MainHeadlineProps {
  news: NewsArticle;
  handleSetActive: (news: NewsArticle) => void;
  id: string;
}

function MainHeadline(props: MainHeadlineProps) {
  const {
    news,
    id,
    handleSetActive,
  } = props;

  return (
    <motion.div
      layoutId={`card-${news.title}-${id}`}
      key={`${news.title}-${id}`}
      onClick={() => handleSetActive(news)}
      className="lg:col-span-2 rounded-md cursor-pointer overflow-hidden relative py-0"
    >
      <motion.div className="absolute">
        <motion.img
          src={news.image_url ||
            "https://placehold.co/1080x720?text=Image%20not%20provided"}
          alt={news.title}
          className="object-cover w-full h-full"
        />
      </motion.div>
      <div className="bottom-0 h-96">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <motion.div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-2xl font-bold mb-2 line-clamp-2">{news.title}</h3>
          <p className="text-sm opacity-90 line-clamp-2 mb-2">
            {news.description}
          </p>
          <div className="flex items-center text-xs opacity-75">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(news.published_at || news.created_at).toDateString()}
            <span className="mx-2">•</span>
            {news.source_name}
            <span className="mx-2">•</span>
            {news.category}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface HeadlineProps {
  news: NewsArticle;
  handleSetActive: (news: NewsArticle) => void;
  id: string;
}

function SideHeadlines(props: HeadlineProps) {
  const {
    handleSetActive,
    id,
    news,
  } = props;

  return (
    <motion.div
      layoutId={`card-${news.title}-${id}`}
      key={`card-${news.title}-${id}`}
      onClick={() => handleSetActive(news)}
      className="px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer border-2"
    >
      <div className="flex justify-between items-center">
        <motion.div
          layoutId={`image-${news.title}-${id}`}
          className="min-h-24 min-w-24"
        >
          <img
            src={news.image_url}
            alt={news.title}
            className="h-24 w-24 rounded-lg object-cover"
            onError={(e) =>
              (e.target as HTMLImageElement).src =
                "https://placehold.co/1080x720?text=Image%20not%20provided"}
          />
        </motion.div>
        <div className="w-fit p-2 flex flex-col">
          <motion.h3
            layoutId={`title-${news.title}-${id}`}
            className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left line-clamp-1"
          >
            {news.title}
          </motion.h3>
          <motion.p
            layoutId={`description-${news.description}-${id}`}
            className="text-neutral-600 dark:text-neutral-400 text-center md:text-left line-clamp-2"
          >
            {news.description}
          </motion.p>
          <div className="flex items-center justify-end text-xs opacity-75 flex-wrap overflow-hidden">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(news.published_at || news.created_at).toDateString()}
            <span className="mx-2">•</span>
            {news.source_name}
            <span className="mx-2">•</span>
            {news.category}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
