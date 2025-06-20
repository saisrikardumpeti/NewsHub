import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cookieUtils, type UserPreferences } from "@/lib/cookies";

export interface NewsArticle {
  id: number;
  title: string;
  description: string;
  content: string;
  source_name: string;
  category: string;
  published_at: string;
  image_url: string;
  article_url: string;
  created_at: string;
}

interface useArticlesProps {
  sources?: string[];
  categories?: string;
}

interface Response {
  headlines?: NewsArticle[];
}

export function useArticles({ sources, categories }: useArticlesProps) {
  return useQuery<Response>({
    queryKey: ["news", sources, categories],
    queryFn: async () => {
      if (!sources && !categories) return;
      const res = await fetch(
        `/api/news?category=${categories || ""}&sources=${sources || ""}`,
        {
          credentials: "include",
        },
      );
      return res.json();
    },
    enabled: (categories?.length ?? 0) > 0 || (sources?.length ?? 0) > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserPreferences() {
  return useQuery({
    queryKey: ["preferences"],
    queryFn: (): UserPreferences => {
      const preferences = cookieUtils.get("userPreferences") as UserPreferences;
      return preferences || { sources: [], categories: [] };
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      preferences: UserPreferences,
    ): Promise<UserPreferences> => {
      cookieUtils.set("userPreferences", preferences);
      return preferences;
    },
    onSuccess: (preferences) => {
      queryClient.setQueryData(["preferences"], preferences);

      queryClient.invalidateQueries({
        queryKey: ["articles"],
      });
    },
    onError: (error) => {
      console.error("Failed to update preferences:", error);
    },
  });
}
