import { useQuery } from "@tanstack/react-query";
import { type LanguageName } from "@/lib/languages";

type useTranslateType = {
  id?: string;
  translate?: LanguageName;
}

type Response = {
  translated_title: string;
  translated_content: string;
}

export function useTranslate({ id, translate }: useTranslateType) {
  return useQuery<Response>({
    queryKey: ["translate", id, translate],
    queryFn: async () => {
      if (!translate || !id) return;
      const res = await fetch(`/api/translate?lang=${translate}&id=${id}`)
      return res.json()
    },
    staleTime: 1 * 60 * 1000,
    enabled: translate !== undefined
  })
}