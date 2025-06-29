import { serve } from "@hono/node-server";
import mindsDB from "mindsdb-js-sdk";
import { Hono } from "hono";
import { config } from "dotenv";
import { logger } from "hono/logger";
import { extractPlainText } from "../scripts/get_news.js";

config();

const MindsDB = mindsDB.default;

await MindsDB.connect({
  host: "http://localhost:47334",
  user: "",
  password: "",
});

const app = new Hono();

app.use(logger());

app.get("/search", async (c) => {
  const q = c.req.query("q");

  if (q) {
    const query = await MindsDB.SQL.runQuery(`
      SELECT * FROM postgres_conn.articles WHERE id IN (
        SELECT DISTINCT(id)
        FROM articles_kb
        WHERE content = '${extractPlainText(q)}'
      );
    `);
    return c.json({
      headlines: query.rows,
    }, 200);
  }

  return c.json(
    c.json({
      messages: "q was not given",
    }),
    400,
  );
});

app.get("/translate", async (c) => {
  const lang = c.req.query("lang");
  const id = c.req.query("id");

  if (!id) {
    return c.json({
      message: "id was not given",
    }, 400);
  }

  if (!lang) {
    return c.json({
      message: "language was not provided",
    });
  }

  const translationModel = await MindsDB.Models.getModel(
    "translation_model",
    "mindsdb",
  );

  const content = await MindsDB.SQL.runQuery(
    `SELECT title, content from postgres_conn.articles where id = ${id};`,
  );

  const title = await translationModel?.query({
    where: [
      "lang = " + `'${lang}'`,
      "content = " + `'${extractPlainText(content.rows[0].title)}'`,
    ],
  });

  const tContent = await translationModel?.query({
    where: [
      "lang = " + `'${lang}'`,
      "content = " + `'${extractPlainText(content.rows[0].content)}'`,
    ],
  });

  return c.json({
    translated_title: title?.value,
    translated_content: tContent?.value,
  }, 200);
});

app.get("/summary", async (c) => {
  const lang = c.req.query("lang");
  const id = c.req.query("id");

  if (!id) {
    return c.json({
      message: "id was not given",
    }, 400);
  }

  if (!lang) {
    return c.json({
      message: "language was not provided",
    });
  }

  const summarizationModel = await MindsDB.Models.getModel(
    "summarization_model",
    "mindsdb",
  );

  const content = await MindsDB.SQL.runQuery(
    `SELECT content from postgres_conn.articles where id = ${id};`,
  );

  const title = await summarizationModel?.query({
    where: [
      "lang = " + `'${lang}'`,
      "content = " + `'${extractPlainText(content.rows[0].content)}'`,
    ],
  });

  return c.json({
    summary: title?.value,
  }, 200);
});

app.get("/search-summary", async (c) => {
  const q = c.req.query("q");

  if (!q) {
    return c.json({
      message: "id was not given",
    }, 400);
  }

  const summarizationModel = await MindsDB.Models.getModel(
    "search_content_summarization_model",
    "mindsdb",
  );

  const query = await MindsDB.SQL.runQuery(`
    SELECT STRING_AGG(chunk_content, ' ') as content
    FROM articles_kb 
    WHERE content LIKE "${extractPlainText(q)}"
  `);

  const summary = await summarizationModel?.query({
    where: [
      "content = " + `'${extractPlainText(query.rows[0].content)}'`,
    ],
  });

  return c.json({
    summary: summary?.value as string,
  }, 200);
});

app.get("/headlines", async (c) => {
  const s = c.req.query("category");

  if (s) {
    const cl = s.split(",").map((e) => `"${e}"`).join(",");
    const query = await MindsDB.SQL.runQuery(`
      SELECT * FROM postgres_conn.articles 
      WHERE published_at <= NOW() - INTERVAL '1 hour' AND category IN (${cl})
      ORDER BY RANDOM() 
      LIMIT 6;
      `);
    return c.json({
      headlines: query.rows,
    }, 200);
  }
  const query = await MindsDB.SQL.runQuery(`
      SELECT * FROM postgres_conn.articles 
      ORDER BY RANDOM() 
      LIMIT 6;
      `);
  return c.json({
    headlines: query.rows,
  }, 200);
});

