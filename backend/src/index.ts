import { serve } from "@hono/node-server";
import mindsDB from "mindsdb-js-sdk";
import { Hono } from "hono";
import { config } from "dotenv";
import postgres from "postgres";
import { logger } from 'hono/logger'

config();


const sql = postgres(process.env.DB_URL!);
const MindsDB = mindsDB.default;

const NEWS_LIMIT = 21;

await MindsDB.connect({
  host: "http://127.0.0.1:47334",
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

  if (q) {
    ql = `
      (
        SELECT id
        FROM article_kb
        WHERE content LIKE "${q}" AND relevance >= 0.15
      )
    `;
  }

  if (q) {
    data = await MindsDB.SQL.runQuery(`
      SELECT * FROM postgres_conn.news
      ${stmt.length > 0 ? "WHERE " + stmt.join(" AND ") : ""}
      AND id IN ${ql}
      LIMIT ${NEWS_LIMIT}
      OFFSET ${parseInt(page) * NEWS_LIMIT}
    `);
  } else {
    data = await MindsDB.SQL.runQuery(`
      SELECT * FROM postgres_conn.news
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

  const data = await MindsDB.SQL.runQuery(`
      SELECT  
        LLM("JUST Translate this text to ${lang} DO NOT GIVE SUGGESTIONS! " || title) AS translated_title,
        LLM("JUST Translate this text to ${lang} DO NOT GIVE SUGGESTIONS! " || content) AS translated_content
      FROM postgres_conn.news 
      WHERE id = ${ id }
    `)
  
  return c.json(data["rows"][0], 200)
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

  const data = await MindsDB.SQL.runQuery(`
      SELECT  
        LLM("GIVE ME A SHORT SUMMARY IN THE LANGUAGE ${ lang }" || content) AS summary
      FROM postgres_conn.news 
      WHERE id = ${ id }
    `)
  
  return c.json(data["rows"][0], 200)
})

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
