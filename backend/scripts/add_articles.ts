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
  password: "password"
});

const offsetCount = await sql`SELECT COUNT(*) as offset FROM articles;`

const MindsDB = mindsDB.default;

await MindsDB.connect({
  host: "http://localhost:47334",
  user: "",
  password: "",
});

let limitCount = 0;

for (const category of PREDEFINED_CATEGORIES) {
  const url = `https://newsapi.org/v2/top-headlines?category=${category.name}&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`

  const articles = await getNews(url)

  const sanitizedArticles = await sanitizeArticles(articles)

  for (const newArticle of sanitizedArticles) {
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
        ${newArticle.source.id || 'others'},
        ${newArticle.source.name},
        ${newArticle.author || 'Anonymus'},
        ${newArticle.title},
        ${newArticle.description || "No description."},
        ${newArticle.content},
        ${category.name},
        ${newArticle.url},
        ${newArticle.urlToImage || "https://placehold.co/1080x720?text=Image%20not%20provided"},
        ${newArticle.publishedAt || Date.now().toLocaleString()}
      )
      ON CONFLICT (title) DO NOTHING;
    `;
  }

  limitCount += sanitizedArticles.length
}

await MindsDB.SQL.runQuery(`
  INSERT INTO articles_kb
    SELECT id, content FROM postgres_conn.articles LIMIT ${limitCount} OFFSET ${offsetCount}
`)

exit(0)