import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { NewsArticle } from "@/hooks/use-news";

interface TopHeadlinesProps {
  headlines: NewsArticle[];
}

export default function TopHeadlines({ headlines }: TopHeadlinesProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Trending Now</h2>
      </div>

      <div className="space-y-2">
        {headlines.slice(0, 5).map((article, index) => (
          <Card
            key={article.id}
            className="hover:bg-muted/50 transition-colors"
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1 text-xs">
                  {index + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">
                    {article.title}
                  </h4>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{article.source_name}</span>
                    <span className="mx-2">•</span>
                    <span>{article.published_at}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
