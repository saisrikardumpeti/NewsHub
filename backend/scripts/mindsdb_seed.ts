import mindsDB from "mindsdb-js-sdk";
import { config } from "dotenv";
import type { NewsType } from "./seed.js";
import postgres from "postgres";

config();

const sql = postgres(process.env.DB_URL!);
const MindsDB = mindsDB.default;

try {
  const data: NewsType[] = await sql`
        SELECT * FROM news;
      `;

  await MindsDB.connect({
    host: "http://127.0.0.1:47334",
    user: "",
    password: "",
  });

  const queryResult = await MindsDB.SQL.runQuery(`
  CREATE KNOWLEDGE_BASE article_kb
    USING
        embedding_model = {
            "provider": "openai",
            "model_name" : "text-embedding-3-large",
            "api_key": "${process.env.OPENAI_API}"
        },
        reranking_model = {
            "provider": "openai",
            "model_name": "gpt-4o",
            "api_key": "${process.env.OPENAI_API}"
        },
        metadata_columns = ['category', 'title', 'description', 'publishedat'],
        content_columns = ['content'],
        id_column = 'id';
  `);

  console.log(queryResult);
} catch (error) {
  console.log(error);
}
