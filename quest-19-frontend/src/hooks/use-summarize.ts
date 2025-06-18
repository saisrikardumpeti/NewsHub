import type { LanguageName } from "@/lib/languages";
import { useQuery } from "@tanstack/react-query";

type useSummarizeType = {
  id?: string;
  translate?: LanguageName;
}

type Response = {
  summary: string;
}

export function useSummarize({ id, translate } : useSummarizeType) {
  return useQuery<Response>({
    queryKey: ["summary", id, translate],
    queryFn: async () => {
      if (!translate && !id) return;
      const res = await fetch(`/api/summary?lang=${translate || "English"}&id=${id}`)
      return res.json()
    },
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: false
  })
}