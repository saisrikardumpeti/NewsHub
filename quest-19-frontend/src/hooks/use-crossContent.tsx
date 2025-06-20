import { useQuery } from "@tanstack/react-query";

type useSummarizeType = {
  id?: string;
};

export function useCrossContent({ id }: useSummarizeType) {
  return useQuery({
    queryKey: ["cross-content", id],
    queryFn: async () => {
      if (!id) return;
      const res = await fetch(`/api/cross-content-checker?id=${id}`, {
        credentials: "include",
      });
      return res.text();
    },
    staleTime: 1 * 60 * 1000,
    enabled: id !== undefined,
  });
}
