import { config } from "dotenv";
import { readFileSync } from "fs";
import mindsDB from "mindsdb-js-sdk";
import postgres from "postgres";
import { exit } from "process";

export interface NewsArticleType {
  id: number;
  source_id: string;
  source_name: string;
  author: string;
  title: string;
  description: string;
  content: string;
  category: string;
  url: string;
  urltoimage: string;
  publishedat: string;
  date_added: string;
}

config();

const params = {
  "host": process.env.MINDSDB_POSTGRES_HOST!,
  "port": 5432,
  "database": "news_platform",
  "user": "postgres",
  "password": "password",
};

const MindsDB = mindsDB.default;

const sql = postgres(process.env.DB_URL!);

try {
  await MindsDB.connect({
    host: "http://localhost:47334",
    user: "",
    password: "",
  });

  const res = await MindsDB.SQL.runQuery(`
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
  `);

  await sql`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      source_id VARCHAR(255) NOT NULL,
      source_name VARCHAR(255) NOT NULL,
      author VARCHAR(255),
      title TEXT NOT NULL UNIQUE,
      description TEXT,
      content TEXT,
      category VARCHAR(100),
      article_url TEXT,
      image_url TEXT,
      published_at TIMESTAMP WITH TIME ZONE,
      added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createDbResult = await MindsDB.Databases.getDatabase(
    "postgres_conn",
  );

  if (!createDbResult) {
    await MindsDB.Databases.createDatabase(
      "postgres_conn",
      "postgres",
      params,
    );
  }

  await MindsDB.SQL.runQuery(`
    CREATE ML_ENGINE google_gemini_engine
      FROM google_gemini
      USING
        api_key = '${process.env.GEMINI_API}';
  `);

  await MindsDB.SQL.runQuery(`
    CREATE MODEL translation_model
    PREDICT response
    USING
      engine = 'google_gemini_engine',
      model_name = 'gemini-2.0-flash-lite',
      prompt_template = 'JUST Translate this text {{content}} to {{lang}} DO NOT GIVE SUGGESTIONS!';
  `);

  await MindsDB.SQL.runQuery(`
    CREATE MODEL summarization_model
    PREDICT response
    USING
      engine = 'google_gemini_engine',
      model_name = 'gemini-2.0-flash-lite',
      prompt_template = 'Summarize this {{content}} AND TRANSLATE the summarized text to {{lang}} DO NOT GIVE SUGGESTIONS! and ONLY GIVE ME THE {{lang}} TRANSLATED TEXT PLEASE!';
  `);

  await MindsDB.SQL.runQuery(`
    CREATE MODEL search_content_summarization_model
      PREDICT response
      USING
        engine = 'google_gemini_engine',
        model_name = 'gemini-2.0-flash-lite',
        prompt_template = '
          Provide me the summary of the content do not use any makrdown formatting for that please.
          Do not mention anything about that you are summarizing the content.
          Just give me the summarized content.

          content: {{content}}
        ';
  `);

  const prompt = readFileSync(
    `${process.cwd()}/scripts/cross_content.txt`,
    "utf-8",
  ).replaceAll("\n", " ");

  await MindsDB.SQL.runQuery(`
    CREATE AGENT content_cross_checker
      USING
      model = 'gemini-2.0-flash',
      google_api_key = '${process.env.GEMINI_API}',
      include_knowledge_bases = ['mindsdb.articles_kb'],
      include_tables      = ['postgres_conn.articles'],
      tools               = ['sql_query'],
      prompt_template     = '${prompt}';
  `);

  await MindsDB.SQL.runQuery(`
    CREATE JOB mindsdb.add_articles_to_kb (
      INSERT INTO articles_kb (
        id, title, description, content, source_name, author, category, published_at, source_id
      )
      SELECT id, title, description, content, source_name, author, category, published_at, source_id
      FROM postgres_conn.articles
      WHERE content IS NOT NULL;
    ) EVERY hour;
  `);

  console.log("Created Into database");

  exit(0);
} catch (error) {
  console.log(error);
  exit(1);
}
