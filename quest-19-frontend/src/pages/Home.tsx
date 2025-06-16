import { BaseLayout } from "@/layouts/BaseLayout";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticles, useUserPreferences } from "@/hooks/use-news";
import { useState } from "react";
import { NewsArticles } from "@/components/news-article";
import { Search, Sparkles } from "lucide-react";

export function Home() {
  const placeholders = [
    "Latest news",
    "Some news on apple",
    "Latest Sports News",
  ];

  const { data: userPreferences } = useUserPreferences()
  const [searchQuery, setSearchQuery] = useState("")


  const onSubmit = (e: React.FormEvent<HTMLFormElement>, query: string) => {
    e.preventDefault();
    setSearchQuery(query)
  };

  const {
    data: articles,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useArticles(
    userPreferences?.sources.length ? userPreferences.sources : undefined,
    userPreferences?.categories.length ? userPreferences.categories : undefined,
    searchQuery || undefined,
  )

  return (
    <BaseLayout className="space-y-4" isFetching={isFetching} refetch={refetch}>
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onSubmit={onSubmit}
      />
      {
        searchQuery !== "" ? 
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-lg font-bold inline-flex items-center gap-x-2"><Search /> Showings articles for : {searchQuery}</h1>
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

