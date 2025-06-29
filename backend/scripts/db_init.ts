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
  "host": `${process.env.MINDSDB_POSTGRES_HOST!}`,
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

  const knowledge_base_res = await MindsDB.SQL.runQuery(`
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
  if (knowledge_base_res.error_message) {
    console.log(
      "❌ Error creating knowledge base",
      knowledge_base_res.error_message,
    );
  } else {
    console.log("✅ Successfully created knowledge base");
  }

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
    const mindsdb_postgres_res = await MindsDB.Databases.createDatabase(
      "postgres_conn",
      "postgres",
      params,
    );

    if (mindsdb_postgres_res) {
      console.log("❌ Error creating mindsdb to postgres connection");
    } else {
      console.log("✅ Successfully created mindsdb to postgres connection");
    }
  }

  const google_gemini_engine_res = await MindsDB.SQL.runQuery(`
    CREATE ML_ENGINE google_gemini_engine
      FROM google_gemini
      USING
        api_key = '${process.env.GEMINI_API}';
  `);

  if (google_gemini_engine_res.error_message) {
    console.log(
      "❌ Error creating Google Gemini Engine",
      google_gemini_engine_res.error_message,
    );
  } else {
    console.log("✅ Successfully created Google Gemini Engine");
  }

  const translation_model_res = await MindsDB.SQL.runQuery(`
    CREATE MODEL translation_model
    PREDICT response
    USING
      engine = 'google_gemini_engine',
      model_name = 'gemini-2.0-flash-lite',
      prompt_template = '
        Just translate this text {{content}} to {{lang}}.  
        Do not give suggestions.  
        Only provide the translated text.
      ';
  `);

  if (translation_model_res.error_message) {
    console.log(
      "❌ Error creating Translating Model",
      translation_model_res.error_message,
    );
  } else {
    console.log("✅ Successfully created Translating Model");
  }

  const summarization_model_res = await MindsDB.SQL.runQuery(`
    CREATE MODEL summarization_model
    PREDICT response
    USING
      engine = 'google_gemini_engine',
      model_name = 'gemini-2.0-flash-lite',
      prompt_template = '
        Summarize this {{content}} and translate the summarized text to {{lang}}.  
        Do not give suggestions.  
        Only give me the {{lang}} translated text, nothing else.
      ';
  `);

  if (summarization_model_res.error_message) {
    console.log(
      "❌ Error creating Summarization Model",
      summarization_model_res.error_message,
    );
  } else {
    console.log("✅ Successfully created Summarization Model");
  }

  const get_content_category_model_res = await MindsDB.SQL.runQuery(`
    CREATE MODEL get_content_category_model
      PREDICT category
      USING
        engine = 'google_gemini_engine',
        model_name = 'gemini-2.0-flash-lite',
        prompt_template = '
        You are given the content of a news article. Based on the content, classify the article into one and only one of the following categories:
          - General
          - Business
          - Entertainment
          - Science
          - Sports
          - Technology
          - Health

          Return only the most appropriate category from the list above, with no explanation or additional text.

          Article Content:
          {{content}}';
  `);

  if (get_content_category_model_res.error_message) {
    console.log(
      "❌ Error creating Get Content Category Model",
      get_content_category_model_res.error_message,
    );
  } else {
    console.log("✅ Successfully created Get Content Category Model");
  }

  const search_content_summarization_model_res = await MindsDB.SQL.runQuery(`
    CREATE MODEL search_content_summarization_model
      PREDICT response
      USING
        engine = 'google_gemini_engine',
        model_name = 'gemini-2.0-flash-lite',
        prompt_template = '
          Provide me the summary of the content. Do not use any markdown formatting for that.  
          Do not mention anything about that you are summarizing the content.  
          Just give me the summarized content.

          content: {{content}}
        ';
  `);

  if (search_content_summarization_model_res.error_message) {
    console.log(
      "❌ Error creating Search Content Summarization Model",
      search_content_summarization_model_res.error_message,
    );
  } else {
    console.log("✅ Successfully created Search Content Summarization Model");
  }

  const prompt = readFileSync(
    `${process.cwd()}/scripts/cross_content_prompt.txt`,
    "utf-8",
  ).replaceAll("\n", " ");

  const content_cross_checker_res = await MindsDB.SQL.runQuery(`
    CREATE AGENT content_cross_checker
      USING
      model = 'gemini-2.0-flash',
      google_api_key = '${process.env.GEMINI_API}',
      include_knowledge_bases = ['mindsdb.articles_kb'],
      include_tables      = ['postgres_conn.articles'],
      tools               = ['sql_query'],
      prompt_template     = '${prompt}';
  `);

  if (content_cross_checker_res.error_message) {
    console.log(
      "❌ Error creating Content Cross Checker Agent",
      content_cross_checker_res.error_message,
    );
  } else {
    console.log("✅ Successfully created Content Cross Checker Agent");
  }

  const mindsdb_jobs_res = await MindsDB.SQL.runQuery(`
    CREATE JOB mindsdb.add_articles_to_kb (
      INSERT INTO articles_kb (
        id, title, description, content, source_name, author, category, published_at, source_id
      )
      SELECT id, title, description, content, source_name, author, category, published_at, source_id
      FROM postgres_conn.articles
      WHERE content IS NOT NULL;
    ) EVERY hour;
  `);
  if (mindsdb_jobs_res.error_message) {
    console.log(
      "❌ Error creating Jobs",
      mindsdb_jobs_res.error_message,
    );
  } else {
    console.log("✅ Successfully created Jobs");
  }

  exit(0);
} catch (error) {
  console.log(error);
  exit(1);
}
