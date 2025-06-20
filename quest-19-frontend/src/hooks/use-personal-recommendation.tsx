import { useQuery } from "@tanstack/react-query";
import type { NewsArticle } from "./use-news";
import { PREDEFINED_CATEGORIES } from "@/lib/constants";

type usePersonalRecommendationsProps = {
  sources?: string[];
  category?: string[];
};

type Response = {
  headlines: NewsArticle[];
};

const defaultCategory = PREDEFINED_CATEGORIES.map((el) => el.name).join(",");

export function usePersonalRecommendations(
  { sources, category }: usePersonalRecommendationsProps,
) {
  return useQuery<Response>({
    queryKey: ["personal-recommendations", sources, category],
    queryFn: async () => {
      if (!sources) return;
      const res = await fetch(
        `/api/personal-recommendations?sources=${sources || ""}&category=${
          category || defaultCategory
        }`,
        {
          credentials: "include",
        },
      );
      return res.json();
    },
  });
}
