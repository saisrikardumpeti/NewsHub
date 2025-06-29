import { useQuery } from "@tanstack/react-query";

type useSearchRelevancyProps = {
  q?: string;
};

type Response = {
  result: string;
};

export function useSearchRelevancy({ q }: useSearchRelevancyProps) {
  return useQuery<Response>({
    queryKey: ["search-relevancy", q],
    queryFn: async () => {
      if (!q) return;
      const res = await fetch(`/api/search-relevancy?q=${q || ""}`, {
        credentials: "include",
      });
      return res.json();
    },
    staleTime: 1 * 60 * 1000,
    enabled: false,
  });
}
