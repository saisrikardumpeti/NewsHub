"use client";

import {
  Calendar,
  Clock,
  Languages,
  Link2,
  Newspaper,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { type LanguageName, SUPPORTED_LANGUAGES } from "@/lib/languages";
import type { NewsArticle } from "@/hooks/use-news";
import { type RefObject, useState } from "react";
import { useTranslate } from "@/hooks/use-translate";
import { useSummarize } from "@/hooks/use-summarize";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { TextLoadingSkeleton } from "./ui/text-loading";
import { TypewriterEffectSmooth } from "./ui/typewriter-effects";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { CrossContent } from "./cross-content";
import { useCrossContent } from "@/hooks/use-crossContent";

interface ArticleModalType {
  active: NewsArticle | null;
  handleSetActive: (news: NewsArticle | null) => void;
  ref: RefObject<HTMLDivElement | null>;
  id: string;
}
const getReadTime = (content: string) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(" ").length;
  return Math.ceil(wordCount / wordsPerMinute);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function ArticleModal(props: ArticleModalType) {
  const { active, ref, id, handleSetActive } = props;
  const [selectedLang, setSelectedLang] = useState<LanguageName | undefined>();
  const [isCrossContentOpen, setIsCrossContentOpen] = useState<boolean>(false);
  const {
    refetch: translateRefetch,
    data: translatedArticle,
    status: tStatus,
  } = useTranslate({
    id: active?.id ? String(active.id) : undefined,
    translate: selectedLang,
  });

  const {
    refetch: summaryReftech,
    data: articleSummary,
    status: sStatus,
    isFetching: summaryFetching,
  } = useSummarize({
    id: active?.id ? String(active.id) : undefined,
    translate: selectedLang,
  });

  const {
    refetch: crossContentRefetech,
    data: crossContent,
    status: ccStatus,
  } = useCrossContent({ id: active?.id ? String(active.id) : undefined });

  const handleTranslate = (key: string) => {
    setSelectedLang(
      SUPPORTED_LANGUAGES.filter((el) => el.code === key)[0].name,
    );
    translateRefetch();
  };

  const handleSummary = () => {
    summaryReftech();
  };

  const openCrossContent = () => {
    setIsCrossContentOpen(true);
    crossContentRefetech();
  };

  useOutsideClick(ref, () => {
    handleSetActive(null);
    setSelectedLang(undefined);
    setIsCrossContentOpen(false);
  });

  return (
    <AnimatePresence>
      {active && typeof active === "object"
        ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[920px] overflow-y-scroll h-[98%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-xl relative"
            >
              <motion.div
                layoutId={`image-${active.title}-${id}`}
                className="relative"
              >
                <img
                  width={200}
                  height={200}
                  src={active.image_url || "/placeholder.svg"}
                  alt={active.title}
                  className="w-full h-80 lg:h-[560px] sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                  onError={(
                    e,
                  ) => ((e.target as HTMLImageElement).src =
                    "https://placehold.co/1080x720?text=Image%20not%20provided")}
                />
                <motion.button
                  key={`button-${active.title}-${id}`}
                  layoutId={`image-close-button-${id}`}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: 0.05,
                    },
                  }}
                  className="flex absolute top-2 right-2 items-center justify-center bg-white rounded-full size-11 cursor-pointer"
                  onClick={() => handleSetActive(null)}
                >
                  <CloseIcon />
                </motion.button>
                <motion.div
                  layoutId={`card-link-button-${id}`}
                  className="absolute bottom-2 right-2 flex items-center gap-x-2"
                >
                  <motion.div
                    className="p-[3px] relative "
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full" />
                    <a
                      href={active.article_url}
                      target="_blank"
                      className="size-10 bg-black rounded-full relative group transition duration-200 text-white hover:bg-transparent inline-flex items-center justify-center"
                      rel="noreferrer"
                    >
                      <Link2 />
                    </a>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-full"
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-[3px] relative cursor-pointer"
                          onClick={handleSummary}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" />
                          <div className="size-10 bg-black rounded-full relative group transition duration-200 text-white hover:bg-transparent inline-flex items-center justify-center">
                            <Languages className="size-6" />
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-fit z-[200]"
                        onPointerDownOutside={(event) => {
                          event.preventDefault();
                        }}
                      >
                        <DropdownMenuLabel className="inline-flex items-center gap-x-4">
                          <Languages /> Translate
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {SUPPORTED_LANGUAGES.map((el) => {
                          return (
                            <DropdownMenuCheckboxItem
                              checked={selectedLang === el.name}
                              key={el.code}
                              onCheckedChange={() => handleTranslate(el.code)}
                            >
                              {el.name}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <button
                      className="p-[3px] relative cursor-pointer"
                      onClick={handleSummary}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                      <div className="size-10 bg-black rounded-full relative group transition duration-200 text-white hover:bg-transparent inline-flex items-center justify-center">
                        <Sparkles className="size-6" />
                      </div>
                    </button>
                  </motion.button>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <button
                      className="p-[3px] relative cursor-pointer"
                      onClick={openCrossContent}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                      <div className="size-10 bg-black rounded-full relative group transition duration-200 text-white hover:bg-transparent inline-flex items-center justify-center">
                        <Newspaper className="size-6" />
                      </div>
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div className="flex-1 relative">
                <div className="flex items-center gap-2 my-3 p-3">
                  <Badge variant="outline" className="text-xs">
                    <Calendar />
                    {formatDate(active.published_at)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock />
                    {getReadTime(active.content)} min read
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {active.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {active.source_name}
                  </Badge>
                </div>
                <div className="flex justify-between items-start p-4">
                  <div className="w-full">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-medium text-neutral-700 dark:text-neutral-200 text-2xl w-full"
                    >
                      {tStatus === "pending" && selectedLang
                        ? <TextLoadingSkeleton lines={1} />
                        : (
                          translatedArticle?.translated_title
                        )}
                      {!selectedLang ? active.title : null}
                    </motion.h3>
                  </div>
                </div>
                {summaryFetching && sStatus === "pending"
                  ? (
                    <div>
                      <motion.div
                        layoutId={`ai-summary-${id}`}
                        className="p-4 space-y-2"
                      >
                        <AISummaryLoading />
                      </motion.div>
                    </div>
                  )
                  : (
                    articleSummary && (
                      <div>
                        <motion.div
                          layoutId={`ai-summary-${id}`}
                          className="p-4 space-y-2"
                        >
                          <div className="bg-neutral-800 rounded-md p-4">
                            <h1 className="text-lg font-bold inline-flex items-center gap-x-2">
                              <Sparkles /> Ai Summary
                            </h1>
                            <TypewriterEffectSmooth
                              text={articleSummary?.summary as string}
                              showCursor={false}
                              typeSpeed={10}
                            />
                          </div>
                        </motion.div>
                      </div>
                    )
                  )}
                <div className="relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-fit pb-10 flex flex-col items-start gap-4 dark:text-neutral-400 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {tStatus === "pending" && selectedLang
                      ? <TextLoadingSkeleton lines={10} />
                      : <p>{translatedArticle?.translated_content}</p>}
                    {!selectedLang
                      ? <p className="h-full">{active.content}</p>
                      : null}
                  </motion.div>
                </div>
                <AnimatePresence>
                  {isCrossContentOpen && (
                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 200,
                        duration: 0.5,
                      }}
                      className="absolute inset-0 bg-white dark:bg-neutral-900 z-10 flex flex-col max-h-full"
                      role="complementary"
                      aria-label="Related content"
                    >
                      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                          <Newspaper className="size-5" />
                          Cross Content Checker
                        </h2>
                        <button
                          onClick={() => setIsCrossContentOpen(false)}
                          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          aria-label="Close related content"
                        >
                          <X className="size-5" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <CrossContent
                          data={crossContent || ""}
                          isLoading={ccStatus === "pending"}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        )
        : null}
    </AnimatePresence>
  );
}

const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

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
