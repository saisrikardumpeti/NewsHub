import { serve } from "@hono/node-server";
import mindsDB from "mindsdb-js-sdk";
import { Hono } from "hono";
import { config } from "dotenv";
import postgres from "postgres";
import { logger } from 'hono/logger'
import { extractPlainText } from "../scripts/get_news.js";
import { removeHtmlBackticks } from "./lib/utils.js";

config();

const sql = postgres(process.env.DB_URL!);

const MindsDB = mindsDB.default;

const NEWS_LIMIT = 21;

await MindsDB.connect({
  host: 'http://localhost:47334',
  user: "",
  password: "",
});


const app = new Hono();

app.use(logger())

app.get("/news", async (c) => {
  const q = c.req.query("q");
  const categories = c.req.query("c");
  const s = c.req.query("s");
  let page = c.req.query("page");
  if (!page) page = "0";

  let data;

  let stmt = [];

  if (categories) {
    const cl = categories.split(",").map((e) => `"${e}"`).join(",");

    stmt.push(
      `category in (${cl})`,
    );
  }
  if (s) {
    const sl = s.split(",").map((e) => `"${e}"`).join(",");
    stmt.push(
      `source_id in (${sl})`,
    );
  }

  let ql;

  if (q !== "") {
    ql = `
      (
        SELECT id
        FROM articles_kb
        WHERE content LIKE "${q}" AND relevance >= 0.15
      )
    `;
  }

  if (q) {
    data = await MindsDB.SQL.runQuery(`
      SELECT * FROM postgres_conn.articles
      ${stmt.length > 0 ? "WHERE " + stmt.join(" AND ") : ""}
      AND id IN ${ql}
      LIMIT ${NEWS_LIMIT}
      OFFSET ${parseInt(page) * NEWS_LIMIT}
    `);
  } else {
    data = await MindsDB.SQL.runQuery(`
      SELECT * FROM postgres_conn.articles
      ${stmt.length > 0 ? "WHERE " + stmt.join(" AND ") : ""}
      LIMIT ${NEWS_LIMIT}
      OFFSET ${parseInt(page) * NEWS_LIMIT}
    `);
  }

  return c.json(data["rows"], 200);
});

app.get("/translate", async (c) => {
  const lang = c.req.query("lang");
  const id = c.req.query("id");

  if (!id) {
    return c.json({
      message: "id was not given",
    }, 400)
  }

  if (!lang) {
    return c.json({
      message: "language was not provided"
    })
  }

  const translationModel = await MindsDB.Models.getModel('translation_model', 'mindsdb')

  const content = await MindsDB.SQL.runQuery(`SELECT title, content from postgres_conn.articles where id = ${id};`)

  const title = await translationModel?.query({
    where: [
      'lang = ' + `'${lang}'`,
      'content = ' + `'${extractPlainText(content.rows[0].title)}'`
    ]
  })

  const tContent = await translationModel?.query({
    where: [
      'lang = ' + `'${lang}'`,
      'content = ' + `'${extractPlainText(content.rows[0].content)}'`
    ]
  })

  return c.json({
    translated_title: title?.value,
    translated_content: tContent?.value
  }, 200)
})

app.get("/summary", async (c) => {
  const lang = c.req.query("lang");
  const id = c.req.query("id");

  if (!id) {
    return c.json({
      message: "id was not given",
    }, 400)
  }

  if (!lang) {
    return c.json({
      message: "language was not provided"
    })
  }

  const summarizationModel = await MindsDB.Models.getModel('summarization_model', 'mindsdb')

  const content = await MindsDB.SQL.runQuery(`SELECT content from postgres_conn.articles where id = ${id};`)

  const title = await summarizationModel?.query({
    where: [
      'lang = ' + `'${lang}'`,
      'content = ' + `'${extractPlainText(content.rows[0].content)}'`
    ]
  })

  return c.json({
    summary: title?.value
  }, 200)
})

app.get("/search-summary", async (c) => {
  const q = c.req.query("q");

  if (!q) {
    return c.json({
      message: "id was not given",
    }, 400)
  }

  const summarizationModel = await MindsDB.Models.getModel('search_content_summarization_model', 'mindsdb')

  const query = await MindsDB.SQL.runQuery(`
    SELECT STRING_AGG(chunk_content, ' ') as content
    FROM articles_kb 
    WHERE content LIKE "${ extractPlainText(q) }"
  `)

  const summary = await summarizationModel?.query({
    where: [
      'content = ' + `'${extractPlainText(query.rows[0].content)}'`
    ]
  })

  return c.json({
    summary: summary?.value as string
  }, 200)
})

serve({
  fetch: app.fetch,
  hostname: "0.0.0.0",
  port: 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
