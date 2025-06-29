import { config } from "dotenv";
import postgres from "postgres";
import { exit } from "process";
import { extractPlainText, getNews, sanitizeArticles } from "./get_news.js";
import mindsDB from "mindsdb-js-sdk";
import { DEFAULT_NEWS_SOURCES } from "../src/lib/constant.js";

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

for (const source of DEFAULT_NEWS_SOURCES) {
  const url =
    `https://newsapi.org/v2/top-headlines?sources=${source.id}&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;

  const articles = await getNews(url);

  if (!articles) continue;
  const sanitizedArticles = await sanitizeArticles(articles);

  const getContentCategoryModel = await MindsDB.Models.getModel(
    "get_content_category_model",
    "mindsdb",
  );

  for (const newArticle of sanitizedArticles) {
    const category = await getContentCategoryModel?.query({
      where: [
        "content = " + `'${extractPlainText(newArticle.content)}'`,
      ],
    });
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
        ${(category?.value as string).trim() || "General"},
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
  console.log("Articles added for ", source.name);
}

exit(0);
