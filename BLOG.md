## 🎯 Project Goal

The objective behind building this platform was simple but ambitious: to help
users stay informed on their own terms. Instead of a noisy flood of irrelevant
headlines, the platform offers a clean, AI-enhanced experience where:

Users set their own preferred sources and categories.

Every article can be summarized, translated, or verified against other sources.

Users can ask natural language questions, and the system finds the most relevant
news and a summary in response.

---

## 🧱 Tech Stack Overview

This project is powered by a modern, performance-oriented stack:

- ⚙️ Backend: Node.js + Hono.js
- 🌐 Frontend: React with Vite.js
- 🧠 Databases: PostgreSQL + MindsDB
- 📰 Scraping Agent: Puppeteer (runs every hour to collect new articles)

![Architecture of Demo](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/z603w2svrk0b3dyia8nr.png)

---

## 🔁 How It Works – Behind the Scenes

- When the server starts, a Puppeteer script initiates and fetches fresh news
  every hour.
- New content is inserted into PostgreSQL, and MindsDB JOBS monitor for new
  entries.
- If an article hasn’t been added to a MindsDB knowledge base (KB), it’s
  automatically ingested.
- On the frontend, users can:

Click to summarize or translate the content.

Use a custom AI Agent to check if the same news is covered elsewhere and analyze
its credibility and context.

```js
import { config } from "dotenv";
import postgres from "postgres";
import { exit } from "process";
import { DEFAULT_NEWS_SOURCES } from "../src/lib/constant.js";
import { extractPlainText, getNews, sanitizeArticles } from "./get_news.js";
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
        ${(category?.value as string) || "General"},
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
```

---

## 🧠 AI Agent Functionality (in MindsDB)

<video controls autoplay loop muted>
  <source src="https://raw.githubusercontent.com/saisrikardumpeti/quest-19/refs/heads/main/.github/cross_content_checker.mp4" type="video/mp4">
</video>

The AI Agent integration gives powerful multi-perspective analysis on any
article:

- 📝 Summary generation
- ✅ Consensus Points (common facts across sources)
- 🌟 Unique Information (only in some sources)
- 🔍 New Discoveries not present in original
- ⚠️ Conflicting Information
- ❗ Unverified Claims
- 📈 Trend Analysis
- 📚 Additional Context

> This is made possible through CREATE AGENT and AI Tables features of MindsDB.

---

## 🔎 Schematic/Natural Language Search

Users can type queries like: "Is Nothing launching a new phone?":

<video controls autoplay loop muted>
  <source src="https://raw.githubusercontent.com/saisrikardumpeti/quest-19/refs/heads/main/.github/schematic_ai.mp4" type="video/mp4">
</video>

> This is searching for the content which is related to "nothing phones" or "any
> thing related to phone contents".
>
> Pull the most relevant articles using
> `SELECT ... FROM knowledge_base WHERE content = '<query>'`.
>
> Summarize and present the findings clearly.
>
> This is powered by MindsDB Knowledge Bases + semantic indexing.

---

## 💃 AI tables using MindsDB Models

<video controls autoplay loop muted>
  <source src="https://raw.githubusercontent.com/saisrikardumpeti/quest-19/refs/heads/main/.github/translation_model.mp4" type="video/mp4">
</video>

<video controls autoplay loop muted>
  <source src="https://raw.githubusercontent.com/saisrikardumpeti/quest-19/refs/heads/main/.github/summary_model.mp4" type="video/mp4">
</video>

```sql
CREATE MODEL translation_model
PREDICT response
USING
  engine = 'google_gemini_engine',
  model_name = 'gemini-2.0-flash-lite',
  prompt_template = 'JUST Translate this text {{content}} to {{lang}} DO NOT GIVE SUGGESTIONS!';

CREATE MODEL summarization_model
PREDICT response
USING
  engine = 'google_gemini_engine',
  model_name = 'gemini-2.0-flash-lite',
  prompt_template = 'Summarize this {{content}} AND TRANSLATE the summarized text to {{lang}} DO NOT GIVE SUGGESTIONS! and ONLY GIVE ME THE {{lang}} TRANSLATED TEXT PLEASE!';
```

---

## 🧩 Knowledge Base & Job Integration

The project fulfills all key requirements of MindsDB's KB-based application:

- ✅ `CREATE KNOWLEDGE_BASE`
- ✅ `INSERT INTO knowledge_base`
- ✅ `SELECT ... FROM ... WHERE content = ...`
- ✅ `CREATE INDEX ON knowledge_base`
- ✅ `CREATE JOB for periodic insertion`
- ✅ `CREATE AGENT for multi-step intelligent workflows`

---

## 📌 Key Use Cases Demonstrated

- Real-time news summarization
- Multilingual translation of news articles
- Cross-source story validation
- Conversational queries for topic-based news retrieval
- AI Agent consensus comparison of conflicting sources

---

## 👨‍💻 Checkout the full code on [Github](https://github.com/saisrikardumpeti/quest-19)
