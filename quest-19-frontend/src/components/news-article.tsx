import { useEffect, useId, useRef, useState } from "react";
import { Languages, Link2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { useSummarize } from "@/hooks/use-summarize";
import { type NewsArticle } from "@/hooks/use-news";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SUPPORTED_LANGUAGES, type LanguageName } from "@/lib/languages";
import { useTranslate } from "@/hooks/use-translate";
import { Skeleton } from "./ui/skeleton";
import { TextLoadingSkeleton } from "./ui/text-loading";

interface NewsArticlesProps {
  news: NewsArticle[];
}

export function NewsArticles(props: NewsArticlesProps) {

  const {
    news
  } = props

  const [active, setActive] = useState<(typeof news)[number] | boolean | null>(
    null
  );
  const id = useId()
  const ref = useRef<HTMLDivElement>(null);

  const [selectedLang, setSelectedLang] = useState<LanguageName | undefined>()
  // @ts-ignore
  const { refetch: translateRefetch, data: translatedArticle, status: tStatus } = useTranslate({ id: active?.id, translate: selectedLang })
  // @ts-ignore
  const { refetch: summaryReftech, data: articleSummary, status: sStatus, isFetching: summaryFetching } = useSummarize({ id: active?.id, translate: selectedLang })

  const handleTranslate = (key: string) => {
    setSelectedLang(SUPPORTED_LANGUAGES.filter(el => el.code === key)[0].name)
    translateRefetch()
  }

  const handleSummary = () => {
    summaryReftech()
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
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


  useOutsideClick(ref, () => {
    setActive(null);
    setSelectedLang(undefined)
  });

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[832px] overflow-y-scroll h-full md:h-fit md:max-h-[95%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.title}-${id}`} className="relative">
                <img
                  width={200}
                  height={200}
                  src={active.urltoimage}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
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
                  onClick={() => setActive(null)}
                >
                  <CloseIcon />
                </motion.button>
                <motion.a
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  href={active.url}
                  target="_blank"
                  className="size-11 text-sm rounded-full font-bold bg-green-500 text-white absolute bottom-2 right-2 inline-flex items-center justify-center"
                >
                  <Link2 />
                </motion.a>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="absolute bottom-2 right-14">
                    <Button variant="secondary" size="icon" className="rounded-full size-11 cursor-pointer"><Languages className="size-6" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-fit z-[200]"
                    onPointerDownOutside={(event) => {
                      event.preventDefault()
                    }}>
                    <DropdownMenuLabel className="inline-flex items-center gap-x-4"><Languages /> Translate</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {
                      SUPPORTED_LANGUAGES.map((el) => {
                        return (
                          <DropdownMenuCheckboxItem
                            checked={selectedLang === el.name}
                            key={el.code}
                            onCheckedChange={() => handleTranslate(el.code)}
                          >
                            {el.name}
                          </DropdownMenuCheckboxItem>
                        )
                      })
                    }
                  </DropdownMenuContent>
                </DropdownMenu>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-2 right-26">
                  <button className="p-[3px] relative cursor-pointer" onClick={handleSummary}>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    <div className="size-10 bg-black rounded-full relative group transition duration-200 text-white hover:bg-transparent inline-flex items-center justify-center">
                      <Sparkles className="size-6" />
                    </div>
                  </button>
                </motion.div>
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4 overflow-y-scroll">
                  <div className="w-full">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-medium text-neutral-700 dark:text-neutral-200 text-2xl w-full"
                    >
                      {
                        tStatus === 'pending' && selectedLang ?
                          <TextLoadingSkeleton lines={1} /> : translatedArticle?.translated_title
                      }
                      {
                        !selectedLang ?
                          active.title
                          : null
                      }
                    </motion.h3>
                  </div>
                </div>

                <div>
                  <motion.div layoutId={`ai-summary-${id}`} className="p-4">
                    {
                      sStatus === 'pending' && summaryFetching ?
                        <AISummaryLoading /> : articleSummary?.summary
                    }
                  </motion.div>
                </div>

                <div className="relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {
                      tStatus === 'pending' && selectedLang ?
                        <TextLoadingSkeleton lines={10} /> : <p>{translatedArticle?.translated_content}</p>
                    }
                    {
                      !selectedLang ?
                        <p className="h-full">{active.content}</p>
                        : null
                    }
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start gap-4">
        {news.map((card) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={card.title}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer border-2"
          >
            <div className="flex gap-4 flex-col  w-full">
              <motion.div layoutId={`image-${card.title}-${id}`}>
                <img
                  width={100}
                  height={100}
                  src={card.urltoimage}
                  alt={card.title}
                  className="h-60 w-full  rounded-lg object-cover object-top"
                />
              </motion.div>
              <div className="flex justify-center items-center flex-col">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base line-clamp-1"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base line-clamp-2"
                >
                  {card.description}
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
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
    <div className="space-y-2">
      <h1 className="text-lg font-bold inline-flex items-center gap-x-2"><Sparkles /> Ai Summary</h1>
      <Skeleton className="h-42 p-4">
        <TextLoadingSkeleton lines={5} skeletonClassName="bg-purple-200" />
      </Skeleton>
    </div>
  )
}