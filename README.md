```sh
docker run --name mindsdb -p 47334:47334 -p 47336:47336 -d mindsdb/mindsdb
```

```sh
docker run --name quest-19-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=news_platform -p 5432:5432 -d postgres
```

```
GEMINI_API=
OPENAI_API=

# MindsDB Configuration
MINDSDB_HOST=http://localhost:47334
MINDSDB_USER=
MINDSDB_PASSWORD=
MINDSDB_POSTGRES_HOST= # use ifconfig or ipconfig on windows to get the host like 192.168.X.X

POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=news_platform

DB_URL=postgres://postgres:password@localhost:5432/news_platform

NEWS_API_KEY=
```

```
cd backend
pnpm install
pnpm dev && pnpm db:init

cd quest-19-frontend
pnpm install
pnpm dev
```