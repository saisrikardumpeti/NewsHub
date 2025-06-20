import { useQuery } from "@tanstack/react-query";
import type { NewsArticle } from "./use-news";
import { PREDEFINED_CATEGORIES } from "@/lib/constants";

type useHeadlinesProps = {
  category?: string;
};

type Response = {
  headlines: NewsArticle[];
};
const defaultCategory = PREDEFINED_CATEGORIES.map((el) => el.name).join(",");

export function useHeadlines({ category }: useHeadlinesProps) {
  return useQuery<Response>({
    queryKey: ["headlines", category],
    queryFn: async () => {
      const res = await fetch(`/api/headlines?category=${category || defaultCategory}`, {
        credentials: "include",
      });
      return res.json();
    },
    staleTime: 1 * 60 * 1000,
  });
}