app.get("/personal-recommendations", async (c) => {
  const s = c.req.query("sources");
  const category = c.req.query("category");
  if (s && category) {
    const sl = s.split(",").map((e) => `"${e}"`).join(",");
    const cl = category.split(",").map((e) => `"${e}"`).join(",");
    
    console.warn(`
      SELECT * FROM postgres_conn.articles WHERE id IN (
        SELECT DISTINCT(id)
        FROM articles_kb
        WHERE source_id IN (${sl}) AND category IN (${cl})
        ORDER BY RANDOM()
      );
      `);

    const query = await MindsDB.SQL.runQuery(`
    SELECT * FROM postgres_conn.articles WHERE id IN (
      SELECT DISTINCT(id)
      FROM articles_kb
      WHERE source_id IN (${sl}) AND category IN (${cl})
      ORDER BY RANDOM()
    );
  `);
    return c.json({
      headlines: query.rows,
    }, 200);
  }

  const query = await MindsDB.SQL.runQuery(`
    SELECT * FROM postgres_conn.articles WHERE id IN (
      SELECT DISTINCT(id)
      FROM articles_kb
      WHERE content = 'Give me some latest headlines'
      ORDER BY RANDOM()
    );
  `);

  return c.json({
    headlines: query.rows,
  }, 200);
});

app.get("/news", async (c) => {
  const category = c.req.query("category");
  const sources = c.req.query("sources");

  if (sources) {
    const sl = sources.split(",").map((e) => `"${e}"`).join(",");
    const query = await MindsDB.SQL.runQuery(`
      SELECT * FROM postgres_conn.articles WHERE id IN (
        SELECT DISTINCT(id)
        FROM articles_kb
        WHERE content = 'Give me some latest headlines' AND source_id IN (${sl}) AND category = "${category}"
        ORDER BY relevance DESC
        LIMIT 16
      );
    `);
    return c.json({
      headlines: query.rows,
    }, 200);
  }

  const query = await MindsDB.SQL.runQuery(`
    SELECT * FROM postgres_conn.articles WHERE id IN (
      SELECT DISTINCT(id)
      FROM articles_kb
      WHERE content = 'Give me some latest headlines' AND category = "${category}"
      ORDER BY relevance DESC
      LIMIT 16
    );
  `);

  return c.json({
    headlines: query.rows,
  }, 200);
});

app.get("/cross-content-checker", async (c) => {
  const id = c.req.query("id");

  if (id) {
    const content = await MindsDB.SQL.runQuery(`
      SELECT source_name, content 
      FROM postgres_conn.articles 
      WHERE id = ${id}
    `);

    const query = await MindsDB.SQL.runQuery(`
      SELECT answer 
      FROM content_cross_checker 
      WHERE question = "
        Original Source: ${content.rows[0].source_name}
        Original Source Content: ${content.rows[0].content};
      "  
    `);
    return c.text(query.rows[0].answer);
  }
  return c.json({
    message: "article id was not provided",
  }, 400);
});

app.get("/search-relevancy", async (c) => {
    const q = c.req.query("q");

  if (q) {
    const generate_test_data = await MindsDB.SQL.runQuery(`
      EVALUATE KNOWLEDGE_BASE mindsdb.articles_kb
        USING
        test_table = files.articles_kb_test_data, 
        generate_data = {
          'from_sql': 'SELECT chunk_content as content FROM mindsdb.articles_kb WHERE content = "${extractPlainText(q)}"', 
          'count': 10
        }, 
        evaluate = false,
        version = 'llm_relevancy';
    `);
    if (generate_test_data.error_message) {
      return c.json({
        error: generate_test_data.error_message
      }, 500)
    }
    const relevancy_resuts = await MindsDB.SQL.runQuery(`
      EVALUATE KNOWLEDGE_BASE mindsdb.articles_kb
        USING
          test_table = files.articles_kb_test_data, 
          evaluate = true,
          version = 'llm_relevancy';
    `);

    return c.json({
      result: relevancy_resuts.rows[0].avg_relevancy,
    }, 200);
  }

  return c.json(
    c.json({
      messages: "q was not given",
    }),
    400,
  );
})

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
