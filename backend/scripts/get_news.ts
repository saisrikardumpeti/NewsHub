import puppeteer from "puppeteer";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

enum Status {
  OK = "ok",
  ERROR = "error",
}

interface NewsSource {
  id: string | null;
  name: string;
}

interface NewsArticle {
  source: NewsSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsResponse {
  status: Status;
  totalResults: number;
  articles: NewsArticle[];
}

export function extractPlainText(raw: string): string {
  return raw
    .replace(/\\[nrt]/g, " ")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/[\\'"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getNews(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.log(
        `HTTP error! status: ${response.status} ${response.status}`,
      );
      return;
    }
    const data: NewsResponse = await response.json();

    if (data.status === Status.ERROR) {
      console.log("API returned error status");
      return;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      return;
    }

    console.log(
      `Failed to fetch news: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
    return;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sanitizeArticles(data: NewsResponse) {
  let sanitizedArticles = [];
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    for (const news of data.articles) {
      try {
        const page = await browser.newPage();

        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        );

        await page.goto(news.url, {
          waitUntil: "networkidle2",
        });

        await delay(500);

        const content = await page.content();

        await page.close();

        const dom = new JSDOM(content, {
          url: news.url,
        });

        const article = new Readability(dom.window.document).parse();

        if (article?.textContent) {
          sanitizedArticles.push({
            ...news,
            content: extractPlainText(article.textContent),
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(`Error for url: ${news.url} ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error("Browser launch error:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return sanitizedArticles;
}
