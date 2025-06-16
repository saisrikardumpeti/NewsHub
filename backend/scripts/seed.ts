import axios from "axios";
import postgres from "postgres";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { config } from "dotenv";
import { exit } from "process";

config();

export interface NewsType {
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
  publishedat: Date;
  date_added: Date;
}

const sql = postgres(process.env.DB_URL!);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function processNews() {
  try {
    const data: NewsType[] = await sql`
      SELECT * FROM news;
    `;

    console.log(`Processing ${data.length} articles...`);

    for (let i = 0; i < data.length; i++) {
      const news = data[i];
      console.log(`Processing ${i + 1}/${data.length}: ${news.title}`);

      try {
        const response = await axios.get(news.url, {
          timeout: 10000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (response.status !== 200) {
          console.log(
            `Bad status ${response.status} for article ${news.id}, skipping...`,
          );
          continue;
        }

        const dom = new JSDOM(response.data, {
          url: news.url,
        });

        const article = new Readability(dom.window.document).parse();

        if (article?.textContent) {
          await sql`
            UPDATE news
            SET content = ${article.textContent}
            WHERE id = ${news.id}
          `;
          console.log(`✓ Updated article ${news.id}`);
        } else {
          console.log(`✗ No content extracted for article ${news.id}`);
        }
      } catch (error) {
        console.error(`Error processing article ${news.id}:`, error.message);

        if (axios.isAxiosError(error) || error.response?.status === 404) {
          console.log(`Deleting 404 article ${news.id}`);
          await sql`DELETE FROM news WHERE id = ${news.id}`;
        }
      }

      if (i < data.length - 1) {
        await delay(1000);
      }
    }

    console.log("Batch processing complete!");
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await sql.end();
    exit(0);
  }
}

processNews();
