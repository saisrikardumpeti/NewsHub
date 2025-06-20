import { useQuery } from "@tanstack/react-query";
import type { NewsArticle } from "./use-news";

type useSearchNewsProps = {
  q?: string;
};

type Response = {
  headlines: NewsArticle[];
};

export function useSearchNews({ q }: useSearchNewsProps) {
  return useQuery<Response>({
    queryKey: ["search", q],
    queryFn: async () => {
      if (!q) return;
      const res = await fetch(`/api/search?q=${q || ""}`, {
        credentials: "include",
      });
      return res.json();
    },
    staleTime: 1 * 60 * 1000,
    enabled: !!q && q.length > 0,
  });
}
