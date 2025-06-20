import { config } from "dotenv";
import postgres from "postgres";
import { exit } from "process";
import { PREDEFINED_CATEGORIES } from "../src/lib/constant.js";
import { getNews, sanitizeArticles } from "./get_news.js";
import mindsDB from "mindsdb-js-sdk";

config();

const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "news_platform",
  user: "postgres",
  password: "password",
});

const MindsDB = mindsDB.default;

await MindsDB.connect({
  host: "http://localhost:47334",
  user: "",
  password: "",
});

for (const category of PREDEFINED_CATEGORIES) {
  const url =
    `https://newsapi.org/v2/top-headlines?category=${category.id}&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;

  const articles = await getNews(url);
  if (!articles) continue;

  const sanitizedArticles = await sanitizeArticles(articles);

  for (const newArticle of sanitizedArticles) {
    try {
      await sql`
        INSERT INTO articles(
          source_id, 
          source_name, 
          author, 
          title, 
          description, 
          content, 
          category, 
          article_url, 
          image_url, 
          published_at
        )
        VALUES (
          ${newArticle.source.id || "others"},
          ${newArticle.source.name},
          ${newArticle.author || "Anonymus"},
          ${newArticle.title},
          ${newArticle.description || "No description."},
          ${newArticle.content},
          ${category.name},
          ${newArticle.url},
          ${
        newArticle.urlToImage ||
        "https://placehold.co/1080x720?text=Image%20not%20provided"
      },
          ${newArticle.publishedAt || Date.now().toLocaleString()}
        )
        ON CONFLICT (title) DO NOTHING;
    `;
    } catch (error) {
      console.log(error);
    }
  }

  console.log("Articles added for ", category.name);
}
exit(0);
