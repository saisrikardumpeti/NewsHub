# NewsHub: Intelligence Meets Information

## The Problem with Traditional News Aggregators

We're drowning in information. Every day, thousands of news articles are
published across hundreds of sources, each with different perspectives, writing
styles, and terminology. Traditional news aggregators rely on keyword matching
and basic categorization, leaving users frustrated when they can't find what
they're looking for.

Imagine searching for "climate change solutions" and missing crucial articles
about "carbon capture technology" or "renewable energy breakthroughs" simply
because they don't contain your exact search terms. This is where semantic
understanding becomes critical.

---

## Introducing NewsHub

As part of [Quest-19](https://quira.sh/quests/creator/details?questId=19), I
built **NewsHub** – a full-stack news aggregation platform that goes beyond
simple keyword matching. By leveraging [MindsDB's](https://mindsdb.com/)
Knowledge Base feature, NewsHub understands the meaning behind your queries,
delivering relevant results even when the exact words don't match.

---

## 🧠 The Power of Semantic Search

### Traditional Search:

- **User searches**: "AI in medicine"
- **System finds**: Articles containing exactly "AI" AND "medicine"
- **Result**: Misses relevant articles about "machine learning in healthcare" or
  "artificial intelligence diagnostic tools"

### Semantic Search with NewsHub:

- **User searches**: "AI in medicine"
- **System understands**: Healthcare applications of artificial intelligence
- **Result**: Finds articles about ML diagnostics, AI drug discovery, medical
  automation, and more

---

## 🚀 Project Architecture

## ![Architecture of Demo](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/z603w2svrk0b3dyia8nr.png)

## MindsDB Features Used

### 1. Knowledge Bases

- Store unstructured article content using embeddings
- Enable SQL-based semantic search using vector similarity

### 2. Models

- Custom LLMs used for:
  - Translating content
  - Summarizing articles

### 3. Jobs

- Periodically ingest fresh content from Postgres into the KB (like a cron job)

### 4. Agents

- (Optional future step) Build AI agents to chat with the content, give
  recommendations, etc.

---

## 📁 Repository Setup

```bash
git clone https://github.com/saisrikardumpeti/quest-19
cd quest-19
```

Follow the `README.md` in the repo to set up.

### Database Setup

```bash
cd backend
pnpm db:init
```

### Knowledge Base Setup

```sql
CREATE KNOWLEDGE_BASE IF NOT EXISTS articles_kb
  USING
    embedding_model = {
      "provider": "openai",
      "model_name": "text-embedding-3-small",
      "api_key": "${process.env.OPENAI_API!}"
    },
    reranking_model = {
      "provider": "openai",
      "model_name": "gpt-4.1-nano",
      "api_key": "${process.env.OPENAI_API!}"
    },
    metadata_columns = [
      'source_id',
      'source_name',
      'title',
      'description',
      'category',
      'published_at'
    ],
    content_columns = ['id', 'content'],
    id_column = 'id';
```

### Postgres Connection (Node)

```js
const createDbResult = await MindsDB.Databases.getDatabase("postgres_conn");
if (!createDbResult) {
  await MindsDB.Databases.createDatabase(
    "postgres_conn",
    "postgres",
    params,
  );
}
```

### MindsDB Models and Jobs

```sql
CREATE ML_ENGINE google_gemini_engine
  FROM google_gemini
  USING
    api_key = 'your api key';

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

CREATE JOB mindsdb.add_articles_to_kb (
  INSERT INTO articles_kb (
    id, title, description, content, source_name, author, category, published_at, source_id
  )
  SELECT id, title, description, content, source_name, author, category, published_at, source_id
  FROM postgres_conn.articles
  WHERE content IS NOT NULL;
) EVERY hour;
```

---

## 🚀 Backend API (Hono.js + MindsDB)

### Semantic Search Endpoint

```js
app.get("/search", async (c) => {
  const q = c.req.query("q");
  if (!q) return c.json({ message: "q was not given" }, 400);

  const query = await MindsDB.SQL.runQuery(`
    SELECT * FROM postgres_conn.articles WHERE id IN (
      SELECT DISTINCT(id) FROM articles_kb
      WHERE content = '${extractPlainText(q)}'
      ORDER BY relevance DESC
      LIMIT 16
    );
  `);
  return c.json({ headlines: query.rows }, 200);
});
```

### Translation

```js
const translationModel = await MindsDB.Models.getModel(
  "translation_model",
  "mindsdb",
);
const result = await translationModel?.query({
  where: [
    `lang = '${lang}'`,
    `content = '${extractPlainText(content)}'`,
  ],
});
```

### Summary

```js
const summarizationModel = await MindsDB.Models.getModel(
  "summarization_model",
  "mindsdb",
);
const result = await summarizationModel?.query({
  where: [
    `lang = '${lang}'`,
    `content = '${extractPlainText(content)}'`,
  ],
});
```

### Search + Summarize

```js
const summaryModel = await MindsDB.Models.getModel(
  "search_content_summarization_model",
  "mindsdb",
);
const query = await MindsDB.SQL.runQuery(
  `SELECT STRING_AGG(chunk_content, ' ') as content FROM articles_kb WHERE content LIKE "${
    extractPlainText(q)
  }"`,
);
const summary = await summaryModel?.query({
  where: [`content = '${extractPlainText(query.rows[0].content)}'`],
});
```

---

## 📈 Frontend Setup

Built with **Vite.js + React** using:

- `@tanstack/query` for fetching
- `@tanstack/router` for routing
- Acertinity UI components for styling

Repo:
[GitHub - saisrikardumpeti/quest-19](https://github.com/saisrikardumpeti/quest-19)

---

## ✨ Thoughts

- Mindsdb feature are very easy to implement.
- It can work with pre existing data.

---

## Summary

NewsHub combines:

- Semantic search via **MindsDB Knowledge Bases**
- Real-time summaries and translations via **LLMs**
- Seamless integration of AI + SQL + React frontend

Result? A modern, intelligent news discovery experience that understands intent,
not just keywords.
