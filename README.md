# NewsHub - AI-Powered News Aggregator 📰

[![YouTube](https://i.ytimg.com/vi/WhLYJTKC7tg/maxresdefault.jpg)](https://youtu.be/WhLYJTKC7tg)

A full-stack news aggregation platform that delivers personalized news
experiences through AI-powered summarization, translation, and intelligent
content curation.

## Demo Videos

### Schematic Search

<video src="https://github.com/user-attachments/assets/c632dbce-3bb4-4146-b377-66a40d8dd992"></video>

### Cross Content Checker (AI Agent)

<video height="250px" src="https://github.com/user-attachments/assets/9f4899ad-0856-4460-a71b-4c67cac18e78"></video>

### Summary Model (AI Tables)

<video height="250px" src="https://github.com/user-attachments/assets/4a9ac973-53c7-42a5-b6e0-e878b4919731"></video>

### Transltion Model (AI Tables)

<video height="250px" src="https://github.com/user-attachments/assets/fb8358a2-b992-4801-964d-e4d49f44021f"></video>

## ✨ Features

- **📰 Multi-Source News Aggregation**: Collect and curate articles from diverse
  news sources
- **🤖 AI-Powered Summaries**: Generate concise summaries using OpenAI and
  Gemini models via MindsDB
- **🌍 Smart Translation**: Multi-language support with AI-powered translation
- **🎨 Modern Interface**: Responsive React UI built with Vite and Tailwind CSS
- **👤 Personalized Experience**: Customizable news sources, categories, and
  preferences
- **🔍 Intelligent Search**: Search articles with instant AI-generated summaries
- **⚡ Real-time Updates**: Stay current with the latest news as it happens
- **🗄️ Robust Storage**: PostgreSQL database for reliable data persistence

## 📁 Project Structure

```
NewsHub/
├── backend/                    # Node.js + TypeScript API Server
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── models/            # Database models
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Auth & validation
│   │   └── utils/             # Helper functions
│   ├── scripts/               # Database & utility scripts
│   ├── .env                   # Environment configuration
│   └── package.json
│
├── quest-19-frontend/         # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API integration
│   │   └── utils/             # Frontend utilities
│   ├── public/                # Static assets
│   └── package.json
│
└── README.md
```

## 🏗️ Architecture

![alt text](.github/architecture.png)

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **pnpm** ([Install Guide](https://pnpm.io/installation))
- **Docker** ([Install Guide](https://docs.docker.com/get-docker/))

### 1. Infrastructure Setup

Start the required services using Docker:

```bash
# Start MindsDB (AI/ML platform)
docker run --name mindsdb \
  --add-host=host.docker.internal:host-gateway \
  -v $PWD/mdb_data:/root/mdb_storage \
  -p 47334:47334 \
  -p 47336:47336 \
  -d mindsdb/mindsdb

# Start PostgreSQL database
docker run --name news_hub_db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=news_platform \
  -v $PWD/db_data/:/var/lib/postgresql/data \
  --add-host=host.docker.internal:host-gateway \
  -p 5432:5432 \
  -d postgres
```

### 2. Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
# API Keys
GEMINI_API=your_gemini_api_key_here
OPENAI_API=your_openai_api_key_here
NEWS_API_KEY=your_news_api_key_here

# MindsDB Configuration
MINDSDB_HOST=http://localhost:47334
MINDSDB_USER=mindsdb
MINDSDB_PASSWORD=

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=news_platform
DB_URL=postgres://postgres:password@localhost:5432/news_platform

# Network Configuration (Replace with your machine's IP)
MINDSDB_POSTGRES_HOST=host.docker.internal
```

### 3. Backend Setup

```bash
cd backend
chmod +x setup-cron.sh
pnpm install
pnpm db:init        # Initialize database schema
pnpm dev            # Start development server

crontab -e
30 2 * * * cd backend && /usr/local/bin/pnpm add_articles # use whereis pnpm to get path

pnpm add_articles   # Seed database with some articles this might take a while
```

### 4. Frontend Setup

```bash
cd quest-19-frontend
pnpm install
pnpm dev        # Start development server
```

## 🔧 Configuration

### API Keys Required

1. **OpenAI API Key**: Get from
   [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Gemini API Key**: Get from
   [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **News API Key**: Get from [NewsAPI.org](https://newsapi.org/register)

## 📝 Available Scripts

### Backend

```bash
pnpm dev            # Start development server
pnpm build          # Build for production
pnpm start          # Start production server
pnpm db:init        # Initialize database
pnpm add_articles   # Seed database with some articles this might take a while
```

### Frontend

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm preview    # Preview production build
pnpm lint       # Run ESLint
```

---

<div style="text-align:center;">

**Built with ❤️ by Sai Srikar Dumpeti**

</div>
