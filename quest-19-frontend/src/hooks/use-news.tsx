import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cookieUtils, type UserPreferences } from "@/lib/cookies"

export interface NewsArticle {
  id: number
  title: string
  description: string
  content: string
  source_name: string
  category: string
  published_at: string
  image_url: string
  article_url: string
  created_at: string
}

export function useArticles(sources?: string[], categories?: string[], searchQuery?: string) {
  return useQuery<NewsArticle[]>({
    queryKey: ["articles", sources, categories, searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/news?s=${sources || ''}&c=${categories || ''}&q=${searchQuery || ''}`)
      return res.json()
    },
    enabled: true,
    staleTime: 2 * 60 * 1000,
  })
}

export function useSearchArticles(query: string, enabled = true) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${query}`)
      return res
    },
    enabled: enabled && query.length > 0,
    staleTime: 1 * 60 * 1000,
  })
}

export function useUserPreferences() {
  return useQuery({
    queryKey: ["preferences"],
    queryFn: (): UserPreferences => {
      const preferences = cookieUtils.get("userPreferences") as UserPreferences
      return preferences || { sources: [], categories: [] }
    },
    staleTime: Number.POSITIVE_INFINITY
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (preferences: UserPreferences): Promise<UserPreferences> => {
      cookieUtils.set("userPreferences", preferences)
      return preferences
    },
    onSuccess: (preferences) => {
      queryClient.setQueryData(["preferences"], preferences)

      queryClient.invalidateQueries({
        queryKey: ["articles"],
      })
    },
    onError: (error) => {
      console.error("Failed to update preferences:", error)
    },
  })
}

// export function useArticleQA() {
//   return useMutation({
//     mutationFn: async ({ article, question }: { article: NewsArticle; question: string }) => {
//       return newsAPI.answerQuestion(article, question)
//     },
//   })
// }
