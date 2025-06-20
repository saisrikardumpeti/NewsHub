import { useQuery } from "@tanstack/react-query";

type useSummarizeType = {
  q?: string;
};

type Response = {
  summary: string;
};

export function useSearchSummarize({ q }: useSummarizeType) {
  return useQuery<Response>({
    queryKey: ["search-summary", q],
    queryFn: async () => {
      if (!q) return;
      const res = await fetch(`/api/search-summary?q=${q}`, {
        credentials: "include",
      });
      return res.json();
    },
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: q !== "",
  });
}
