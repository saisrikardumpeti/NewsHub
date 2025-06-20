import { motion } from "motion/react";
import { Badge } from "./ui/badge";
import type { NewsArticle } from "@/hooks/use-news";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  news: NewsArticle;
  handleSetActive: (news: NewsArticle) => void;
  id: string;
  className?: string;
}

export function ArticleCard(props: ArticleCardProps) {
  const {
    news,
    id,
    handleSetActive,
    className,
  } = props;

  return (
    <motion.div
      layoutId={`card-${news.title}-${id}`}
      key={`${news.title}-${id}`}
      onClick={() => handleSetActive(news)}
      className={cn(
        "p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer border-2",
        className,
      )}
    >
      <div className="flex gap-4 flex-col w-full">
        <motion.div layoutId={`image-${news.title}-${id}`} className="relative">
          <Badge className="absolute right-2 bottom-2">
            {news.source_name}
          </Badge>
          <img
            width={100}
            height={100}
            src={news.image_url}
            alt={news.title}
            onError={(e) =>
              (e.target as HTMLImageElement).src =
                "https://placehold.co/1080x720?text=Image%20not%20provided"}
            className={"h-60 w-full rounded-lg object-cover object-top"}
          />
        </motion.div>
        <div className="flex justify-center items-center flex-col space-y-2">
          <motion.h3
            layoutId={`title-${news.title}-${id}`}
            className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base line-clamp-1"
          >
            {news.title}
          </motion.h3>
          <motion.p
            layoutId={`description-${news.description}-${id}`}
            className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-sm line-clamp-2"
          >
            {news.description}
          </motion.p>
          <div className="text-xs w-full flex items-center justify-between">
            <motion.p className="">
              Published On:{" "}
              {new Date(news.published_at || news.created_at).toDateString()}
            </motion.p>
            <motion.p className="">
              {news.category}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
