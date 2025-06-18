import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BaseLayout } from "@/layouts/BaseLayout";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticles, useUserPreferences } from "@/hooks/use-news";
import { NewsArticles } from "@/components/news-article";
import { Search, Sparkles } from "lucide-react";
import { useSearchSummarize } from '@/hooks/use-search-summarize'
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effects';
import { TextLoadingSkeleton } from '@/components/ui/text-loading';

type ProductSearch = {
  q: string
}

export const Route = createFileRoute("/")({
  component: Home,
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    return {
      q: search.q as string
    }
  },
})


export function Home() {
  const placeholders = [
    "Latest news",
    "Some news on apple",
    "Latest Sports News",
  ];

  const { data: userPreferences } = useUserPreferences()
  const navigate = useNavigate({ from: Route.fullPath })
  const { q } = Route.useSearch()

  const {
    data: articles,
    isLoading,
    refetch,
    isFetching,
  } = useArticles(
    userPreferences?.sources.length ? userPreferences.sources : undefined,
    userPreferences?.categories.length ? userPreferences.categories : undefined,
    q || undefined,
  )

  const {
    data: searchSummary,
    status,
    isFetching: searchSummaryFetching,
    refetch: searchRefetch
  } = useSearchSummarize({ q: q })


  const onSubmit = (e: React.FormEvent<HTMLFormElement>, query: string) => {
    e.preventDefault();
    navigate({
      search: (prev) => ({ ...prev, q: query })
    })
    searchRefetch()
  };

  return (
    <BaseLayout className="space-y-4" isFetching={isFetching} refetch={refetch}>
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onSubmit={onSubmit}
        q={q}
      />
      <div className='max-w-7xl mx-auto w-full rounded-md'>
        {
          searchSummaryFetching && status === 'pending' ?
            <AISummaryLoading q={q} />
            : searchSummary &&
            <div className="bg-neutral-800 rounded-md p-4">
              <h1 className="text-lg font-bold inline-flex items-center gap-x-2"><Sparkles /> Ai Summary for: {q}</h1>
              <TypewriterEffectSmooth text={searchSummary?.summary as string} showCursor={false} typeSpeed={5} />
            </div>
        }
      </div>
      {
        q !== "" ?
          <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-lg font-bold inline-flex items-center gap-x-2"><Search /> Some Relavent articles for : {q}</h1>
          </div> : null
      }
      {
        isLoading ?
          <LoadingArticles />
          : articles ? <NewsArticles news={articles} /> : null
      }
    </BaseLayout>
  )
}

function LoadingArticles() {
  return (
    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start gap-4"> {
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((el) => (
        <div
          key={`loading-${el}`}
          className="p-4 flex flex-col rounded-xl w-96 dark:bg-neutral-900 bg-white"
        >
          <div className="flex gap-2 flex-col w-full">
            <Skeleton className="h-52 w-full" />
            <div className="flex justify-center space-y-2 items-center flex-col w-full">
              <div className="w-full">
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="w-full space-y-2">
                <div className="w-full flex gap-x-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="w-full flex gap-x-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))
    }
    </div>
  )
}

function AISummaryLoading({
  q
}: {
  q: string
}) {
  return (
    <div className="bg-neutral-800 rounded-md p-4">
      <h1 className="text-lg font-bold inline-flex items-center gap-x-2"><Sparkles /> Ai Summary for {q}</h1>
      <Skeleton className="h-42 p-4">
        <TextLoadingSkeleton lines={5} skeletonClassName="bg-purple-200" />
      </Skeleton>
    </div>
  )
}